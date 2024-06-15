import { CircleShape, RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Membrane } from '../feature/membrane'
import { choose, rotate } from '../math'
import { Egg } from '../feature/egg'
import { Feature } from '../feature/feature'
import { Rope } from '../../shared/rope'
import { Starvation } from '../starvation'

interface Branch {
  angle: number
  radius: number
  branches: Branch[]
}

export class Player extends Actor {
  dead = false
  membrane: Membrane
  membranes: Membrane[] = []
  north = Vec2(0, 1)
  spawnPosition: Vec2
  gap = 0.5
  tree: Branch
  featuresInVision: Feature[] = []
  readyToHatch = false
  hatched = true

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.spawnPosition = props.position
    this.tree = {
      radius: 3,
      angle: 0,
      branches: []
    }
    this.membrane = this.grow({ branch: this.tree })
  }

  addCircles (props: {
    branch: Branch
    circles: CircleShape[]
    parentPosition?: Vec2
    parentRadius?: number
  }): void {
    let center = this.spawnPosition
    if (props.parentPosition != null && props.parentRadius != null) {
      const distance = props.parentRadius + props.branch.radius + this.gap
      const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.branch.angle)
      center = Vec2.add(props.parentPosition, offset)
    }
    const circle = new CircleShape(center, props.branch.radius)
    props.circles.push(circle)
    for (const childBranch of props.branch.branches) {
      this.addCircles({
        branch: childBranch,
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
      const rope = new Rope({ joint })
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
    this.addCircles({ branch: this.tree, circles })
    const top = Math.max(...circles.map(circle => circle.getCenter().y + circle.getRadius()))
    const bottom = Math.min(...circles.map(circle => circle.getCenter().y - circle.getRadius()))
    const right = Math.max(...circles.map(circle => circle.getCenter().x + circle.getRadius()))
    const left = Math.min(...circles.map(circle => circle.getCenter().x - circle.getRadius()))
    const position = Vec2(0.5 * right + 0.5 * left, 0.5 * top + 0.5 * bottom)
    const hx = 0.5 * (right - left)
    const hy = 0.5 * (top - bottom)
    return new Egg({ actor: this, position, hx, hy })
  }

  getOffset (props: { parent: Membrane, branch: Branch }): Vec2 {
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
    this.membrane = this.grow({ branch: this.tree })
    this.membrane.borderWidth = 0.2
  }

  flee (): void { }

  grow (props: {
    branch: Branch
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

  onStep (): void {
    super.onStep()
    const featuresInRange = this.membrane.getFeaturesInRange()
    this.featuresInVision = featuresInRange.filter(targetFeature => {
      if (this.membrane instanceof Egg) {
        return this.stage.vision.isFeatureVisible(this.membrane, targetFeature)
      }
      return this.membranes.some(membrane => this.stage.vision.isFeatureVisible(membrane, targetFeature))
    })
    if (!this.hatched) this.flee()
    if (this.readyToHatch && !this.hatched) this.hatch()
  }

  respawn (): boolean {
    this.invincibleTime = 0
    const clearSpawnPoints = this.stage.spawnPoints.filter(spawnPoint => {
      const circle = new CircleShape(spawnPoint, this.getRadius())
      return this.stage.getFeaturesInShape(circle).length === 0
    })
    this.stage.log({
      messages: ['clearSpawnPoints.length', clearSpawnPoints.length]
    })
    if (clearSpawnPoints.length === 0) {
      return false
    }
    const spawnPoint = choose(clearSpawnPoints)
    this.spawnPosition = spawnPoint
    this.membrane = this.grow({ branch: this.tree })
    this.stage.log({
      message: this.stage.runner.getBodies().length
    })
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
