import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Stage } from '../server/stage'

export class Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  foodCount: number
  id: number

  constructor (props: {
    elements: Element[]
    ropes: Rope[]
    debugLines: DebugLine[]
    debugCircles: DebugCircle[]
    stage: Stage
    id: number
  }) {
    this.elements = props.elements
    this.ropes = [] // props.ropes
    this.debugLines = [] // props.debugLines
    this.debugCircles = [] // props.debugCircles
    this.id = props.id
    this.foodCount = props.stage.food.length
  }
}
