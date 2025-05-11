import { AABB, Circle, Fixture, Vec2 } from 'planck'
import { Stage } from './stage/stage'
import { Waypoint } from './waypoint'
import { clamp, directionFromTo, range, rotate, whichMin } from './math'
import { Feature } from './feature/feature'
import { Structure } from './feature/structure'
import { Organism } from './actor/organism'
import { CYAN, LIME, RED, WHITE } from '../shared/color'
import { NavArea } from './navArea'

export class Navigation {
  static spacing = 2
  radii = [1.2, 0.6]
  margin: number
  bigRadius: number
  smallRadius: number
  stage: Stage
  waypoints: Record<number, Waypoint> = {}
  waypointMatrix: Waypoint[][] = []
  wallOffset = 0.4
  wallWaypoints: Waypoint[] = []
  cornerWaypoints: Waypoint[] = []
  navAreas: NavArea[] = []
  blockedPairs: Waypoint[][] = []
  xCount: number
  yCount: number
  xStep: number
  yStep: number

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
    this.bigRadius = Math.max(...this.radii)
    this.smallRadius = Math.min(...this.radii)
    const bigDiameter = 2 * this.bigRadius
    this.margin = bigDiameter + 0.1
    this.xCount = Math.ceil(2 * this.stage.halfWidth / Navigation.spacing)
    this.yCount = Math.ceil(2 * this.stage.halfHeight / Navigation.spacing)
    this.xStep = 2 * this.stage.halfWidth / this.xCount
    this.yStep = 2 * this.stage.halfHeight / this.yCount
  }

  createWaypoints (): void {
    this.waypointMatrix = range(0, this.xCount).map(i => [])
    range(0, this.xCount).forEach(i => {
      range(0, this.yCount).forEach(j => {
        const x = i * this.xStep - this.stage.halfWidth + 0.0001 * (Math.random() - 0.5)
        const y = j * this.yStep - this.stage.halfHeight + 0.0001 * (Math.random() - 0.5)
        const keys = Object.keys(this.waypoints).map(s => Number(s))
        const id = Math.max(0, ...keys) + 1
        const waypoint = new Waypoint({
          position: new Vec2(x, y),
          navigation: this,
          radius: 1.2,
          category: 'grid',
          id
        })
        const aabb = new AABB(waypoint.position, waypoint.position)
        const xInside = Math.abs(waypoint.position.x) < this.stage.halfWidth
        const yInside = Math.abs(waypoint.position.y) < this.stage.halfHeight
        let open = xInside && yInside
        this.stage.world.queryAABB(aabb, (fixture: Fixture) => {
          open = false
          return false
        })
        if (open) {
          this.waypoints[waypoint.id] = waypoint
          this.waypointMatrix[i][j] = waypoint
        }
      })
    })
    range(0, this.xCount).forEach(i => {
      range(0, this.yCount).forEach(j => {
        const waypoint = this.waypointMatrix[i][j]
        if (waypoint == null) {
          const x = i * this.xStep - this.stage.halfWidth
          const y = j * this.yStep - this.stage.halfHeight
          const position = new Vec2(x, y)
          const waypoints = Object.values(this.waypoints)
          const distances = waypoints.map(waypoint => Vec2.distance(waypoint.position, position))
          this.waypointMatrix[i][j] = waypoints[whichMin(distances)]
        }
      })
    })
  }

  debugWaypoints (): void {
    const waypoints = Object.values(this.waypoints)
    waypoints.forEach(waypoint => {
      console.log(waypoint.id, 'distances.length', waypoint.distances.length)
    })
  }

  getBigWaypoints (): Waypoint[] {
    const maximumRadius = Math.max(...this.radii)
    const waypointArray = Object.values(this.waypoints)
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
      navAreas.push(new NavArea({ stage: this.stage, aabb: areaBox }))
    })
    return navAreas
  }

  getNeighbors (position: Vec2, radius: number): Waypoint[] {
    const navAreas = this.navAreas.filter(navArea => {
      return navArea.testPoint(position)
    })
    return navAreas.flatMap(navArea => navArea.waypoints)
  }

  getNeighborsRaycast (position: Vec2, radius: number): Waypoint[] {
    const waypointArray = Object.values(this.waypoints)
    if (waypointArray == null) return []
    const neighbors = waypointArray.filter(otherWaypoint => {
      const distance = Vec2.distance(position, otherWaypoint.position)
      if (distance === 0) return false
      // if (distance > 5) return false
      const open = this.isOpen({
        fromPosition: position,
        toPosition: otherWaypoint.position,
        radius
      })
      return open
    })
    return neighbors
  }

  getPath (props: {
    a: Vec2
    b: Vec2
    radius: number
    otherRadius?: number
  }): Vec2[] {
    const a = props.a
    const b = props.b
    const radius = props.radius
    const otherRadius = props.otherRadius
    let nextPoint = this.navigate(a, b, radius, otherRadius)
    let nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const path = [a, nextPosition]
    if (nextPoint instanceof Vec2) return path
    range(1, 20).forEach(() => {
      nextPoint = this.navigate(nextPosition, b, radius, otherRadius)
      nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
      path.push(nextPosition)
    })
    return path
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

  getNearWaypoint (position: Vec2): Waypoint {
    const i0 = Math.round(clamp(0, this.xCount, (position.x + this.stage.halfWidth) / this.xStep))
    const j0 = Math.round(clamp(0, this.yCount, (position.y + this.stage.halfHeight) / this.yStep))
    return this.waypointMatrix[i0][j0]
  }

  getPathDistance (start: Vec2, end: Vec2, radius: number): number {
    const bigRadii = this.radii.filter(r => r >= radius)
    const bigRadius = Math.min(...bigRadii)
    const startWaypoint = this.getNearWaypoint(start)
    const endWaypoint = this.getNearWaypoint(end)
    const pathDistances = startWaypoint.pathDistances[bigRadius]
    if (pathDistances == null) {
      throw new Error('Missing path distances')
    }
    return pathDistances[endWaypoint.id]
  }

  navigate (start: Vec2, end: Vec2, radius: number, otherRadius?: number): Waypoint | Vec2 {
    const open = this.isOpen({
      fromPosition: start,
      toPosition: end,
      radius,
      otherRadius
    })
    if (open) return end
    const bigRadii = this.radii.filter(r => r >= radius)
    const bigRadius = Math.min(...bigRadii)
    const navigateStart = performance.now()
    const startWaypoint = this.getNearWaypoint(start)
    const endWaypoint = this.getNearWaypoint(end)
    const nextWaypoints = startWaypoint.nextWaypoints[bigRadius]
    const nextWaypoint = nextWaypoints[endWaypoint.id]
    this.stage.runner.endTiming({ key: 'navigate', start: navigateStart })
    return nextWaypoint
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
      const waypointArray = Object.values(this.waypoints)
      waypointArray.forEach(waypoint => {
        if (waypoint.radius === debugRadius) {
          this.stage.debugCircle({
            circle: new Circle(waypoint.position, 0.2),
            color: WHITE
          })
        }
      })
    }
  }

  preCalculate (): void {
    const waypointArray = Object.values(this.waypoints)
    waypointArray.forEach(waypoint => {
      waypointArray.forEach(otherWaypoint => {
        waypoint.distances[otherWaypoint.id] = Vec2.distance(waypoint.position, otherWaypoint.position)
      })
    })
    this.radii.forEach((radius, radiusIndex) => {
      // Initialize distance array for each waypoint for this radius
      const radiusCount = radiusIndex + 1
      const radiusLabel = `${radiusCount}/${this.radii.length}`
      this.stage.debug({
        v: `Pathing waypoints for ${radius} (${radiusLabel})`
      })
      waypointArray.forEach((waypoint, index) => {
        const infinities: Record<number, number> = {}
        waypointArray.forEach(waypoint => { infinities[waypoint.id] = Infinity })
        waypoint.pathDistances[radius] = infinities
        waypoint.nextWaypoints[radius] = {}
      })
      // Compute the minimal path distance from each waypoint to each other waypoint
      let pathDivisor = 1
      let pathNextDivisor = 100
      const maxPathSize = 6
      const pathLengths = range(1, maxPathSize)
      pathLengths.forEach(pathLength => {
        const remainder = pathLength % pathDivisor
        const divisible = remainder === 0
        const pathLabel = `${pathLength}/${maxPathSize} r${radiusLabel}`
        if (divisible && pathLength !== 0) {
          this.stage.debug({ v: `Path length ${pathLabel}` })
        }
        if (pathLength === pathNextDivisor) {
          pathDivisor = pathNextDivisor
          pathNextDivisor *= 10
        }
        const maxId = Math.max(...Object.keys(this.waypoints).map(s => Number(s)))
        waypointArray.forEach(waypoint => {
          if (waypoint.id % 100 === 0) {
            this.stage.debug({ v: `Waypoint ${waypoint.id}/${maxId} p${pathLabel}` })
          }
          const pathDistances = waypoint.pathDistances[radius]
          if (pathDistances == null) throw new Error('Missing distances')
          const neighbors = waypoint.neighbors[radius]
          if (neighbors == null) throw new Error('Missing neighbors')
          waypointArray.forEach(otherWaypoint => {
            if (waypoint.id === otherWaypoint.id) {
              pathDistances[otherWaypoint.id] = 0
              return
            }
            const neighborArray = Object.values(neighbors)
            if (neighborArray.includes(otherWaypoint)) {
              pathDistances[otherWaypoint.id] = waypoint.distances[otherWaypoint.id]
              return
            }
            neighborArray.forEach(neighbor => {
              const neighborDistances = neighbor.pathDistances[radius]
              if (neighborDistances == null) throw new Error('Missing neighbor distances')
              const neighborDistance = neighborDistances[otherWaypoint.id]
              if (neighborDistance == null) {
                throw new Error(`Missing neighbor distance at ${otherWaypoint.id}}`)
              }
              const distanceThroughNeighbor = waypoint.distances[neighbor.id] + neighborDistance
              pathDistances[otherWaypoint.id] = Math.min(pathDistances[otherWaypoint.id], distanceThroughNeighbor)
            })
          })
        })
      })
      let maxPathDistance = 0
      waypointArray.forEach(waypoint => {
        const radii = Object.keys(waypoint.pathDistances).map(x => Number(x))
        radii.forEach(key => {
          const pathDistances = waypoint.pathDistances[radius]
          if (pathDistances == null) throw new Error('Missing distances')
        })
        const pathDistances = Object.values(waypoint.pathDistances[radius])
        maxPathDistance = Math.max(maxPathDistance, ...pathDistances)
      })
      console.log('maxPathDistance', maxPathDistance)
      if (!(maxPathDistance < Infinity)) {
        throw new Error('Infinite Path Distance')
      }

      this.stage.debug({ v: `Calculate nextWaypoints r${radiusLabel}` })
      // NOTE: Check for incorrect next waypoints. Look for loops. Save the results.
      waypointArray.forEach(waypoint => {
        if (waypoint.id % 100 === 0) {
          this.stage.log({ k: 'waypoint', v: `${waypoint.id} / ${waypointArray.length} r${radiusLabel}` })
        }
        const nextWaypoints = waypoint.nextWaypoints[radius]
        if (nextWaypoints == null) {
          throw new Error(`Missing nextWaypoints for radius ${radius}`)
        }
        const neighbors = Object.values(waypoint.neighbors[radius])
        if (neighbors == null) {
          throw new Error(`Missing neighbors for waypoint ${waypoint.id}`)
        }
        waypointArray.forEach(otherWaypoint => {
          const distances = neighbors.map(neighbor => {
            const radiusPathDistances = neighbor.pathDistances[radius]
            if (radiusPathDistances == null) {
              throw new Error('Missing neighbor pathDistances')
            }
            return waypoint.distances[neighbor.id] + radiusPathDistances[otherWaypoint.id]
          })
          nextWaypoints[otherWaypoint.id] = neighbors[whichMin(distances)]
        })
      })
    })
  }

  setupWaypoints (): void {
    this.stage.debug({ v: 'Setting up waypoints...' })
    this.createWaypoints()
    this.stage.debug({ v: 'Setting up navAreas...' })
    this.navAreas = this.getNavAreas()
    this.stage.debug({ v: `Set up ${this.navAreas.length} navAreas.` })
    this.stage.debug({ v: 'Setting up neighbors...' })
    this.setupNeighbors()
    this.stage.debug({ v: 'Calculating distances...' })
    this.preCalculate()
    this.stage.debug({ v: 'Starting the runner...' })
    setInterval(() => { this.stage.runner.step() }, 1000 * this.stage.runner.timeStep)
    this.stage.debug({ v: 'Runner started!' })
  }

  setupNeighbors (): void {
    let divisor = 100
    let nextDivisor = 1000
    const waypointArray = Object.values(this.waypoints)
    const maxId = Math.max(...waypointArray.map(w => w.id))
    waypointArray.forEach(waypoint => {
      const remainder = waypoint.id % divisor
      if (remainder === 0) {
        this.stage.debug({ v: `Waypoint ${waypoint.id}/${maxId}...` })
      }
      if (waypoint.id === nextDivisor) {
        divisor = nextDivisor
        nextDivisor *= 10
      }
      this.radii.forEach(radius => {
        const neighbors = this.getNeighborsRaycast(waypoint.position, radius)
        waypoint.neighbors[radius] = neighbors
      })
    })
  }
}
