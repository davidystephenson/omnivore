import { CircleShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { angleToDirection, directionFromTo, range, whichMax } from '../math'
import { Color } from '../../shared/color'
import { Waypoint } from '../waypoint'
import { Tree } from '../tree'

export class Bot extends Organism {
  constructor (props: {
    stage: Stage
    position: Vec2
    tree: Tree
  }) {
    super({
      stage: props.stage,
      position: props.position,
      tree: props.tree
    })
    this.membrane.forceScale = 1
  }

  setControls (direction: Vec2): void {
    const roundDirs = range(0, 7).map(i => angleToDirection(2 * Math.PI * i / 8))
    const dotProducts = roundDirs.map(roundDir => Vec2.dot(roundDir, direction))
    const roundDir = roundDirs[whichMax(dotProducts)]
    const start = this.membrane.body.getPosition()
    this.stage.debugLine({
      a: start,
      b: Vec2.combine(1, start, 2, roundDir),
      color: Color.RED,
      width: 0.2
    })
    this.controls.up = roundDir.y > 0
    this.controls.down = roundDir.y < 0
    this.controls.left = roundDir.x < 0
    this.controls.right = roundDir.x > 0
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
    const directionToNext = directionFromTo(start, nextPosition)
    this.setControls(directionToNext)
  }
}
