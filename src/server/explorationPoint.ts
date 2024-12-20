import { Vec2 } from 'planck'

export class ExplorationPoint {
  position: Vec2
  id: number
  time: number
  visible: boolean

  constructor (props: {
    position: Vec2
    id: number
  }) {
    this.position = props.position
    this.id = props.id
    this.time = 0
    this.visible = false
  }
}
