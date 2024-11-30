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
import { BLUE, GRAY, GREEN, LIME, MAGENTA, PINK, PURPLE, RED, Rgb, WHITE } from '../../shared/color'
import { Player } from './player'
import { Waypoint } from '../waypoint'
import { Food } from './food'
import { Tree } from './tree'

export interface OrganismSpawn {
  color: Rgb
  gene: Gene
  player?: Player
}

export interface Obituary extends OrganismSpawn {
  position: Vec2
}

export class Organism extends Actor {
  controlColor = LIME
  chasePoint: Vec2 | undefined
  chaseRadius = 0
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
    position: Vec2
    stage: Stage
  } & OrganismSpawn) {
    super({ stage: props.stage, label: 'organism' })
    this.createdAt = Date.now()
    this.color = props.color
    this.gene = props.gene
    this.player = props.player
    this.spawnPosition = props.position
    this.membrane = this.grow({ gene: this.gene })
    if (this.player != null) {
      this.player.organism = this
    }
    const largerRadii = this.stage.navigation.radii.filter(radius => radius >= this.membrane.radius)
    const indexOfMinimumValue = whichMin(largerRadii)
    const validRadius = largerRadii[indexOfMinimumValue]
    if (validRadius == null) throw new Error('No valid radius found')
    this.navigationRadius = validRadius
    this.stage.navigation.waypoints.forEach(waypoint => {
      const isGrid = waypoint.category === 'grid'
      const isSmallRadius = waypoint.radius === validRadius
      if (isGrid || isSmallRadius) {
        const position = waypoint.position
        const id = this.explorationPoints.length
        const explorationPoint = new ExplorationPoint({ position, id })
        this.explorationPoints.push(explorationPoint)
      }
    })
    this.explorationIds = range(0, this.explorationPoints.length - 1)
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
    radius?: number
  }): Membrane {
    const membrane = new Membrane({ position: props.position, actor: this, radius: props.radius })
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

  getOffset (props: { parent: Membrane, gene: Gene }): Vec2 {
    const parentPosition = props.parent.body.getPosition()
    const radius = this.getRadius({ gene: props.gene })
    const distance = props.parent.radius + radius + this.gap
    const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.gene.angle)
    const offsetPosition = Vec2.add(parentPosition, offset)
    return offsetPosition
  }

  getRadius (props: { gene: Gene }): number {
    const minimumRadius = this.stage.navigation.radii[this.stage.navigation.radii.length - 1]
    const maximumRadius = this.stage.navigation.radii[0]
    const difference = maximumRadius - minimumRadius
    const bonus = difference * props.gene.strength
    const radius = minimumRadius + bonus
    return radius
  }

  hatch = (): void => {
    // if(this.eye.body.getContactList() != null)
    this.hatched = true
    this.stage.destructionQueue.push(this.membrane.body)
    this.spawnPosition = this.membrane.body.getPosition()
    this.membrane = this.grow({ gene: this.gene })
    this.membrane.borderWidth = 0.2
  }

  eggFlee (): void {
    throw new Error('Not implemented')
  }

  grow (props: {
    gene: Gene
    parent?: Membrane
  }): Membrane {
    const position = props.parent == null
      ? this.spawnPosition
      : this.getOffset({ parent: props.parent, gene: props.gene })
    const radius = this.getRadius({ gene: props.gene })
    const membrane = this.addMembrane({
      position,
      cell: props.parent,
      radius
    })
    for (const childBranch of props.gene.branches) {
      this.grow({ gene: childBranch, parent: membrane })
    }
    return membrane
  }

  charge (enemy: Feature): Rgb {
    const enemyPosition = enemy.body.getPosition()
    const navPoint = this.stage.navigation.navigate(this.membrane.position, enemyPosition, this.membrane.radius, enemy.radius)
    const navPosition = navPoint instanceof Vec2 ? navPoint : navPoint.position
    if (this.stage.flags.charge) {
      this.stage.debugLine({
        a: this.membrane.position,
        b: navPosition,
        color: WHITE,
        width: 0.2
      })
    }
    const dirToEnemy = directionFromTo(this.membrane.position, navPosition)
    this.setControls(dirToEnemy)
    this.chasePoint = enemyPosition.clone()
    this.chaseRadius = enemy.radius
    return MAGENTA
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
    if (!this.stage.flags.controlLines) {
      return
    }
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
    const circle = new CircleShape(props.target, this.chaseRadius)
    this.stage.debugCircle({ circle, color: RED })
    range(0, path.length - 2).forEach(index => {
      const currentPoint = path[index]
      const nextPoint = path[index + 1]
      this.stage.debugLine({ a: currentPoint, b: nextPoint, color: GREEN, width: 0.2 })
    })
  }

  explore (stepSize: number): void {
    this.giveUpTimer += stepSize
    const position = this.membrane.body.getPosition()
    this.explorationPoints.forEach(point => {
      const visible = this.stage.vision.isVisible(position, point.position)
      point.visible = visible
      if (visible) point.time = Date.now()
    })
    const targetPoint = this.explorationPoints[this.explorationIds[0]]
    const targetVisible = this.stage.vision.isVisible(position, targetPoint.position)
    if (targetVisible || this.giveUpTimer > this.giveUpTime) {
      this.giveUpTimer = 0
      targetPoint.time = Date.now()
      this.sortExplorationPoints()
    }
  }

  flee (enemy: Feature): Rgb {
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
    const lookDistance = 4
    const lookPoints = sidePoints.map(sidePoint => {
      return Vec2.combine(1, sidePoint, lookDistance, dirFromEnemy)
    })
    const rays = sidePoints.map((sidePoint, i) => {
      return [sidePoint, lookPoints[i]]
    })
    const hitArrays = rays.map(ray => {
      return this.stage.vision.rayCast(ray[0], ray[1])
    })
    if (this.stage.flags.botFlee) {
      hitArrays.forEach((hitArray, i) => {
        const color = hitArray.length === 0 ? WHITE : RED
        this.stage.debugLine({
          a: sidePoints[i],
          b: lookPoints[i],
          color,
          width: 0.2
        })
      })
    }
    const blocked = hitArrays[0].length > 0 || hitArrays[1].length > 0
    if (blocked) {
      const visibleExplorationPoints = this.explorationPoints.filter(point => point.visible)
      const directions = visibleExplorationPoints.map(point => directionFromTo(myPosition, point.position))
      const dotProducts = directions.map(direction => Vec2.dot(direction, dirFromEnemy))
      if (directions.length === 0) return PINK
      const fleeDir = directions[whichMax(dotProducts)]
      this.setControls(fleeDir)
      if (this.stage.flags.botFlee) {
        this.stage.debugLine({
          a: myPosition,
          b: Vec2.combine(1, myPosition, 2, fleeDir),
          color: GREEN,
          width: 0.4
        })
      }
      return PINK
    }
    this.setControls(dirFromEnemy)
    return PINK
  }

  isFeatureReachable (props: {
    feature: Feature
    otherRadius?: number
  }): boolean {
    const position = props.feature.body.getPosition()
    return this.isPointReachable(position, props.otherRadius)
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

  maneuver (): Rgb {
    const sorted = this.sortNearest({ features: this.featuresInVision })
    for (const feature of sorted) {
      const judgement = this.judge({ feature })
      if (judgement == null) {
        this.debugManeuverLine({ color: GRAY, feature })
        continue
      }
      const reachable = this.isFeatureReachable({ feature })
      if (!reachable) {
        this.debugManeuverLine({ color: RED, feature })
        continue
      }
      if (judgement) return this.charge(feature)
      return this.flee(feature)
    }
    if (this.chasePoint != null) {
      const reached = this.isTouching({ point: this.chasePoint })
      if (!reached) {
        const reachable = this.isPointReachable(this.chasePoint, this.chaseRadius)
        if (reachable) {
          return this.navigate({
            debug: this.stage.flags.botChase,
            target: this.chasePoint
          })
        }
      }
      this.chasePoint = undefined
    }
    return this.wander()
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
      const forceScale = this.gene.speed * membrane.body.getMass() * 5
      membrane.force = Vec2.mul(direction, forceScale)
    })
  }

  navigate (props: {
    debug?: boolean
    target: Vec2
  }): Rgb {
    if (props.debug === true) {
      this.debugPath(props)
    }
    const myPosition = this.membrane.body.getPosition()
    const nextPoint = this.stage.navigation.navigate(myPosition, props.target, this.membrane.radius, this.chaseRadius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(myPosition, nextPosition)
    this.setControls(direction)
    return GRAY
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
    const featuresInRange = this.membrane.getFeaturesInRange()
    this.featuresInVision = featuresInRange.filter(targetFeature => {
      const visible = this.membranes.some(membrane => this.stage.vision.isFeatureVisible(membrane, targetFeature))
      return visible
    })
    if (!this.hatched) this.eggFlee()
    if (this.readyToHatch && !this.hatched) this.hatch()
    this.move()
    if (this.stage.flags.organisms) {
      const position = this.membrane.body.getPosition()
      const bigCircle = new CircleShape(position, 0.5)
      this.stage.debugCircle({ circle: bigCircle, color: WHITE })
    }
    if (this.player != null) {
      return
    }
    if (this.stage.flags.players && this.player != null) {
      const circle = new CircleShape(this.membrane.body.getPosition(), 0.3)
      this.stage.debugCircle({
        circle,
        color: PURPLE
      })
      return
    }
    this.explore(props.stepSize)
    this.controlColor = this.maneuver()
  }

  reproduce (): void {
    const gene = this.gene.mutate()
    const bot = this.stage.addOrganism({
      color: this.color,
      gene,
      position: this.membrane.position
    })
    const half = this.membrane.maximumHealth / 2
    bot.membrane.hungerDamage = half
    this.membrane.hungerDamage = half
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
        const nearestPoint = this.stage.vision.getNearestPoint(sourcePoint, feature, shape)
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
      const circle = new CircleShape(end, this.membrane.radius)
      this.stage.debugCircle({ circle, color: RED })
    }
    const nextPoint = this.stage.navigation.navigate(this.membrane.position, end, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const directionToNext = directionFromTo(this.membrane.position, nextPosition)
    this.setControls(directionToNext)
    return BLUE
  }
}
