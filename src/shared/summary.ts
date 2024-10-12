import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Vec2 } from 'planck'
import { Stage } from '../server/stage'
import { Feature } from '../server/feature/feature'

export class Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  foodPoints: Vec2[] = []
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
    this.ropes = props.ropes
    this.debugLines = props.debugLines
    this.debugCircles = props.debugCircles
    this.id = props.id
    this.foodCount = props.stage.food.length
    this.foodPoints = props.stage.food.map(actor => {
      const feature = actor.features[0]
      if (feature instanceof Feature) {
        return feature.body.getPosition()
      }
      return Vec2(0, 0)
    })
  }
}
