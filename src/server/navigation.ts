import { Circle, Vec2 } from 'planck'
import { Stage } from './stage'
import { Waypoint } from './waypoint'
import { Color } from '../shared/color'
import { HALF_SIGHT } from '../shared/sight'
import { directionFromTo, normalize, range, rotate } from './math'
import { Wall } from './actor/wall'
import { Feature } from './feature/feature'
import { Membrane } from './feature/membrane'
import { Structure } from './feature/structure'

export class Navigation {
  static spacing = {
    x: HALF_SIGHT.y,
    y: HALF_SIGHT.y
  }

  static radii = [0.6, 0.7, 0.8, 0.9, 1.0]

  stage: Stage
  waypoints = new Map<number, Waypoint>()
  gridWaypoints: Waypoint[] = []
  wallWaypoints: Waypoint[] = []
  radiiWaypoints = new Map<number, Waypoint[]>()

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  navigate (membrane: Membrane, end: Vec2): Vec2 {
    const start = membrane.body.getPosition()
    const open = this.isOpen({
      fromPosition: start,
      toPosition: end,
      radius: membrane.radius
    })
    if (open) {
      return end
    }
    this.stage.log({ value: 'blocked' })
    const startNeighbors = this.getNeighbors(start, membrane.radius)
    const endNeighbors = this.getNeighbors(end, membrane.radius)
    let minDistance = Infinity
    let target = end
    startNeighbors.forEach(startNeighbor => {
      endNeighbors.forEach(endNeighbor => {
        const startToNeighbor = Vec2.distance(start, startNeighbor.position)
        const neighborToEnd = Vec2.distance(start, endNeighbor.position)
        const pathDistances = startNeighbor.pathDistances.get(membrane.radius)
        if (pathDistances == null) throw new Error('Missing path distances')
        const waypointDistance = pathDistances[endNeighbor.id]
        const distance = startToNeighbor + waypointDistance + neighborToEnd
        if (distance < minDistance) {
          minDistance = distance
          target = startNeighbor.position
        }
      })
    })
    return target
  }

  setupWaypoints (): void {
    this.createWaypoints()
    this.setupNeighbors()
    this.preCalculate()
  }

  preCalculate (): void {
    console.log('Begin Precalculate')
    this.waypoints.forEach(waypoint => {
      this.waypoints.forEach(otherWaypoint => {
        waypoint.distances[otherWaypoint.id] = Vec2.distance(waypoint.position, otherWaypoint.position)
      })
    })
    Navigation.radii.forEach(radius => {
      console.log(`Begin radius ${radius}`)
      // Initialize distance array for each waypoint for this radius
      this.waypoints.forEach(waypoint => {
        const distances = range(1, this.waypoints.size).map(i => Infinity)
        waypoint.pathDistances.set(radius, distances)
      })
      // Compute the minimal path distance from each waypoint to each other waypoint
      const radiusWaypoints = this.radiiWaypoints.get(radius)
      if (radiusWaypoints == null) throw new Error('No waypoints found for this radius')
      radiusWaypoints.forEach(step => {
        // TODO this should use radiusWaypoints:
        // radiusWaypoints.forEach(waypoint => {
        radiusWaypoints.forEach(waypoint => {
          const pathDistances = waypoint.pathDistances.get(radius)
          if (pathDistances == null) throw new Error('Missing distances')
          const neighbors = waypoint.neighbors.get(radius)
          if (neighbors == null) throw new Error('Missing neighbors')
          radiusWaypoints.forEach(otherWaypoint => {
            if (waypoint.id === otherWaypoint.id) {
              pathDistances[otherWaypoint.id] = 0
              return
            }
            if (neighbors.includes(otherWaypoint)) {
              pathDistances[otherWaypoint.id] = waypoint.distances[otherWaypoint.id]
              return
            }
            neighbors.forEach(neighbor => {
              const neighborDistances = neighbor.pathDistances.get(radius)
              if (neighborDistances == null) throw new Error('Missing neighbor distances')
              const distanceThroughNeighbor = waypoint.distances[neighbor.id] + neighborDistances[otherWaypoint.id]
              pathDistances[otherWaypoint.id] = Math.min(pathDistances[otherWaypoint.id], distanceThroughNeighbor)
            })
          })
        })
      })
    })
    console.log('End Precalculate')
  }

