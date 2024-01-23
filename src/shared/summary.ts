import { Component } from './component'

export class Summary {
  components: Component[]
  id: number

  constructor (props: {
    components: Component[]
    id: number
  }) {
    this.components = props.components
    this.id = props.id
  }
}
