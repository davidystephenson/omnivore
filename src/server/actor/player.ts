import { RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Mouth } from '../feature/mouth'
import { Color } from '../../shared/color'

export class Player extends Actor {
  eye: Mouth
  mouths: Mouth[] = []

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.eye = this.createMouth({ position: props.position })
    this.eye.borderWidth = 0.2
    this.eye.health = Math.random()
    const mouth = this.createMouth({
      position: Vec2.add(props.position, Vec2(0, 3)),
      cell: this.eye
    })
    this.createMouth({
      position: Vec2.add(mouth.body.getPosition(), Vec2(0, 3)),
      cell: mouth
    })
  }

  createMouth (props: {
    position: Vec2
    cell?: Mouth
  }): Mouth {
    const mouth = new Mouth({ position: props.position, actor: this })
    if (props.cell != null) {
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: mouth.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength: 3
      })
      this.joints.push(joint)
      this.stage.world.createJoint(joint)
    }
    this.mouths.push(mouth)
    this.features.push(mouth)
    return mouth
  }

  onStep (): void {
    super.onStep()
    if (this.invincibleTime === 0) {
      this.features.forEach(feature => {
        feature.color.alpha = feature.health
        feature.borderColor = new Color({ red: 0, green: 255, blue: 0 })
      })
    }
  }

  respawn (): void {
    const eyePosition = this.eye.body.getPosition()
    this.invincibleTime = 5
    const noise = Vec2(0.1 * Math.random(), 0.1 * Math.random())
    this.features.forEach(feature => {
      feature.health = 1
      feature.color.alpha = feature.health
      feature.borderColor = new Color({ red: 0, green: 0, blue: 255 })
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
