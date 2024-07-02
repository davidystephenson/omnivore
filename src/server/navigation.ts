import { Circle, Vec2 } from 'planck'
import { Stage } from './stage'
import { Waypoint } from './waypoint'
import { Color } from '../shared/color'
import { HALF_SIGHT } from '../shared/sight'
import { directionFromTo, normalize, range, rotate } from './math'
import { Wall } from './actor/wall'

export class Navigation {
  static spacing = {
    x: HALF_SIGHT.y,
    y: HALF_SIGHT.y
  }

  static radii = [0.6, 0.7, 0.8, 0.9, 1.0]

  stage: Stage
  waypoints = new Map<number, Waypoint>()
  radiiWaypoints = new Map<number, Waypoint[]>()

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  setupWaypoints (): void {
    this.createWaypoints()
    this.setupNeighbors()
  }

  setupNeighbors (): void {
    this.waypoints.forEach(waypoint => {
      Navigation.radii.forEach(radius => {
        const validWaypoints = this.radiiWaypoints.get(radius)
        if (validWaypoints == null) return
        const nearWaypoints = validWaypoints.filter(otherWaypoint => {
          const nearX = Math.abs(waypoint.position.x - otherWaypoint.position.x) <= HALF_SIGHT.x
          const nearY = Math.abs(waypoint.position.y - otherWaypoint.position.y) <= HALF_SIGHT.y
          return nearX && nearY
        })
        const radiusNeighbors = nearWaypoints.filter(otherWaypoint => {
          const direction = directionFromTo(waypoint.position, otherWaypoint.position)
          const perp = rotate(direction, 0.5 * Math.PI)
          const starts = [
            Vec2.combine(1, waypoint.position, -1, perp),
            waypoint.position,
            Vec2.combine(1, waypoint.position, +1, perp)
          ]
          const ends = [
            Vec2.combine(1, otherWaypoint.position, -1, perp),
            otherWaypoint.position,
            Vec2.combine(1, otherWaypoint.position, +1, perp)
          ]
          let open = true
          range(0, 2).forEach(index => {
            if (open) {
              const start = starts[index]
              const end = ends[index]
              this.stage.world.rayCast(start, end, (fixture, point, normal, fraction) => {
                open = false
                return 0
              })
            }
          })
          return open
        })
        waypoint.neighbors.set(radius, radiusNeighbors)
      })
    })
  }

  createWaypoints (): void {
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
    this.stage.walls.forEach(wall => this.addWallWaypoints(wall))
    Navigation.radii.forEach(radius => {
      const cornerX = this.stage.halfWidth - radius
      const cornerY = this.stage.halfHeight - radius
      this.addWaypoint(Vec2(+cornerX, +cornerY), radius)
      this.addWaypoint(Vec2(+cornerX, -cornerY), radius)
      this.addWaypoint(Vec2(-cornerX, +cornerY), radius)
      this.addWaypoint(Vec2(-cornerX, -cornerY), radius)
    })
    Navigation.radii.forEach(radius => {
      const waypointArray = [...this.waypoints.values()]
      const validWaypoints = waypointArray.filter(waypoint => waypoint.radius >= radius)
      this.radiiWaypoints.set(radius, validWaypoints)
    })
  }

  addWallWaypoints (wall: Wall): void {
    const corners = [
      Vec2(wall.position.x + wall.halfWidth, wall.position.y + wall.halfHeight),
      Vec2(wall.position.x - wall.halfWidth, wall.position.y + wall.halfHeight),
      Vec2(wall.position.x - wall.halfWidth, wall.position.y - wall.halfHeight),
      Vec2(wall.position.x + wall.halfWidth, wall.position.y - wall.halfHeight)
    ]
    corners.forEach(corner => {
      const direction = normalize(Vec2(
        Math.sign(corner.x - wall.position.x),
        Math.sign(corner.y - wall.position.y)
      ))
      Navigation.radii.forEach(radius => {
        const offset = Math.sqrt(2) * radius
        const position = Vec2.combine(1, corner, offset, direction)
        this.stage.navigation.addWaypoint(position, radius)
      })
    })
    range(1, corners.length).forEach(index => {
      const start = corners[index - 1]
      const end = corners[index % corners.length]
      const next = corners[(index + 1) % corners.length]
      const length = Vec2.distance(start, end)
      const blockCount = Math.ceil(length / Navigation.spacing.y)
      const stepCount = blockCount - 1
      if (stepCount < 1) return
      range(1, stepCount).forEach(step => {
        const away = directionFromTo(next, end)
        const weight = step / blockCount
        const point = Vec2.combine(weight, start, 1 - weight, end)
        Navigation.radii.forEach(radius => {
          const position = Vec2.combine(1, point, radius, away)
          this.addWaypoint(position, radius)
        })
      })
    })
  }

  addWaypoint (position: Vec2, radius?: number): Waypoint {
    const rad = radius ?? Math.max(...Navigation.radii)
    return new Waypoint({ position, navigation: this, radius: rad })
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
