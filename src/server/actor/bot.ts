import { CircleShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { directionFromTo, range } from '../math'
import { Color } from '../../shared/color'
import { Waypoint } from '../waypoint'

export class Bot extends Organism {
  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({
      stage: props.stage,
      position: props.position
    })
  }

  onStep (): void {
    super.onStep()
    const start = this.membrane.body.getPosition()
    const explorationId = this.explorationIds[0]
    const explorationPoint = this.explorationPoints[explorationId]
    const end = explorationPoint.position
    if (this.debugPath) {
      const path = this.stage.navigation.getPath(start, end, this.membrane.radius)
      range(0, path.length - 2).forEach(index => {
        const currentPoint = path[index]
        const nextPoint = path[index + 1]
        this.stage.debugLine({ a: currentPoint, b: nextPoint, color: Color.WHITE, width: 0.1 })
      })
      const circle = new CircleShape(end, 0.5)
      this.stage.debugCircle({ circle, color: Color.RED })
    }
    const nextPoint = this.stage.navigation.navigate(start, end, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(start, nextPosition)
    const force = Vec2.mul(direction, this.membrane.FORCE_SCALE)
    this.membrane.force = Vec2.mul(force, this.membrane.body.getMass())
  }
}
