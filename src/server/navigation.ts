import { AABB, Circle, Vec2 } from 'planck'
import { Stage } from './stage/stage'
import { Waypoint } from './waypoint'
import { HALF_SIGHT } from '../shared/sight'
import { directionFromTo, normalize, range, rotate, whichMin } from './math'
import { Wall } from './actor/wall'
import { Feature } from './feature/feature'
import { Structure } from './feature/structure'
import { Organism } from './actor/organism'
import { CYAN, LIME, RED, WHITE } from '../shared/color'
import { NavArea } from './navArea'

export class Navigation {
  static spacing = {
    x: HALF_SIGHT.y,
    y: HALF_SIGHT.y
  }

  radii = [1.2, 0.9, 0.6]
  margin: number
  bigRadius: number
  smallRadius: number
  stage: Stage
  waypoints = new Map<number, Waypoint>()
  gridWaypoints: Waypoint[] = []
  wallOffset = 0.4
  wallWaypoints: Waypoint[] = []
  cornerWaypoints: Waypoint[] = []
  navAreas: NavArea[] = []
  radiiWaypoints = new Map<number, Waypoint[]>()

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
    this.bigRadius = Math.max(...this.radii)
    this.smallRadius = Math.min(...this.radii)
    const bigDiameter = 2 * this.bigRadius
    this.margin = bigDiameter + 0.1
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
        const waypoint = this.addWaypoint(position, 'wall', radius)
        wall.cornerWaypoints.push(waypoint)
      })
    })
    range(1, corners.length).forEach(index => {
      const start = corners[index - 1]
      const end = corners[index % corners.length]
      const next = corners[(index + 1) % corners.length]
      const length = Vec2.distance(start, end)
      const ceil = Math.ceil(length / Navigation.spacing.y)
      const blockCount = Math.max(ceil, 2)
      const stepCount = blockCount - 1
      if (stepCount < 1) return
      range(1, stepCount).forEach(step => {
        const away = directionFromTo(next, end)
        const weight = step / blockCount
        const point = Vec2.combine(weight, start, 1 - weight, end)
        this.radii.forEach(radius => {
          const position = Vec2.combine(1, point, radius + this.wallOffset, away)
          const waypoint = this.addWaypoint(position, 'wall', radius)
          if (start.y > wall.position.y && end.y > wall.position.y) {
            wall.topWaypoints.push(waypoint)
          }
          if (start.y < wall.position.y && end.y < wall.position.y) {
            wall.bottomWaypoints.push(waypoint)
          }
          if (start.x > wall.position.x && end.x > wall.position.x) {
            wall.rightWaypoints.push(waypoint)
          }
          if (start.x < wall.position.x && end.x < wall.position.x) {
            wall.leftWaypoints.push(waypoint)
          }
        })
      })
    })
  }

  addWaypoint (position: Vec2, category: string, radius: number): Waypoint {
    return new Waypoint({ position, navigation: this, radius, category })
  }

  getPath (props: {
    a: Vec2
    b: Vec2
    radius: number
    otherRadius?: number
  }): Vec2[] {
    const largerRadii = this.radii.filter(rad => rad >= props.radius)
    const minimumRadius = largerRadii[whichMin(largerRadii)]
    const radiusWaypoints = this.radiiWaypoints.get(minimumRadius)
    if (radiusWaypoints == null) throw new Error('Radius out of bounds')
    const path = [props.a]
    let nextPoint: Waypoint | Vec2 = this.navigate(path[path.length - 1], props.b, props.radius)
    if (!(nextPoint instanceof Waypoint)) {
      path.push(nextPoint)
    }
    while (nextPoint instanceof Waypoint) {
      path.push(nextPoint.position)
      nextPoint = this.navigate(path[path.length - 1], props.b, props.radius, props.otherRadius)
      if (!(nextPoint instanceof Waypoint)) path.push(nextPoint)
      if (path.length > radiusWaypoints.length) {
        this.stage.debug({ v: 'The path is too long' })
        return path
      }
    }
    return path
  }

  navigate (start: Vec2, end: Vec2, radius: number, otherRadius?: number): Waypoint | Vec2 {
    const navigateStart = performance.now()
    const largerRadii = this.radii.filter(rad => rad >= radius)
    const validRadius = largerRadii[whichMin(largerRadii)]
    const directPositions = [
      end,
      Vec2.combine(1, end, radius, Vec2(+1, 0)),
      Vec2.combine(1, end, radius, Vec2(-1, 0)),
      Vec2.combine(1, end, radius, Vec2(0, +1)),
      Vec2.combine(1, end, radius, Vec2(0, -1))
    ]
    for (const directPosition of directPositions) {
      const open = this.isOpen({
        fromPosition: start,
        toPosition: directPosition,
        radius: validRadius,
        otherRadius
      })
      if (open) {
        return directPosition
      }
    }
    const isOpenEnd = this.stage.runner.endTiming({ key: 'isOpen', start: navigateStart })
    const startNeighbors = this.getNeighbors(start, validRadius)
    const endNeighbors = this.getNeighbors(end, validRadius)
    // const startNeighbors = this.getNeighbors(start, validRadius).filter(point => {
    //   return this.stage.vision.isPointInRange(start, point.position)
    // })
    // const endNeighbors = this.getNeighbors(end, validRadius).filter(point => {
    //   return this.stage.vision.isPointInRange(start, point.position)
    // })
    this.stage.flag({ f: 'navigation', k: 'startNeighbors', v: startNeighbors.length })
    this.stage.flag({ f: 'navigation', k: 'endNeighbors', v: endNeighbors.length })
    let minDistance = Infinity
    let target: Waypoint | Vec2 = start
    startNeighbors.forEach(startNeighbor => {
      endNeighbors.forEach(endNeighbor => {
        const distancesStart = performance.now()
        const startToNeighbor = Vec2.distance(start, startNeighbor.position)
        const neighborToEnd = Vec2.distance(end, endNeighbor.position)
        const endDistances = this.stage.runner.endTiming({ key: 'distances', start: distancesStart })
        const pathDistances = startNeighbor.pathDistances.get(validRadius)
        if (pathDistances == null) throw new Error('Missing path distances')
        const waypointDistance = pathDistances[endNeighbor.id]
        const distance = startToNeighbor + waypointDistance + neighborToEnd
        if (distance < minDistance) {
          minDistance = distance
          target = startNeighbor
        }
        this.stage.runner.endTiming({ key: 'afterDistances', start: endDistances })
      })
    })
    this.stage.runner.endTiming({ key: 'navigate', start: navigateStart })
    this.stage.runner.endTiming({ key: 'afterIsOpen', start: isOpenEnd })
    return target
  }

  setupWaypoints (): void {
    this.stage.debug({ v: 'Setting up waypoints...' })
    this.createWaypoints()
    this.stage.debug({ v: 'Setting up navAreas...' })
    this.navAreas = this.getNavAreas()
    console.log(`${this.navAreas.length} navAreas`)
    this.stage.debug({ v: 'Setting up neighbors...' })
    this.setupNeighbors()
    this.stage.debug({ v: 'Calculating distances...' })
    this.preCalculate()
    this.stage.debug({ v: 'Starting the runner...' })
    setInterval(() => { this.stage.runner.step() }, 1000 * this.stage.runner.timeStep)
    this.stage.debug({ v: 'Runner started!' })
  }

  getBigWaypoints (): Waypoint[] {
    const maximumRadius = Math.max(...this.radii)
    const waypointArray = [...this.waypoints.values()]
    return waypointArray.filter(waypoint => waypoint.radius === maximumRadius)
  }

  getNavAreas (): NavArea[] {
    const areaBoxes: AABB[] = []
    const wallTops = this.stage.walls.map(wall => wall.top + 0.001)
    const wallBottoms = this.stage.walls.map(wall => wall.bottom - 0.001)
    const wallRights = this.stage.walls.map(wall => wall.right + 0.001)
    const wallLefts = this.stage.walls.map(wall => wall.left - 0.001)
    wallTops.sort((a, b) => a - b)
    wallBottoms.sort((a, b) => a - b)
    wallRights.sort((a, b) => a - b)
    wallLefts.sort((a, b) => a - b)
    wallTops.forEach(areaBottom => {
      wallBottoms.forEach(areaTop => {
        wallLefts.forEach(areaRight => {
          wallRights.forEach(areaLeft => {
            if (areaRight - areaLeft < this.margin) return
            if (areaTop - areaBottom < this.margin) return
            const aabb = new AABB(Vec2(areaLeft, areaBottom), Vec2(areaRight, areaTop))
            for (const wall of this.stage.walls) {
              const overlap = AABB.testOverlap(wall.aabb, aabb)
              if (overlap) return
            }
            areaBoxes.push(aabb)
          })
        })
      })
    })
    const navAreas: NavArea[] = []
    areaBoxes.forEach(areaBox => {
      for (const otherAreaBox of areaBoxes) {
        const otherContainsSelf = otherAreaBox.contains(areaBox)
        const selfContainsOther = areaBox.contains(otherAreaBox)
        if (otherContainsSelf && !selfContainsOther) return
      }
      navAreas.push(new NavArea(this.stage, areaBox))
    })
    return navAreas
  }

  preCalculate (): void {
    this.waypoints.forEach(waypoint => {
      this.waypoints.forEach(otherWaypoint => {
        waypoint.distances[otherWaypoint.id] = Vec2.distance(waypoint.position, otherWaypoint.position)
      })
    })
    this.radii.forEach(radius => {
      this.stage.debug({ v: `Initializing radius ${radius}...` })
      // Initialize distance array for each waypoint for this radius
      let distanceDivisor = 10
      let distanceNextDivisor = 100
      this.waypoints.forEach((waypoint, index) => {
        const remainder = index % distanceDivisor
        const divisible = remainder === 0
        if (divisible && index !== 0) {
          this.stage.debug({ v: `Waypoint ${index}/${this.waypoints.size}...` })
        }
        if (index === distanceNextDivisor) {
          distanceDivisor = distanceNextDivisor
          distanceNextDivisor *= 10
        }
        const distances = range(1, this.waypoints.size).map(i => Infinity)
        waypoint.pathDistances.set(radius, distances)
      })
      // Compute the minimal path distance from each waypoint to each other waypoint
      const radiusWaypoints = this.waypoints // this.radiiWaypoints.get(radius)
      if (radiusWaypoints == null) throw new Error('No waypoints found for this radius')
      // Why are there two for loops?
      /*
      Becuase we calculating the path lengths recursively.
      We start with calucating the lenght of short paths.
      We use these results to calculate the length of slightly longer paths.
      We repeast this process enough times to ensure:
        we have calculated the lenght of the longest posssible not-cyclical paths.
      How many times do we need to repeat this: the number of waypoints.
      Becuase the length of the longest possible non-cyclical path is equal to:
        the number of waypoints.
      */
      this.stage.debug({ v: `Pathing ${radiusWaypoints.size} waypoints...` })
      let pathDivisor = 10
      let pathNextDivisor = 100
      radiusWaypoints.forEach((step, index) => {
        const remainder = index % pathDivisor
        const divisible = remainder === 0
        if (divisible && index !== 0) {
          this.stage.debug({ v: `Path length ${index}/${radiusWaypoints.size}...` })
        }
        if (index === pathNextDivisor) {
          pathDivisor = pathNextDivisor
          pathNextDivisor *= 10
        }
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
    let divisor = 100
    let nextDivisor = 1000
    this.waypoints.forEach((waypoint, index) => {
      const remainder = index % divisor
      if (remainder === 0) {
        this.stage.debug({ v: `Waypoint ${waypoint.id}/${this.waypoints.size}...` })
      }
      if (index === nextDivisor) {
        divisor = nextDivisor
        nextDivisor *= 10
      }
      this.radii.forEach(radius => {
        const neighbors = this.getNeighborsRaycast(waypoint.position, radius)
        waypoint.neighbors.set(radius, neighbors)
      })
    })
  }

  isPointReachable (start: Vec2, end: Vec2, radius: number, otherRadius?: number): boolean {
    const largerRadii = this.stage.navigation.radii.filter(rad => rad >= radius)
    const minimumRadius = Math.min(...largerRadii)
    const nextPoint = this.stage.navigation.navigate(start, end, minimumRadius, otherRadius)
    const nextPosition = nextPoint instanceof Vec2 ? nextPoint : nextPoint.position
    const distance = Vec2.distance(start, nextPosition)
    return distance > 0
  }

  isOpen (props: {
    fromPosition: Vec2
    toPosition: Vec2
    radius: number
    otherRadius?: number
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
    if (props.otherRadius != null) {
      ends[0] = Vec2.combine(1, ends[0], -props.otherRadius, direction)
      ends[1] = Vec2.combine(1, ends[1], -props.otherRadius, direction)
      ends[2] = Vec2.combine(1, ends[2], -props.otherRadius, direction)
    }
    const opens = [true, true, true]
    range(0, 2).forEach(index => {
      const start = starts[index]
      const end = ends[index]
      this.stage.world.rayCast(start, end, (fixture, point, normal, fraction) => {
        const data = fixture.getBody().getUserData()
        if (!(data instanceof Feature)) return 1
        if (!(data instanceof Structure)) return 1
        opens[index] = false
        return 0
      })
    })
    const allOpen = opens.every(x => x)
    if (this.stage.flags.isOpen) {
      range(0, 2).forEach(index => {
        const start = starts[index]
        const end = ends[index]
        this.stage.debugLine({
          a: start,
          b: end,
          color: opens[index] ? CYAN : RED,
          width: 0.15
        })
      })
    }
    return allOpen
  }

  getNeighbors (position: Vec2, radius: number): Waypoint[] {
    const navAreas = this.navAreas.filter(navArea => {
      return navArea.testPoint(position)
    })
    return navAreas.flatMap(navArea => navArea.waypoints)
  }

  getNeighborsRaycast (position: Vec2, radius: number): Waypoint[] {
    const validWaypoints = this.radiiWaypoints.get(radius)
    if (validWaypoints == null) return []
    const neighbors = validWaypoints.filter(otherWaypoint => {
      if (Vec2.distance(position, otherWaypoint.position) === 0) return false
      const open1 = this.isOpen({
        fromPosition: position,
        toPosition: otherWaypoint.position,
        radius
      })
      const open2 = this.isOpen({
        fromPosition: otherWaypoint.position,
        toPosition: position,
        radius
      })
      return open1 && open2
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

  onStep (): void {
    const playing = [...this.stage.actors.values()].some(actor => {
      if (!(actor instanceof Organism)) return false
      return actor.player
    })
    if (!playing) return
    const debugRadius = 1.2
    if (this.stage.flags.navAreas) {
      this.navAreas.forEach(navArea => {
        this.stage.debugBox({
          box: navArea.aabb,
          color: LIME
        })
      })
    }
    if (this.stage.flags.waypoints) {
      this.waypoints.forEach(waypoint => {
        if (waypoint.radius === debugRadius) {
          this.stage.debugCircle({
            circle: new Circle(waypoint.position, 0.2),
            color: WHITE
          })
        }
      })
    }
  }
}
