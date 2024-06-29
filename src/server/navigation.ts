import { Circle, Vec2 } from 'planck'
import { Stage } from './stage'
import { Waypoint } from './waypoint'
import { Color } from '../shared/color'
import { HALF_SIGHT } from '../shared/sight'
import { range } from './math'

export class Navigation {
  static spacing = {
    x: HALF_SIGHT.x,
    y: HALF_SIGHT.y
  }

  stage: Stage
  waypoints = new Map<number, Waypoint>()

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  setupWaypoints (): void {
    const xCount = Math.ceil(2 * this.stage.halfWidth / Navigation.spacing.x)
    const yCount = Math.ceil(2 * this.stage.halfHeight / Navigation.spacing.y)
    this.stage.log({ value: ['xCount', xCount] })
    this.stage.log({ value: ['yCount', yCount] })
    const xStep = 2 * this.stage.halfWidth / xCount
    const yStep = 2 * this.stage.halfHeight / yCount
    range(0, xCount).forEach(i => {
      range(0, yCount).forEach(j => {
        const x = i * xStep - this.stage.halfWidth
        const y = j * yStep - this.stage.halfHeight
        this.addWaypoint(Vec2(x, y))
      })
    })
    this.stage.walls.forEach(wall => wall.setupWaypoints())
  }

  addWaypoint (position: Vec2): Waypoint {
    return new Waypoint({ position, navigation: this })
  }

  onStep (): void {
    this.stage.log({ value: ['waypoints', this.waypoints.size] })
    this.waypoints.forEach(waypoint => {
      this.stage.debugCircle({
        circle: new Circle(waypoint.position, 0.2),
        color: Color.WHITE
      })
    })
  }
}
