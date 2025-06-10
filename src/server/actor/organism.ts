import { CircleShape, PolygonShape, RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Membrane } from '../feature/membrane'
import { directionFromTo, range, rotate, whichMax, whichMin } from '../math'
import { Egg } from '../feature/egg'
import { Feature } from '../feature/feature'
import { Rope } from '../../shared/rope'
import { Starvation } from '../death/starvation'
import { ExplorationPoint } from '../explorationPoint'
import { Controls } from '../../shared/input'
import { Gene } from '../gene'
import { BLUE, COLOR, GRAY, GREEN, LIME, MAGENTA, PINK, PURPLE, RED, Rgb, WHITE } from '../../shared/color'
import { Player } from './player'
import { Waypoint } from '../waypoint'
import { Food } from './food'
import { Tree } from './tree'
import { SIGHT } from '../../shared/sight'
import { RayCastHit } from '../../shared/rayCastHit'

export interface OrganismSpawn {
  color: Rgb
  gene: Gene
  player?: Player
}

export interface Obituary extends OrganismSpawn {
  position: Vec2
}

export class Organism extends Actor {
  static BLOCKED_DISTANCE = 4
  static TRAPPED_DISTANCE = 0.5 * Organism.BLOCKED_DISTANCE
  static GENETIC_FORCE_SCALE = 1.5
  static MINIMUM_FORCE = 0.7
  controlColor = LIME
  chasePoint: Vec2 | undefined
  chaseRadius = 0.2
  giveUpTime: number
  giveUpTimer = 0
  color: Rgb
  createdAt: number
  controls: Controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    select: false,
    cancel: false
  }

  visibleWaypoints: Waypoint[] = []
  explorationIds: number[]
  explorationPoints: ExplorationPoint[] = []
  dead = false
  featuresInVision: Feature[] = []
  gap = 0.5
  gene: Gene
  hatched = true
  membrane: Membrane
  membranes: Membrane[] = []
  north = Vec2(0, 1)
  player?: Player
  navigationRadius: number
  readyToHatch = false
  respawning = false
  spawnPosition: Vec2

  constructor (props: {
    health?: number
    position: Vec2
    stage: Stage
  } & OrganismSpawn) {
    super({ stage: props.stage, label: 'organism' })
    this.createdAt = Date.now()
    this.color = props.color
    this.gene = props.gene
    this.player = props.player
    this.spawnPosition = props.position
    this.membrane = this.grow({ gene: this.gene, health: props.health })
    if (this.player != null) {
      this.player.organism = this
    }
    const largerRadii = this.stage.navigation.radii.filter(radius => radius >= this.membrane.radius)
    const indexOfMinimumValue = whichMin(largerRadii)
    const validRadius = largerRadii[indexOfMinimumValue]
    if (validRadius == null) throw new Error('No valid radius found')
    this.navigationRadius = validRadius
    const waypointArray = Object.values(this.stage.navigation.waypoints)
    waypointArray.forEach(waypoint => {
      const isGrid = waypoint.category === 'grid'
      const isSmallRadius = waypoint.radius === validRadius
      if (isGrid || isSmallRadius) {
        const position = waypoint.position
        const explorationPoint = new ExplorationPoint({ position, id: waypoint.id })
        this.explorationPoints[waypoint.id] = explorationPoint
      }
    })
    this.explorationIds = this.explorationPoints.map(p => p.id)
    this.sortExplorationPoints()
    this.giveUpTime = 30 / this.gene.speed
  }

  addCircles (props: {
    gene: Gene
    circles: CircleShape[]
    parentPosition?: Vec2
    parentRadius?: number
  }): void {
    let center = this.spawnPosition
    const radius = this.getRadius({ gene: props.gene })
    if (props.parentPosition != null && props.parentRadius != null) {
      const distance = props.parentRadius + radius + this.gap
      const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.gene.angle)
      center = Vec2.add(props.parentPosition, offset)
    }
    const circle = new CircleShape(center, radius)
    props.circles.push(circle)
    for (const childBranch of props.gene.branches) {
      this.addCircles({
        gene: childBranch,
        parentPosition: circle.getCenter(),
        parentRadius: circle.getRadius(),
        circles: props.circles
      })
    }
  }

  addMembrane (props: {
    position: Vec2
    cell?: Membrane
    health?: number
    radius?: number
  }): Membrane {
    const membrane = new Membrane({
      radius: props.radius,
      health: props.health,
      position: props.position,
      actor: this
    })
    if (props.cell != null) {
      const cellPosition = props.cell.body.getPosition()
      const maxLength = Vec2.distance(props.position, cellPosition)
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: membrane.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength
      })
      this.joints.push(joint)
      const ropeA = joint.getBodyA().getPosition()
      const ropeB = joint.getBodyB().getPosition()
      const rope: Rope = { a: ropeA, b: ropeB }
      props.cell.ropes.push(rope)
      membrane.ropes.push(rope)
      this.stage.world.createJoint(joint)
    }
    this.membranes.push(membrane)
    this.features.push(membrane)
    return membrane
  }

  destroy (): void {
    super.destroy()
    if (this.player != null) {
      this.player.organism = undefined
    }
  }

  charge (enemy: Feature): Rgb {
    const enemyPosition = enemy.body.getPosition()
    const navPoint = this.stage.navigation.navigate(this.membrane.position, enemyPosition, this.membrane.radius, enemy.radius, this.stage.flags.charge)
    const navPosition = navPoint instanceof Vec2 ? navPoint : navPoint.position
    if (this.stage.flags.charge) {
      this.debugPath({ target: enemyPosition })
      this.stage.debugLine({
        a: this.membrane.position,
        b: navPosition,
        color: WHITE,
        width: 0.2
      })
    }
    const dirToEnemy = directionFromTo(this.membrane.position, navPosition)
    const targetVelocity = Vec2.mul(10, dirToEnemy)
    const moveDir = Vec2.sub(targetVelocity, this.membrane.body.getLinearVelocity())
    this.setControls(moveDir)
    this.chasePoint = enemyPosition.clone()
    this.chaseRadius = enemy.radius
    return MAGENTA
  }

  chase (props: {
    debug?: boolean
    target: Vec2
  }): Rgb {
    const chaseStart = performance.now()
    if (props.debug === true) {
      this.debugPath(props)
    }
    const myPosition = this.membrane.body.getPosition()
    const nearWaypointEnd = this.stage.navigation.getNearWaypoint(props.target)
    const nearWaypointStart = this.stage.navigation.getNearWaypoint(myPosition)
    const nextPoint = this.stage.navigation.navigate(myPosition, props.target, this.membrane.radius, this.chaseRadius)
    if (this.stage.flags.botChase) {
      this.stage.log({ v: `start: ${nearWaypointStart.id}, end: ${nearWaypointEnd.id}` })
      this.stage.debugCircle({
        circle: new CircleShape(props.target, 0.3),
        color: COLOR.ORANGE
      })
      this.stage.debugCircle({
        circle: new CircleShape(nearWaypointEnd.position, 0.3),
        color: COLOR.MAGENTA
      })
      this.stage.debugCircle({
        circle: new CircleShape(nearWaypointStart.position, 0.3),
        color: COLOR.LIME
      })
    }
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(myPosition, nextPosition)
    this.setControls(direction)
    this.stage.runner.endTiming({ key: 'chase', start: chaseStart })
    return GRAY
  }

  debugControlLine (props: {
    point: Vec2
  }): void {
    this.stage.debugLine({
      a: this.membrane.position,
      b: props.point,
      color: this.controlColor,
      width: 0.2
    })
  }

  debugControls (): void {
    const circle = new CircleShape(this.membrane.position, 0.2)
    this.stage.debugCircle({ circle, color: this.controlColor })
    const length = 1
    if (this.controls.up) {
      const point = Vec2(this.membrane.position.x, this.membrane.position.y + length)
      this.debugControlLine({ point })
    }
    if (this.controls.down) {
      const point = Vec2(this.membrane.position.x, this.membrane.position.y - length)
      this.debugControlLine({ point })
    }
    if (this.controls.left) {
      const point = Vec2(this.membrane.position.x - length, this.membrane.position.y)
      this.debugControlLine({ point })
    }
    if (this.controls.right) {
      const point = Vec2(this.membrane.position.x + length, this.membrane.position.y)
      this.debugControlLine({ point })
    }
  }

  debugManeuverLine (props: {
    color: Rgb
    feature: Feature
  }): void {
    if (!this.stage.flags.maneuverLines) {
      return
    }
    const b = props.feature.body.getPosition()
    this.debugLine({ color: GRAY, b, width: 0.05 })
  }

  debugLine (props: {
    color: Rgb
    b: Vec2
    width: number
  }): void {
    this.stage.debugLine({
      a: this.membrane.body.getPosition(),
      ...props
    })
  }

  debugPath (props: {
    target: Vec2
  }): void {
    const path = this.stage.navigation.getPath({
      a: this.membrane.position,
      b: props.target,
      radius: this.membrane.radius,
      otherRadius: this.chaseRadius
    })
    if (path.length < 2) {
      throw new Error('Path is too short')
    }
    const circle = new CircleShape(props.target, 0.1)
    this.stage.debugCircle({ circle, color: RED })
    range(0, path.length - 2).forEach(index => {
      const currentPoint = path[index]
      const nextPoint = path[index + 1]
      this.stage.debugLine({ a: currentPoint, b: nextPoint, color: GREEN, width: 0.2 })
    })
  }

  eggFlee (): void {
    throw new Error('Not implemented')
  }

  explore (stepSize: number): void {
    const exploreVisibleStart = performance.now()
    this.giveUpTimer += stepSize
    const position = this.membrane.body.getPosition()
    const i = position.x / this.stage.navigation.xStep
    const j = position.y / this.stage.navigation.yStep
    const iMin = Math.floor(i - SIGHT.halfWidth / this.stage.navigation.xStep)
    const iMax = Math.ceil(i + SIGHT.halfWidth / this.stage.navigation.xStep)
    const jMin = Math.floor(j - SIGHT.halfHeight / this.stage.navigation.yStep)
    const jMax = Math.ceil(j + SIGHT.halfHeight / this.stage.navigation.yStep)
    this.visibleWaypoints = []
    range(iMin, iMax).forEach(i => {
      const row = this.stage.navigation.waypointMatrix[i]
      if (row == null) return
      range(jMin, jMax).forEach(j => {
        const waypoint = row[j]
        if (waypoint == null) return
        this.visibleWaypoints.push(waypoint)
      })
    })
    this.visibleWaypoints.forEach(waypoint => {
      const explorationPoint = this.explorationPoints[waypoint.id]
      this.stage.checkCount += 1
      const isVisibleStart = performance.now()
      this.stage.runner.endTiming({
        key: '> > isVisible', start: isVisibleStart
      })
      explorationPoint.time = Date.now()
    })
    // this.explorationPoints.forEach(point => {
    //   this.stage.checkCount += 1
    //   const isVisibleStart = performance.now()
    //   const visible = this.stage.vision.isVisible(position, point.position)
    //   this.stage.runner.endTiming({
    //     key: '> > isVisible', start: isVisibleStart
    //   })
    //   point.visible = visible
    //   if (visible) point.time = Date.now()
    // })
    const isVisibleEnd = this.stage.runner.endTiming({
      key: '> exploreVisible', start: exploreVisibleStart
    })
    const targetPoint = this.explorationPoints[this.explorationIds[0]]
    const targetVisible = this.stage.vision.isVisible(position, targetPoint.position)
    if (targetVisible || this.giveUpTimer > this.giveUpTime) {
      this.giveUpTimer = 0
      targetPoint.time = Date.now()
      const sortStart = performance.now()
      this.sortExplorationPoints()
      this.stage.runner.endTiming({ key: 'sort', start: sortStart })
    }
    this.stage.runner.endTiming({ key: 'target', start: isVisibleEnd })
  }

  flee (enemy: Feature): Rgb {
    const fleeDir = this.getFleeDir(enemy)
    if (this.stage.flags.botFlee) {
      this.stage.debugLine({
        a: this.membrane.position,
        b: Vec2.combine(1, this.membrane.position, 2, fleeDir),
        color: PINK,
        width: 0.2
      })
    }
    this.setControls(fleeDir)
    return PINK
  }

  // destroyMembrane (props: {
  //   membrane: Membrane
  // }): void {
  //   // this.membranes = this.membranes.filter(membrane => membrane !== props.membrane)
  //   this.membranes = this.membranes.filter(membrane => {
  //     const destroyed = membrane === props.membrane
  //     if (destroyed) {
  //       membrane.destroy()
  //       return false
  //     }
  //     return true
  //   })
  //   this.features = this.features.filter(feature => feature !== props.membrane)
  //   this.stage.world.destroyBody(props.membrane.body)
  // }

  getEgg (): Egg {
    const circles: CircleShape[] = []
    this.addCircles({ gene: this.gene, circles })
    const top = Math.max(...circles.map(circle => circle.getCenter().y + circle.getRadius()))
    const bottom = Math.min(...circles.map(circle => circle.getCenter().y - circle.getRadius()))
    const right = Math.max(...circles.map(circle => circle.getCenter().x + circle.getRadius()))
    const left = Math.min(...circles.map(circle => circle.getCenter().x - circle.getRadius()))
    const position = Vec2(0.5 * right + 0.5 * left, 0.5 * top + 0.5 * bottom)
    const hx = 0.5 * (right - left)
    const hy = 0.5 * (top - bottom)
    return new Egg({ actor: this, position, hx, hy })
  }

  getFleeDir (enemy: Feature): Vec2 {
    const enemyPosition = enemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    const dirFromEnemy = directionFromTo(enemyPosition, myPosition)
    const perps = [
      rotate(dirFromEnemy, +0.5 * Math.PI),
      rotate(dirFromEnemy, -0.5 * Math.PI)
    ]
    const sidePoints = perps.map(perp => {
      return Vec2.combine(1, myPosition, this.membrane.radius, perp)
    })
    const lookPoints = sidePoints.map(sidePoint => {
      return Vec2.combine(1, sidePoint, Organism.BLOCKED_DISTANCE, dirFromEnemy)
    })
    const rays = sidePoints.map((sidePoint, i) => {
      return [sidePoint, lookPoints[i]]
    })
    const hits = rays.map(ray => {
      return this.stage.vision.rayCast(ray[0], ray[1])
    })
    if (this.stage.flags.botFlee) {
      hits.forEach((hitArray, i) => {
        const blocked = this.isHitBlocked({ hit: hitArray })
        const color = blocked ? RED : WHITE
        this.stage.debugLine({
          a: sidePoints[i],
          b: lookPoints[i],
          color,
          width: 0.2
        })
      })
    }
    const blocked = hits.some(hit => this.isHitBlocked({ hit }))
    if (blocked) {
      const cardinals = [
        new Vec2(0, 1),
        new Vec2(0, -1),
        new Vec2(1, 0),
        new Vec2(-1, 0)
      ]
      const cardinalDots = cardinals.map(c => Vec2.dot(c, dirFromEnemy))
      const wallDir = cardinals[whichMax(cardinalDots)]
      const options = [
        rotate(wallDir, 0.6 * Math.PI),
        rotate(wallDir, -0.6 * Math.PI)
      ]
      const optionDots = options.map(o => Vec2.dot(o, dirFromEnemy))
      const flatFleeDir = options[whichMax(optionDots)]
      const lookPoint = Vec2.combine(1, myPosition, Organism.BLOCKED_DISTANCE, flatFleeDir)
      const flatFleeHits = this.stage.vision.rayCast(myPosition, lookPoint)
      const flatFleeBlocked = this.isHitBlocked({ hit: flatFleeHits })
      if (this.stage.flags.botFlee) {
        const color = flatFleeBlocked ? RED : WHITE
        this.stage.debugLine({
          a: myPosition,
          b: lookPoint,
          color,
          width: 0.2
        })
      }
      if (!flatFleeBlocked) {
        return flatFleeDir
      }
      const openCardinals = cardinals.filter(cardinal => {
        const cardinalPoint = Vec2.combine(1, myPosition, Organism.TRAPPED_DISTANCE, cardinal)
        const cardinalHits = this.stage.vision.rayCast(myPosition, cardinalPoint)
        const blocked = this.isHitBlocked({ hit: cardinalHits })
        if (this.stage.flags.botFlee) {
          const color = blocked ? RED : WHITE
          this.stage.debugLine({
            a: myPosition,
            b: cardinalPoint,
            color,
            width: 0.2
          })
        }
        return !blocked
      })
      if (openCardinals.length === 0) {
        return dirFromEnemy
      }
      const openCardinalDots = openCardinals.map(c => Vec2.dot(c, dirFromEnemy))
      const bestCardinalDir = openCardinals[whichMax(openCardinalDots)]
      const blockedHits = hits.filter(hit => this.isHitBlocked({ hit }))
      const blockPoint = blockedHits.flat()[0].point
      const unblockDir = directionFromTo(blockPoint, myPosition)
      const trappedFleeDir = Vec2.combine(0.5, bestCardinalDir, 0.5, unblockDir)
      return trappedFleeDir
    }
    return dirFromEnemy
  }

  getOffset (props: { parent: Membrane, gene: Gene }): Vec2 {
    const parentPosition = props.parent.body.getPosition()
    const radius = this.getRadius({ gene: props.gene })
    const distance = props.parent.radius + radius + this.gap
    const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.gene.angle)
    const offsetPosition = Vec2.add(parentPosition, offset)
    return offsetPosition
  }

  getRadius (props: { gene: Gene }): number {
    const difference = this.stage.navigation.bigRadius - this.stage.navigation.smallRadius
    const bonus = difference * props.gene.strength
    const radius = this.stage.navigation.smallRadius + bonus
    return radius
  }

  grow (props: {
    gene: Gene
    health?: number
    parent?: Membrane
  }): Membrane {
    const position = props.parent == null
      ? this.spawnPosition
      : this.getOffset({ parent: props.parent, gene: props.gene })
    const radius = this.getRadius({ gene: props.gene })
    const membrane = this.addMembrane({
      position,
      cell: props.parent,
      health: props.health,
      radius
    })
    for (const childBranch of props.gene.branches) {
      this.grow({ gene: childBranch, parent: membrane })
    }
    return membrane
  }

  hatch = (): void => {
    // if(this.eye.body.getContactList() != null)
    this.hatched = true
    this.stage.destructionQueue.push(this.membrane.body)
    this.spawnPosition = this.membrane.body.getPosition()
    this.membrane = this.grow({ gene: this.gene })
    this.membrane.borderWidth = 0.2
  }

  isFeatureReachable (props: {
    feature: Feature
    otherRadius?: number
  }): boolean {
    const position = props.feature.body.getPosition()
    return this.isPointReachable(position, props.otherRadius)
  }

  isHitBlocked (props: {
    hit: RayCastHit[]
  }): boolean {
    if (props.hit.length === 0) return false
    const other = props.hit.some(hit => {
      if (hit.feature == null) {
        throw new Error('Hit feature is undefined')
      }
      if (hit.feature.actor instanceof Food) {
        return false
      }
      return hit.feature !== this.membrane
    })
    return other
  }

  isPointReachable (end: Vec2, otherRadius?: number): boolean {
    return this.stage.navigation.isPointReachable(this.membrane.position, end, this.membrane.radius, otherRadius)
  }

  isTouching (props: {
    point: Vec2
  }): boolean {
    const myPosition = this.membrane.body.getPosition()
    const distance = Vec2.distance(myPosition, props.point)
    const reachDistance = this.membrane.radius + this.chaseRadius
    const reached = distance < reachDistance
    return reached
  }

  judge ({ feature }: { feature: Feature }): boolean | undefined {
    if (feature instanceof Membrane) {
      const allied = feature.color === this.color
      if (allied) return undefined
      const theirMass = feature.body.getMass()
      const myMass = this.membrane.body.getMass()
      const tied = theirMass === myMass
      if (tied) return undefined
      const theirJaw = this.membrane.getJaw({ target: feature })
      const myJaw = feature.getJaw({ target: this.membrane })
      const prey = myJaw > theirJaw
      return prey
    } else if (feature.actor instanceof Tree) {
      const unhealthy = feature.health < 0.1
      if (unhealthy) return undefined
      return true
    } else if (feature.actor instanceof Food) {
      return true
    }
    return undefined
  }

  maneuver (props: {
    sortedVisibleFeatures: Feature[]
  }): Rgb {
    const start = performance.now()
    for (const feature of props.sortedVisibleFeatures) {
      const maneuverStepStart = performance.now()
      const judgement = this.judge({ feature })
      this.stage.runner.endTiming({
        key: '> > judge', start: maneuverStepStart
      })
      if (judgement == null) {
        this.debugManeuverLine({ color: GRAY, feature })
        this.stage.runner.endTiming({
          key: 'maneuverStep', start: maneuverStepStart
        })
        continue
      }
      if (judgement) {
        const chargeStart = performance.now()
        const color = this.charge(feature)
        this.stage.runner.endTiming({
          key: '> > charge', start: chargeStart
        })
        this.stage.runner.endTiming({
          key: 'maneuverStep', start: maneuverStepStart
        })
        this.stage.runner.endTiming({
          key: '> maneuver targets', start
        })
        return color
      }
      const fleeStart = performance.now()
      const color = this.flee(feature)
      this.stage.runner.endTiming({
        key: '> > flee', start: fleeStart
      })
      this.stage.runner.endTiming({
        key: 'maneuverStep', start: maneuverStepStart
      })
      this.stage.runner.endTiming({
        key: '> maneuver targets', start
      })
      return color
    }
    const maneuverTargetsEnd = this.stage.runner.endTiming({
      key: '> maneuver targets', start
    })
    if (this.chasePoint != null) {
      const reached = this.isTouching({ point: this.chasePoint })
      if (!reached) {
        const reachable = this.isPointReachable(this.chasePoint, this.chaseRadius)
        if (reachable) {
          return this.chase({
            debug: this.stage.flags.botChase,
            target: this.chasePoint
          })
        }
      }
      this.chasePoint = undefined
    }
    const color = this.wander()
    this.stage.runner.endTiming({
      key: '> maneuver memory', start: maneuverTargetsEnd
    })
    return color
  }

  move (): void {
    let x = 0
    let y = 0
    if (this.controls.up) y += 1
    if (this.controls.down) y -= 1
    if (this.controls.left) x -= 1
    if (this.controls.right) {
      x += 1
    }
    const direction = Vec2(x, y)
    direction.normalize()
    if (!this.dead && this.membranes.length === 0) {
      throw new Error('This organism has no membranes')
    }
    this.membranes.forEach(membrane => {
      const myMass = membrane.body.getMass()
      const speedFactor = Math.pow(this.gene.speed, 1)
      const geneticForce = Organism.GENETIC_FORCE_SCALE * speedFactor
      const combinedForce = Organism.MINIMUM_FORCE + geneticForce
      const scaledForce = combinedForce * myMass
      membrane.force = Vec2.mul(direction, scaledForce)
    })
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
    const visionStart = performance.now()
    const playing = this.player != null
    const featuresInRange = this.membrane.getFeaturesInRange({ playing })
    this.featuresInVision = featuresInRange.filter(targetFeature => {
      const visible = this.membranes.some(membrane => this.stage.vision.isFeatureVisible(membrane, targetFeature))
      return visible
    })
    const visionEnd = this.stage.runner.endTiming({ key: 'vision', start: visionStart })
    if (!this.hatched) this.eggFlee()
    if (this.readyToHatch && !this.hatched) this.hatch()
    this.move()
    if (this.stage.flags.organisms) {
      const position = this.membrane.body.getPosition()
      const bigCircle = new CircleShape(position, 0.5)
      this.stage.debugCircle({ circle: bigCircle, color: WHITE })
    }
    if (this.stage.flags.players) {
      const circle = new CircleShape(this.membrane.body.getPosition(), 0.3)
      this.stage.debugCircle({
        circle,
        color: PURPLE
      })
      return
    }
    if (this.player != null) {
      if (this.stage.flags.navigation && this.stage.flags.playerNavigation) {
        const nearWaypoint = this.stage.navigation.getNearWaypoint(this.membrane.position)
        const waypointArray = Object.values(this.stage.navigation.waypoints)
        const maxId = Math.max(...waypointArray.map(w => w.id))
        const targetWaypoint = this.stage.navigation.waypoints[maxId]
        this.stage.debugCircle({
          circle: new CircleShape(nearWaypoint.position, 0.3),
          color: COLOR.ORANGE
        })
        this.stage.debugCircle({
          circle: new CircleShape(targetWaypoint.position, 0.3),
          color: COLOR.ORANGE
        })
        const path = this.stage.navigation.getPath({
          a: nearWaypoint.position,
          b: targetWaypoint.position,
          radius: this.membrane.radius
        })
        path.forEach((point, i) => {
          this.stage.debugCircle({
            circle: new CircleShape(point, 0.3),
            color: COLOR.ORANGE
          })
          if (i > 0) {
            this.stage.debugLine({
              a: path[i - 1],
              b: path[i],
              color: COLOR.ORANGE
            })
          }
        })
      }
      return
    }
    const movementEnd = this.stage.runner.endTiming({
      key: 'movement', start: visionEnd
    })
    this.explore(props.stepSize)
    const exploreEnd = this.stage.runner.endTiming({
      key: 'explore', start: movementEnd
    })
    const sorted = this.sortNearest({ features: this.featuresInVision })
    const sortNearestEnd = this.stage.runner.endTiming({
      key: 'sortNearest', start: exploreEnd
    })
    this.controlColor = this.maneuver({ sortedVisibleFeatures: sorted })
    this.stage.runner.endTiming({
      key: 'maneuver', start: sortNearestEnd
    })
  }

  reproduce (props: {
    health: number
  }): void {
    if (!this.stage.flags.reproduceGame) return
    const gene = this.gene.mutate()
    const bot = this.stage.addOrganism({
      color: this.color,
      gene,
      position: this.membrane.position
    })
    const half = this.membrane.maximumHealth / 2
    bot.membrane.hungerDamage = half
    const childHungerDamage = half - props.health
    this.membrane.hungerDamage = Math.max(0, childHungerDamage)
    // TODO maintain combat damage
    this.membrane.combatDamage = 0
  }

  setControls (direction: Vec2): void {
    const root2over2 = Math.sqrt(2) / 2
    const roundDirs = [
      Vec2(+1, +0),
      Vec2(-1, +0),
      Vec2(+0, +1),
      Vec2(+0, -1),
      Vec2(+root2over2, +root2over2),
      Vec2(+root2over2, -root2over2),
      Vec2(-root2over2, +root2over2),
      Vec2(-root2over2, -root2over2)
    ]
    const dotProducts = roundDirs.map(roundDir => Vec2.dot(roundDir, direction))
    const whichMaxDot = whichMax(dotProducts)
    const roundDir = roundDirs[whichMaxDot]
    this.controls.up = roundDir.y > 0
    this.controls.down = roundDir.y < 0
    this.controls.left = roundDir.x < 0
    this.controls.right = roundDir.x > 0
    if (!this.stage.flags.controlLines) {
      return
    }
    this.debugControls()
  }

  sortExplorationPoints (): void {
    const distances = this.explorationIds.map(i => {
      const point = this.explorationPoints[i]
      const distance = Vec2.distance(this.membrane.position, point.position)
      return distance
    })
    this.explorationIds.sort((a, b) => {
      return distances[b] - distances[a]
    })
    this.explorationIds.sort((a, b) => {
      const pointA = this.explorationPoints[a]
      const pointB = this.explorationPoints[b]
      return pointA.time - pointB.time
    })
  }

  sortNearest (props: {
    features: Feature[]
  }): Feature[] {
    const myPosition = this.membrane.body.getPosition()
    const distances = props.features.map(feature => {
      const sourcePoint = feature.body.getPosition()
      const shape = feature.fixture.getShape()
      if (shape instanceof PolygonShape) {
        const nearestPoint = this.stage.vision.getNearestPoint({
          sourcePoint, targetFeature: feature, targetPolygon: shape
        })
        const distance = Vec2.distance(nearestPoint, myPosition)
        return {
          distance,
          feature
        }
      }
      const distance = Vec2.distance(sourcePoint, myPosition)
      const centerToEdge = distance - feature.radius
      return {
        distance: centerToEdge,
        feature
      }
    })
    const sorted = distances.sort((a, b) => a.distance - b.distance)
    const features = sorted.map(pair => pair.feature)
    return features
  }

  starve (props: {
    membrane: Membrane
  }): void {
    const starvation = new Starvation({
      stage: this.stage,
      victim: props.membrane
    })
    this.stage.starvationQueue.push(starvation)
  }

  wander (): Rgb {
    const wanderStart = performance.now()
    const explorationId = this.explorationIds[0]
    const explorationPoint = this.explorationPoints[explorationId]
    const end = explorationPoint.position
    if (this.stage.flags.botPath) {
      const path = this.stage.navigation.getPath({
        a: this.membrane.position,
        b: end,
        radius: this.membrane.radius
      })
      range(0, path.length - 2).forEach(index => {
        const currentPoint = path[index]
        const nextPoint = path[index + 1]
        this.stage.debugLine({ a: currentPoint, b: nextPoint, color: WHITE, width: 0.1 })
      })
      const circle = new CircleShape(end, 0.2)
      this.stage.debugCircle({ circle, color: RED })
    }
    // const pathDistance = this.stage.navigation.getPathDistance(this.membrane.position, end, this.membrane.radius)
    // const toLong = 10 * Math.max(this.stage.halfWidth, this.stage.halfHeight)
    // if (pathDistance > toLong) {
    //   throw new Error('Path is too long')
    // }
    const nextPoint = this.stage.navigation.navigate(this.membrane.position, end, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const directionToNext = directionFromTo(this.membrane.position, nextPosition)
    this.setControls(directionToNext)
    this.stage.runner.endTiming({ key: 'wander', start: wanderStart })
    return BLUE
  }
}
