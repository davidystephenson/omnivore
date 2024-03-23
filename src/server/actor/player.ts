import { CircleShape, RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Mouth } from '../feature/mouth'
import { rotate } from '../math'
import { Egg } from '../feature/egg'
import { Feature } from '../feature/feature'
import { Rope } from '../../shared/rope'

interface Branch {
  angle: number
  radius: number
  branches: Branch[]
}

export class Player extends Actor {
  eye: Egg | Mouth
  mouths: Mouth[] = []
  north = Vec2(0, 1)
  spawnPosition: Vec2
  gap = 0.5
  tree: Branch
  featuresInVision: Feature[] = []
  readyToHatch = false
  hatched = false

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.spawnPosition = props.position

    this.tree = {
      radius: 0.3,
      angle: 0,
      branches: [
        {
          angle: 0,
          radius: 1,
          branches: [
            // { angle: 0, radius: 0.3, branches: [] },
            // { angle: 0.25, radius: 0.3, branches: [] },
            // { angle: 0, radius: 0.3, branches: [] }
          ]
        }
        // {
        //   angle: 0.3,
        //   radius: 0.3,
        //   branches: [
        //     { angle: 0.25, radius: 0.3, branches: [] },
        //     {
        //       angle: 0.3,
        //       radius: 0.3,
        //       branches: [
        //         {
        //           angle: 0.5,
        //           radius: 0.3,
        //           branches: [
        //             { angle: 0.5, radius: 0.3, branches: [] }
        //           ]
        //         }
        //       ]
        //     },
        //     { angle: 0.75, radius: 0.3, branches: [] }
        //   ]
        // }
      ]
    }

    const circles: CircleShape[] = []
    this.addCircles({ branch: this.tree, circles })
    const top = Math.max(...circles.map(circle => circle.getCenter().y + circle.getRadius()))
    const bottom = Math.min(...circles.map(circle => circle.getCenter().y - circle.getRadius()))
    const right = Math.max(...circles.map(circle => circle.getCenter().x + circle.getRadius()))
    const left = Math.min(...circles.map(circle => circle.getCenter().x - circle.getRadius()))
    const position = Vec2(0.5 * right + 0.5 * left, 0.5 * top + 0.5 * bottom)
    const hx = 0.5 * (right - left)
    const hy = 0.5 * (top - bottom)
    this.eye = new Egg({ actor: this, position, hx, hy })

    setTimeout(() => { this.readyToHatch = true }, 0)
  }

  hatch = (): void => {
    // if(this.eye.body.getContactList() != null)
    this.hatched = true
    this.stage.destructionQueue.push(this.eye.body)
    this.spawnPosition = this.eye.body.getPosition()
    this.eye = this.grow({ branch: this.tree })
    this.eye.borderWidth = 0.2
  }

  getOffset (props: { parent: Mouth, branch: Branch }): Vec2 {
    const parentPosition = props.parent.body.getPosition()
    const distance = props.parent.radius + props.branch.radius + this.gap
    const offset = rotate(Vec2.mul(this.north, distance), -2 * Math.PI * props.branch.angle)
    const offsetPosition = Vec2.add(parentPosition, offset)
    return offsetPosition
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

  grow (props: {
    branch: Branch
    parent?: Mouth
  }): Mouth {
    const position = props.parent == null
      ? this.spawnPosition
      : this.getOffset({ parent: props.parent, branch: props.branch })
    const mouth = this.createMouth({
      position,
      cell: props.parent,
      radius: props.branch.radius
    })
    for (const childBranch of props.branch.branches) {
      this.grow({ branch: childBranch, parent: mouth })
    }
    return mouth
  }

  createMouth (props: {
    position: Vec2
    cell?: Mouth
    radius?: number
  }): Mouth {
    const mouth = new Mouth({ position: props.position, actor: this, radius: props.radius })
    if (props.cell != null) {
      const maxLength = Vec2.distance(props.position, props.cell.body.getPosition())
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: mouth.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength
      })
      this.joints.push(joint)
      const rope = new Rope({ joint })
      props.cell.ropes.push(rope)
      mouth.ropes.push(rope)
      this.stage.world.createJoint(joint)
    }
    this.mouths.push(mouth)
    this.features.push(mouth)
    return mouth
  }

  flee (): void { }

  onStep (): void {
    super.onStep()
    const featuresInRange = this.eye.getFeaturesInRange()
    this.featuresInVision = featuresInRange.filter(targetFeature => {
      if (this.eye instanceof Egg) {
        return this.eye.isFeatureVisible(targetFeature)
      }
      return this.mouths.some(mouth => mouth.isFeatureVisible(targetFeature))
    })
    if (!this.hatched) this.flee()
    if (this.readyToHatch && !this.hatched) this.hatch()
  }

  respawn (): void {
    const eyePosition = this.eye.body.getPosition()
    this.invincibleTime = 5
    const noise = Vec2(0.1 * Math.random(), 0.1 * Math.random())
    this.features.forEach(feature => {
      feature.health = 1
      const featurePosition = feature.body.getPosition()
      const relativePosition = Vec2.sub(featurePosition, eyePosition)
      feature.deathPosition = Vec2.clone(featurePosition)
      feature.spawnPosition = Vec2.add(relativePosition, noise)
    })
    this.features.forEach(feature => {
      feature.body.setPosition(feature.spawnPosition)
    })
  }
}
