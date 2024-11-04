import { CircleShape, RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Membrane } from '../feature/membrane'
import { choose, range, rotate, whichMin } from '../math'
import { Egg } from '../feature/egg'
import { Feature } from '../feature/feature'
import { Rope } from '../../shared/rope'
import { Starvation } from '../starvation'
import { ExplorationPoint } from '../explorationPoint'
import { Controls } from '../../shared/input'
import { Gene } from '../gene'

export class Organism extends Actor {
  dead = false
  featuresInVision: Feature[] = []
  gap = 0.5
  hatched = true
  membrane: Membrane
  membranes: Membrane[] = []
  north = Vec2(0, 1)
  radius: number
  readyToHatch = false
  spawnPosition: Vec2
  gene: Gene
  explorationPoints: ExplorationPoint[] = []
  explorationIds: number[]
  controls: Controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    select: false,
    cancel: false
  }

  constructor (props: {
    stage: Stage
    position: Vec2
    gene: Gene
  }) {
    super({ stage: props.stage, label: 'organism' })
    this.spawnPosition = props.position
    this.gene = props.gene
    this.membrane = this.grow({ branch: this.gene })
    const largerRadii = this.stage.navigation.radii.filter(radius => radius >= this.membrane.radius)
    const indexOfMinimumValue = whichMin(largerRadii)
    const validRadius = largerRadii[indexOfMinimumValue]
    if (validRadius == null) throw new Error('No valid radius found')
    this.radius = validRadius
    this.stage.navigation.waypoints.forEach(waypoint => {
      const isGrid = waypoint.category === 'grid'
      const isSmallRadius = waypoint.radius === validRadius
      if (isGrid || isSmallRadius) {
        const position = waypoint.position
        const id = this.explorationPoints.length
        this.explorationPoints.push(new ExplorationPoint({ position, id }))
      }
    })
    this.explorationIds = range(0, this.explorationPoints.length - 1)
    this.sortExplorationPoints()
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
      const forceScale = membrane.acceleration * membrane.body.getMass() * 2
      membrane.force = Vec2.mul(direction, forceScale)
    })
  }

  sortExplorationPoints (): void {
    const position = this.membrane.body.getPosition()
    const distances = this.explorationIds.map(i => {
      const point = this.explorationPoints[i]
      const distance = Vec2.distance(position, point.position)
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

  addCircles (props: {
    gene: Gene
    circles: CircleShape[]
    parentPosition?: Vec2
    parentRadius?: number
  }): void {
    let center = this.spawnPosition
    if (props.parentPosition != null && props.parentRadius != null) {
      const distance = props.parentRadius + props.gene.radius + this.gap
      const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.gene.angle)
      center = Vec2.add(props.parentPosition, offset)
    }
    const circle = new CircleShape(center, props.gene.radius)
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
      const maxLength = Vec2.distance(props.position, props.cell.body.getPosition())
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

  destroyMembrane (props: {
    membrane: Membrane
  }): void {
    // this.membranes = this.membranes.filter(membrane => membrane !== props.membrane)
    this.membranes = this.membranes.filter(membrane => {
      const destroyed = membrane === props.membrane
      if (destroyed) {
        membrane.destroy()
        return false
      }
      return true
    })
    this.features = this.features.filter(feature => feature !== props.membrane)
    this.stage.world.destroyBody(props.membrane.body)
  }

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

  getOffset (props: { parent: Membrane, branch: Gene }): Vec2 {
    const parentPosition = props.parent.body.getPosition()
    const distance = props.parent.radius + props.branch.radius + this.gap
    const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.branch.angle)
    const offsetPosition = Vec2.add(parentPosition, offset)
    return offsetPosition
  }

  getRadius (): number {
    return this.membrane.radius
  }

  hatch = (): void => {
    // if(this.eye.body.getContactList() != null)
    this.hatched = true
    this.stage.destructionQueue.push(this.membrane.body)
    this.spawnPosition = this.membrane.body.getPosition()
    this.membrane = this.grow({ branch: this.gene })
    this.membrane.borderWidth = 0.2
  }

  eggFlee (): void { }

  grow (props: {
    branch: Gene
    parent?: Membrane
  }): Membrane {
    const position = props.parent == null
      ? this.spawnPosition
      : this.getOffset({ parent: props.parent, branch: props.branch })
    const membrane = this.addMembrane({
      position,
      cell: props.parent,
      radius: props.branch.radius
    })
    for (const childBranch of props.branch.branches) {
      this.grow({ branch: childBranch, parent: membrane })
    }
    return membrane
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
    const featuresInRange = this.membrane.getFeaturesInRange()
    this.featuresInVision = featuresInRange.filter(targetFeature => {
      const visible = this.membranes.some(membrane => this.stage.vision.isFeatureVisible(membrane, targetFeature))
      return visible
    })
    if (!this.hatched) this.eggFlee()
    if (this.readyToHatch && !this.hatched) this.hatch()
    this.move()
  }

  respawn (): boolean {
    this.invincibleTime = 0
    const clearSpawnPoints = this.stage.spawnPoints.filter(spawnPoint => {
      const circle = new CircleShape(spawnPoint, this.getRadius())
      return this.stage.getFeaturesInShape(circle).length === 0
    })
    if (clearSpawnPoints.length === 0) {
      return false
    }
    const spawnPoint = choose(clearSpawnPoints)
    this.spawnPosition = spawnPoint
    this.membrane = this.grow({ branch: this.gene })
    this.dead = false
    return true
  }

  starve (props: {
    membrane: Membrane
  }): void {
    this.features.forEach(feature => {
      if (feature instanceof Membrane) {
        this.destroyMembrane({ membrane: feature })
      }
    })
    this.stage.starvationQueue.push(new Starvation({
      stage: this.stage,
      victim: props.membrane
    }))
    this.dead = true
  }
}
