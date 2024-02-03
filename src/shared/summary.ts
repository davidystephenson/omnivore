import { Element } from './element'
import { Rope } from './rope'

export class Summary {
  elements: Element[]
  ropes: Rope[]
  id: number

  constructor (props: {
    elements: Element[]
    ropes: Rope[]
    id: number
  }) {
    this.elements = props.elements
    this.ropes = props.ropes
    this.id = props.id
  }
}
