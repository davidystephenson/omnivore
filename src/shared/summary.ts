import { Vec2 } from 'planck'
import { Component } from './component'

export class Summary {
  components: Component[]
  position: Vec2

  constructor (props: {
    components: Component[]
    position: Vec2
  }) {
    this.components = props.components
    this.position = props.position
  }
}
