import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Sculpture } from '../feature/sculpture'
import { Debris } from './debris'

export class River extends Debris {
  sculpture: Sculpture
  force: Vec2
  speed: number
  vertices: Vec2[]
  constructor (props: {
    force: Vec2
    health?: number
    position: Vec2
    speed: number
    stage: Stage
    vertices: Vec2[] // [Vec2, Vec2, Vec2]
  }) {
    super({ stage: props.stage, label: 'puppet' })
    this.sculpture = new Sculpture({
      actor: this,
      health: props.health,
      position: props.position,
      vertices: props.vertices
    })
    const mass = this.sculpture.body.getMass()
    const force = Vec2.mul(props.force, mass)
    this.force = force
    this.speed = props.speed
    this.vertices = props.vertices
    this.invincibleTime = 0.1
    this.features.push(this.sculpture)
  }

  getArea (): number {
    const p1 = this.vertices[0]
    const p2 = this.vertices[1]
    const p3 = this.vertices[2]
    const area = Math.abs(
      0.5 * ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x))
    )
    return area
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
