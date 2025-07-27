import { AABB, Circle, CircleShape, Fixture, Vec2 } from 'planck'
import { Stage } from './stage/stage'
import { Waypoint } from './waypoint'
import { clamp, directionFromTo, range, rotate, whichMin } from './math'
import { Feature } from './feature/feature'
import { Structure } from './feature/structure'
import { Organism } from './actor/organism'
import { COLOR, CYAN, RED, WHITE } from '../shared/color'
import { MainIndex, NumberMatrix, WaypointDef } from './types'
import fs from 'fs'
import z from 'zod'
import read from './read'

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
    this.stage.debug({ k: 'Navigation margin:', v: this.margin })
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
      console.debug(waypoint.id, 'distances.length', waypoint.distances.length)
    })
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

  getWaypointIdMatrix (): NumberMatrix {
    const is = [...this.stage.navigation.waypointMatrix.keys()]
    const js = [...this.stage.navigation.waypointMatrix[0].keys()]
    const matrix: NumberMatrix = []
    for (const i of is) {
      matrix[i] = []
      for (const j of js) {
        const waypoint = this.stage.navigation.waypointMatrix[i][j]
        matrix[i][j] = waypoint.id
      }
    }
    return matrix
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

  navigate (start: Vec2, end: Vec2, radius: number, otherRadius?: number, debug?: boolean): Waypoint | Vec2 {
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
    if (debug === true) {
      this.stage.debugCircle({
        circle: new CircleShape(startWaypoint.position, 0.3),
        color: COLOR.MAGENTA
      })
      this.stage.debugCircle({
        circle: new CircleShape(endWaypoint.position, 0.3),
        color: COLOR.LIME
      })
      this.stage.debugLine({
        a: startWaypoint.position,
        b: nextWaypoint.position,
        color: COLOR.RED,
        width: 0.15
      })
    }
    this.stage.runner.endTiming({ key: 'navigate', start: navigateStart })
    return nextWaypoint
  }

  onStep (): void {
    const playing = [...this.stage.actors.values()].some(actor => {
      if (!(actor instanceof Organism)) return false
      return actor.player
    })
    if (!playing) return
    if (this.stage.flags.waypoints) {
      const waypointArray = Object.values(this.waypoints)
      waypointArray.forEach(waypoint => {
        this.stage.debugCircle({
          circle: new Circle(waypoint.position, 0.2),
          color: WHITE
        })
      })
    }
  }

  preCalculate (props: {
    radius: number
    radiusIndex: number
  }): void {
    const waypointArray = Object.values(this.waypoints)
    const radiusCount = props.radiusIndex + 1
    const radiusLabel = `${radiusCount}/${this.radii.length}`
    const pathDistancesExist = fs.existsSync(`promptbooks/output/waypointDatas/${waypointArray[0].id}/pathDistances/${props.radius}.json`)

    if (!pathDistancesExist) {
      const totalPaths = waypointArray.length * waypointArray.length
      // Initialize distance array for each waypoint for this radius

      this.stage.debug({
        v: `Pathing waypoints for ${props.radius} (${radiusLabel})`
      })
      waypointArray.forEach((waypoint, index) => {
        const infinities: Record<number, number> = {}
        waypointArray.forEach(waypoint => { infinities[waypoint.id] = Infinity })
        waypoint.pathDistances[props.radius] = infinities
      })
      // Compute the minimal path distance from each waypoint to each other waypoint
      let pathDivisor = 1
      let pathNextDivisor = 100
      const maxPathSize = 20
      let emptySteps = 0
      const pathLengths = range(1, maxPathSize)
      for (const pathLength of pathLengths) {
        let improvements = 0
        let totalChecks = 0
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
          const pathDistances = waypoint.pathDistances[props.radius]
          if (pathDistances == null) throw new Error('Missing distances')
          const neighborIds = read({
            path: `promptbooks/output/waypointDatas/${waypoint.id}/neighbors/${props.radius}.json`,
            schema: z.number().array(),
            safe: true
          })
          const neighbors = neighborIds.map(id => this.waypoints[id])
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
              const neighborDistances = neighbor.pathDistances[props.radius]
              if (neighborDistances == null) throw new Error('Missing neighbor distances')
              const neighborDistance = neighborDistances[otherWaypoint.id]
              if (neighborDistance == null) {
                throw new Error(`Missing neighbor distance at ${otherWaypoint.id}}`)
              }
              totalChecks += 1
              const distanceThroughNeighbor = waypoint.distances[neighbor.id] + neighborDistance
              if (distanceThroughNeighbor < pathDistances[otherWaypoint.id]) improvements += 1
              pathDistances[otherWaypoint.id] = Math.min(pathDistances[otherWaypoint.id], distanceThroughNeighbor)
            })
          })
        })
        let infinitePaths = 0 // NEW
        waypointArray.forEach(waypoint => {
          // OLD
          const pathDistances = Object.values(waypoint.pathDistances[props.radius])
          // NEW
          for (const pathDistance of pathDistances) {
            if (pathDistance === Infinity) infinitePaths += 1
          }
        })
        const infinitePathPercentage = (infinitePaths / totalPaths) * 100
        this.stage.debug({ v: `Infinite paths: ${infinitePaths}/${totalPaths} (${infinitePathPercentage.toFixed(5)}%)` })
        const improvedCheckPercentage = (improvements / totalChecks) * 100
        this.stage.debug({ v: `Improved checks: ${improvements}/${totalChecks} (${improvedCheckPercentage.toFixed(5)}%)` })
        if (improvements === 0) emptySteps += 1
        else emptySteps = 0
        this.stage.debug({ v: `Empty steps: ${emptySteps}` })
        if (infinitePaths === 0 && emptySteps > 1) break
      }
      let maxPathDistance = 0
      let infinitePaths = 0
      waypointArray.forEach(waypoint => {
        const pathDistances = Object.values(waypoint.pathDistances[props.radius])
        maxPathDistance = Math.max(maxPathDistance, ...pathDistances)
        for (const pathDistance of pathDistances) {
          if (pathDistance === Infinity) infinitePaths += 1
        }
      })
      const infinitePathPercentage = (infinitePaths / totalPaths) * 100
      if (!(maxPathDistance < Infinity)) {
        throw new Error(`Failure: Still ${infinitePaths}/${totalPaths} (${infinitePathPercentage.toFixed(5)}%) infinite paths`)
      }
      this.stage.debug({ v: 'Saving path distances...' })
      waypointArray.forEach((waypoint) => {
        const pathDistances = waypoint.pathDistances[props.radius]
        this.stage.manager.saveToFile({
          data: pathDistances,
          path: `promptbooks/output/waypointDatas/${waypoint.id}/pathDistances/${props.radius}.json`,
          verbose: false
        })
      })
      this.stage.debug({ v: `Stopping after path distances for ${props.radius}` })
      process.exit(0)
    }

    waypointArray.forEach(waypoint => {
      const pathDistances = read({
        path: `promptbooks/output/waypointDatas/${waypoint.id}/pathDistances/${props.radius}.json`,
        schema: z.record(z.coerce.number(), z.number()),
        safe: true
      })
      waypoint.pathDistances[props.radius] = pathDistances
      waypoint.nextWaypoints[props.radius] = {}
    })

    this.stage.debug({ v: `Calculate nextWaypoints r${radiusLabel}` })
    // NOTE: Check for incorrect next waypoints. Look for loops. Save the results.
    waypointArray.forEach(waypoint => {
      if (waypoint.id % 100 === 0) {
        this.stage.debug({ k: 'waypoint', v: `${waypoint.id} / ${waypointArray.length} r${radiusLabel}` })
      }
      const nextWaypoints = waypoint.nextWaypoints[props.radius]
      if (nextWaypoints == null) {
        throw new Error(`Missing nextWaypoints for radius ${props.radius}`)
      }
      const neighborIds = read({
        path: `promptbooks/output/waypointDatas/${waypoint.id}/neighbors/${props.radius}.json`,
        schema: z.number().array(),
        safe: true
      })
      const neighbors = neighborIds.map(id => this.waypoints[id])
      if (neighbors == null) {
        throw new Error(`Missing neighbors for waypoint ${waypoint.id}`)
      }
      waypointArray.forEach(otherWaypoint => {
        const distances = neighbors.map(neighbor => {
          const radiusPathDistances = neighbor.pathDistances[props.radius]
          if (radiusPathDistances == null) {
            throw new Error('Missing neighbor pathDistances')
          }
          return waypoint.distances[neighbor.id] + radiusPathDistances[otherWaypoint.id]
        })
        nextWaypoints[otherWaypoint.id] = neighbors[whichMin(distances)]
      })
    })

    console.info(`Saving ${waypointArray.length} waypoints for radius ${props.radius}...`)
    let waypointIndexFactor = 100
    waypointArray.forEach((waypoint, index) => {
      if (index % waypointIndexFactor === 0) {
        console.info(`Saving waypoint ${index} of ${waypointArray.length}...`)
      }
      if (index >= waypointIndexFactor * 10) {
        waypointIndexFactor *= 10
      }
      const nextWaypoints = waypoint.getNextWaypointIds({ radius: props.radius })
      this.stage.manager.saveToFile({
        data: nextWaypoints,
        path: `promptbooks/output/waypointDatas/${waypoint.id}/next/${props.radius}.json`,
        verbose: false
      })
    })
  }

  setupWaypoints (props?: {
    waypointDefs?: WaypointDef[]
    main?: MainIndex
  }): void {
    this.stage.debug({ v: 'Setting up waypoints...' })
    if (props?.waypointDefs == null) {
      this.createWaypoints()
      const waypointArray = Object.values(this.waypoints)
      console.info(`Saving ${waypointArray.length} waypoint indexes...`)
      let waypointIndexFactor = 100
      waypointArray.forEach((waypoint, index) => {
        if (index % waypointIndexFactor === 0) {
          console.info(`Saving waypoint ${index} of ${waypointArray.length}...`)
        }
        if (index >= waypointIndexFactor * 10) {
          waypointIndexFactor *= 10
        }
        const waypointIndex: WaypointDef = {
          position: { x: waypoint.position.x, y: waypoint.position.y },
          id: waypoint.id
        }
        this.stage.manager.saveToFile({
          data: waypointIndex,
          path: `promptbooks/output/waypointDatas/${waypoint.id}/index.json`,
          verbose: false
        })
      })
      this.stage.debug({ v: 'Setting up neighbors...' })
      this.setupNeighbors()
      Object.values(this.waypoints).forEach(waypoint => {
        this.radii.forEach(radius => {
          const neighborIds = waypoint.getNeighborsIds({ radius })
          this.stage.manager.saveToFile({
            data: neighborIds,
            path: `promptbooks/output/waypointDatas/${waypoint.id}/neighbors/${radius}.json`,
            verbose: false
          })
        })
      })
      this.stage.debug({ v: 'Calculating distances...' })
      let distanceFactor = 1
      waypointArray.forEach(waypoint => {
        const verbose = waypoint.id % distanceFactor === 0
        if (verbose) {
          console.info(`Calculating distances for waypoint ${waypoint.id} of ${waypointArray.length}...`)
        }
        if (waypoint.id >= distanceFactor * 10) {
          distanceFactor *= 10
        }
        waypointArray.forEach(otherWaypoint => {
          waypoint.distances[otherWaypoint.id] = Vec2.distance(waypoint.position, otherWaypoint.position)
        })
        const distancesRecord: Record<number, number> = {}
        waypointArray.forEach(otherWaypoint => {
          distancesRecord[otherWaypoint.id] = waypoint.distances[otherWaypoint.id]
        })
        if (verbose) {
          console.info(`Saving distances for waypoint ${waypoint.id} of ${waypointArray.length}...`)
        }
        this.stage.manager.saveToFile({
          data: distancesRecord,
          path: `promptbooks/output/waypointDatas/${waypoint.id}/distances.json`,
          verbose: false
        })
      })
    } else {
      this.stage.debug({ v: 'Building waypoints from waypointDefs...' })
      this.stage.buildWaypoints({ waypointDefs: props.waypointDefs })
      const waypointArray = Object.values(this.waypoints)
      this.stage.debug({ v: `Reading ${waypointArray.length} waypoint distances...` })
      waypointArray.forEach(waypoint => {
        const distances = read({
          path: `promptbooks/output/waypointDatas/${waypoint.id}/distances.json`,
          schema: z.record(z.number()),
          safe: true
        })
        const ids = Object.keys(distances).map(key => Number(key))
        ids.forEach(id => {
          waypoint.distances[id] = distances[id]
        })
      })
    }
    const waypointArray = Object.values(this.waypoints)
    // The process USED TO exit HERE
    if (props?.main == null) {
      const waypointIdMatrix = this.getWaypointIdMatrix()
      const index: MainIndex = {
        halfHeight: this.stage.halfHeight,
        halfWidth: this.stage.halfWidth,
        radii: this.radii,
        wallCount: this.stage.walls.length,
        waypointIdMatrix
      }
      this.stage.debug({ v: 'Saving main index...' })
      this.stage.manager.saveToFile({ data: index, path: 'promptbooks/output/index.json' })
    }
    if (props?.waypointDefs == null || props?.main == null) {
      console.info('Stopping after main index for progressive build')
      process.exit(0)
    }
    this.stage.debug({ k: 'Checking radii', v: this.radii })
    const missing = this.radii.find((radius, radiusIndex) => {
      this.stage.debug({ v: `Checking radius ${radius}...` })
      const missing = waypointArray.some(waypoint => {
        const path = `promptbooks/output/waypointDatas/${waypoint.id}/next/${radius}.json`
        if (waypoint.id % 100 === 0) {
          this.stage.debug({ v: `Checking ${path}` })
        }
        const exists = fs.existsSync(path)
        if (!exists) {
          this.stage.debug({ v: `Missing path ${path}` })
          return true
        }
        return false
      })
      if (missing) {
        this.preCalculate({ radius, radiusIndex })
        return true
      }
      return false
    })
    if (missing == null) {
      throw new Error('No missing radii')
    }
    const last = this.radii[this.radii.length - 1]
    if (missing !== last) {
      this.stage.debug({ v: `Stopping after radius ${missing} for progressive build` })
    } else {
      this.stage.debug({ v: 'Rehearsal complete!' })
    }
    process.exit(0)
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
