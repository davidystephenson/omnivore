import { Vec2 } from 'planck'
import { Feature } from '../server/feature/feature'

export class RayCastHit {
  feature: Feature
  point: Vec2

  constructor (props: {
    feature: Feature
    point: Vec2
  }) {
    this.feature = props.feature
    this.point = props.point
  }
}
