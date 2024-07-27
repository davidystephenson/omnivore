import { Circle, Vec2 } from 'planck'
import { Stage } from './stage'
import { Waypoint } from './waypoint'
import { Color } from '../shared/color'
import { HALF_SIGHT } from '../shared/sight'
import { directionFromTo, normalize, range, rotate, whichMin } from './math'
import { Wall } from './actor/wall'
import { Feature } from './feature/feature'
import { Membrane } from './feature/membrane'
import { Structure } from './feature/structure'
import { Organism } from './actor/organism'
import { Bot } from './actor/bot'

export class Navigation {
  static spacing = {
    x: HALF_SIGHT.y,
    y: HALF_SIGHT.y
  }

  radii = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6]
  stage: Stage
  waypoints = new Map<number, Waypoint>()
  gridWaypoints: Waypoint[] = []
  wallOffset = 0.1
  wallWaypoints: Waypoint[] = []
  cornerWaypoints: Waypoint[] = []
  radiiWaypoints = new Map<number, Waypoint[]>()

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  navigateFromMembrane (membrane: Membrane, end: Vec2): Vec2 {
    const start = membrane.body.getPosition()
    const target = this.navigate(start, end, membrane.radius)
    if (target instanceof Waypoint) return target.position
    return target
  }

  navigateFromWaypoint (waypoint: Waypoint, end: Vec2): Waypoint | Vec2 {
    const start = waypoint.position
    const target = this.navigate(start, end, waypoint.radius)
    return target
  }

  getPath (start: Vec2, end: Vec2, radius: number): Vec2[] {
    const largerRadii = this.radii.filter(rad => rad >= radius)
    const validRadius = largerRadii[whichMin(largerRadii)]
    const radiusWaypoints = this.radiiWaypoints.get(validRadius)
    if (radiusWaypoints == null) throw new Error('Radius out of bounds')
    const path = [start]
    let nextPoint: Waypoint | Vec2 = this.navigate(path[path.length - 1], end, radius)
    if (!(nextPoint instanceof Waypoint)) {
      path.push(nextPoint)
    }

    while (nextPoint instanceof Waypoint) {
      path.push(nextPoint.position)
      nextPoint = this.navigate(path[path.length - 1], end, radius)
      if (!(nextPoint instanceof Waypoint)) path.push(nextPoint)
      if (path.length > radiusWaypoints.length) {
        throw new Error('The path is too long')
      }
    }
    return path
  }

  navigate (start: Vec2, end: Vec2, radius: number): Waypoint | Vec2 {
    const largerRadii = this.radii.filter(rad => rad >= radius)
    const validRadius = largerRadii[whichMin(largerRadii)]
    const open = this.isOpen({
      fromPosition: start,
      toPosition: end,
      radius: validRadius
    })
    if (open) {
      return end
    }
    const startNeighbors = this.getNeighbors(start, validRadius)
    const endNeighbors = this.getNeighbors(end, validRadius)
    let minDistance = Infinity
    let target = startNeighbors[0]
    startNeighbors.forEach(startNeighbor => {
      endNeighbors.forEach(endNeighbor => {
        const startToNeighbor = Vec2.distance(start, startNeighbor.position)
        const neighborToEnd = Vec2.distance(end, endNeighbor.position)
        const pathDistances = startNeighbor.pathDistances.get(validRadius)
        if (pathDistances == null) throw new Error('Missing path distances')
        const waypointDistance = pathDistances[endNeighbor.id]
        const distance = startToNeighbor + waypointDistance + neighborToEnd
        if (distance < minDistance) {
          minDistance = distance
          target = startNeighbor
        }
      })
    })
    return target
  }

  setupWaypoints (): void {
    this.stage.debug({ value: 'Setting up waypoints...' })
    this.createWaypoints()
    this.stage.debug({ value: 'Setting up neighbors...' })
    this.setupNeighbors()
    this.stage.debug({ value: 'Calculating distances...' })
    this.preCalculate()
    this.stage.debug({ value: 'Starting the runner...' })
    setInterval(() => { this.stage.runner.step() }, 1000 * this.stage.runner.timeStep)
    this.stage.debug({ value: 'Runner started!' })
  }

  preCalculate (): void {
    this.waypoints.forEach(waypoint => {
      this.waypoints.forEach(otherWaypoint => {
        waypoint.distances[otherWaypoint.id] = Vec2.distance(waypoint.position, otherWaypoint.position)
      })
    })
    this.radii.forEach(radius => {
      this.stage.debug({ value: `Calculating for radius ${radius}...` })
      // Initialize distance array for each waypoint for this radius
      this.waypoints.forEach(waypoint => {
        const distances = range(1, this.waypoints.size).map(i => Infinity)
        waypoint.pathDistances.set(radius, distances)
      })
      // Compute the minimal path distance from each waypoint to each other waypoint
      const radiusWaypoints = this.radiiWaypoints.get(radius)
      if (radiusWaypoints == null) throw new Error('No waypoints found for this radius')
      radiusWaypoints.forEach(step => {
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
  }

  setupNeighbors (): void {
    this.waypoints.forEach(waypoint => {
      this.radii.forEach(radius => {
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
      if (Vec2.distance(position, otherWaypoint.position) === 0) return false
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
        this.radii.forEach(radius => {
          this.addWaypoint(Vec2(x, y), 'grid', radius)
        })
      })
    })
    this.stage.walls.forEach(wall => this.addWallWaypoints(wall))
    this.radii.forEach(radius => {
      const cornerX = this.stage.halfWidth - radius
      const cornerY = this.stage.halfHeight - radius
      this.addWaypoint(Vec2(+cornerX, +cornerY), 'corner', radius)
      this.addWaypoint(Vec2(+cornerX, -cornerY), 'corner', radius)
      this.addWaypoint(Vec2(-cornerX, +cornerY), 'corner', radius)
      this.addWaypoint(Vec2(-cornerX, -cornerY), 'corner', radius)
    })
    this.radii.forEach(radius => {
      const waypointArray = [...this.waypoints.values()]
      const validWaypoints = waypointArray.filter(waypoint => waypoint.radius === radius)
      this.radiiWaypoints.set(radius, validWaypoints)
    })
    this.waypoints.forEach(waypoint => {
      if (waypoint.category === 'grid') this.gridWaypoints.push(waypoint)
      if (waypoint.category === 'wall') this.wallWaypoints.push(waypoint)
      if (waypoint.category === 'corner') this.cornerWaypoints.push(waypoint)
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
      this.radii.forEach(radius => {
        const offset = Math.sqrt(2) * (radius + this.wallOffset)
        const position = Vec2.combine(1, corner, offset, direction)
        this.stage.navigation.addWaypoint(position, 'wall', radius)
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
        this.radii.forEach(radius => {
          const position = Vec2.combine(1, point, radius + this.wallOffset, away)
          this.addWaypoint(position, 'wall', radius)
        })
      })
    })
  }

  addWaypoint (position: Vec2, category: string, radius: number): Waypoint {
    return new Waypoint({ position, navigation: this, radius, category })
  }

  onStep (): void {
    const players: Organism[] = []
    this.stage.actors.forEach(actor => {
      if (!(actor instanceof Organism)) return
      if (actor instanceof Bot) return
      players.push(actor)
    })
    const player = players[0]
    if (player == null) return
    this.cornerWaypoints.forEach(waypoint => {
      if (waypoint.radius === player.radius) {
        this.stage.debugCircle({
          circle: new Circle(waypoint.position, 0.2),
          color: Color.WHITE
        })
      }
    })
    this.gridWaypoints.forEach(waypoint => {
      this.stage.debugCircle({
        circle: new Circle(waypoint.position, 0.2),
        color: Color.WHITE
      })
    })
    this.wallWaypoints.forEach(waypoint => {
      if (waypoint.radius === player.radius) {
        this.stage.debugCircle({
          circle: new Circle(waypoint.position, 0.2),
          color: Color.WHITE
        })
      }
    })
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
