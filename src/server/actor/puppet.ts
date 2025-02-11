import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/sculpture'

export class Puppet extends Actor {
  sculpture: Sculpture
  force: Vec2
  speed: number

  constructor (props: {
    stage: Stage
    vertices: Vec2[] // [Vec2, Vec2, Vec2]
    position: Vec2
    force: Vec2
    speed: number
  }) {
    super({ stage: props.stage, label: 'puppet' })
    this.sculpture = new Sculpture({
      position: props.position,
      vertices: props.vertices,
      actor: this
    })
    const mass = this.sculpture.body.getMass()
    const force = Vec2.mul(props.force, mass)
    this.force = force
    this.speed = props.speed
    this.invincibleTime = 0.1
    this.features.push(this.sculpture)
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
    const speed = this.sculpture.body.getLinearVelocity().length()
    if (speed < this.speed) {
      this.sculpture.body.applyForceToCenter(this.force)
    }
  }
}