  setupNeighbors (): void {
    this.waypoints.forEach(waypoint => {
      Navigation.radii.forEach(radius => {
        const neighbors = this.getNeighbors(waypoint.position, radius)
        waypoint.neighbors.set(radius, neighbors)
      })
    })
  }

  isOpen (props: {
    fromPosition: Vec2
    toPosition: Vec2
    radius: number
    debug?: boolean
  }): boolean {
    const direction = directionFromTo(props.fromPosition, props.toPosition)
    const perp = rotate(direction, 0.5 * Math.PI)
    const starts = [
      Vec2.combine(1, props.fromPosition, -props.radius, perp),
      props.fromPosition,
      Vec2.combine(1, props.fromPosition, +props.radius, perp)
    ]
    const ends = [
      Vec2.combine(1, props.toPosition, -props.radius, perp),
      props.toPosition,
      Vec2.combine(1, props.toPosition, +props.radius, perp)
    ]
    let open = true
    range(0, 2).forEach(index => {
      if (open) {
        const start = starts[index]
        const end = ends[index]
        this.stage.world.rayCast(start, end, (fixture, point, normal, fraction) => {
          const feature = fixture.getBody().getUserData() as Feature
          if (!(feature instanceof Structure)) return 1
          open = false
          if (props.debug === true) this.stage.debugLine({ a: start, b: end, color: Color.RED, width: 0.1 })
          return 0
        })
      }
    })
    return open
  }

  getNeighbors (position: Vec2, radius: number): Waypoint[] {
    const validWaypoints = this.radiiWaypoints.get(radius)
    if (validWaypoints == null) return []
    const neighbors = validWaypoints.filter(otherWaypoint => {
      return this.isOpen({
        fromPosition: position,
        toPosition: otherWaypoint.position,
        radius
      })
    })
    return neighbors
  }

  createWaypoints (): void {
    const xCount = Math.ceil(2 * this.stage.halfWidth / Navigation.spacing.x)
    const yCount = Math.ceil(2 * this.stage.halfHeight / Navigation.spacing.y)
    const xStep = 2 * this.stage.halfWidth / xCount
    const yStep = 2 * this.stage.halfHeight / yCount
    range(0, xCount).forEach(i => {
      range(0, yCount).forEach(j => {
        const x = i * xStep - this.stage.halfWidth
        const y = j * yStep - this.stage.halfHeight
        const waypoint = this.addWaypoint(Vec2(x, y))
        this.gridWaypoints.push(waypoint)
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
          const waypoint = this.addWaypoint(position, radius)
          this.wallWaypoints.push(waypoint)
        })
      })
    })
  }

  addWaypoint (position: Vec2, radius?: number): Waypoint {
    const rad = radius ?? Math.max(...Navigation.radii)
    return new Waypoint({ position, navigation: this, radius: rad })
  }

  onStep (): void {
    // this.waypoints.forEach(waypoint => {
    //   this.stage.debugCircle({
    //     circle: new Circle(waypoint.position, 0.2),
    //     color: Color.WHITE
    //   })
    // })
    // const radius = 1.0
    // const radiusWaypoints = this.radiiWaypoints.get(radius)
    // if (radiusWaypoints == null) return
    // radiusWaypoints.forEach(waypoint => {
    //   const neighbors = waypoint.neighbors.get(radius)
    //   if (neighbors == null) return
    //   neighbors.forEach(neighbor => {
    //     this.stage.debugLine({ a: waypoint.position, b: neighbor.position, color: Color.WHITE })
    //   })
    // })
  }
}
