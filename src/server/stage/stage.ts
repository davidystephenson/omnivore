import { World, Vec2, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from '../runner'
import { Organism } from '../actor/organism'
import { Wall } from '../actor/wall'
import { Actor } from '../actor/actor'
import { Feature } from '../feature/feature'
import { Killing } from '../death/killing'
import { Rgb, RED, Rgba } from '../../shared/color'
import { DebugLine } from '../../shared/debugLine'
import { Vision } from '../vision'
import { range } from '../math'
import { DebugCircle } from '../../shared/debugCircle'
import { Starvation } from '../death/starvation'
import { LogProps, Debugger } from '../debugger'
import { Navigation } from '../navigation'
import { Player } from '../actor/player'
import { Gene } from '../gene'
import { Tree } from '../actor/tree'
import { Food } from '../actor/food'
import { Spawner } from '../spawner'
import { Flags } from '../flags'
import { Collider } from '../collider'
import { Manager } from '../../manager'
import { Initial, Promptbook, WallDef, WaypointData, WaypointDef } from '../types'
import { Waypoint } from '../waypoint'
import { Nature } from '../nature'
import readWallDefs from '../readWallDefs'

export class Stage {
  actors = new Map<number, Actor>()
  bottomCenter: Vec2
  bottomLeft: Vec2
  bottomRight: Vec2
  checkCount = 0
  collider: Collider
  debugger: Debugger
  destructionQueue: Body[] = []
  fallQueue: Tree[] = []
  flags: Flags
  food: Food[] = []
  halfHeight: number
  halfWidth: number
  killingQueue: Killing[] = []
  manager: Manager
  nature: Nature
  navigation: Navigation
  initial?: Initial
  onBook: boolean
  promptbookName: string
  players = new Map<string, Player>()
  runner: Runner
  spawner: Spawner
  starvationQueue: Starvation[] = []
  topCenter: Vec2
  topLeft: Vec2
  topRight: Vec2
  virtualBoxes: AABB[] = []
  vision: Vision
  walls: Wall[] = []
  waypointDatas?: WaypointData[]
  world: World

  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
    initial?: Initial
    onBook: boolean
    promptbookName: string
    waypointDatas?: WaypointData[]
  }) {
    this.flags = props.flags
    this.initial = props.initial
    this.onBook = props.onBook
    this.promptbookName = props.promptbookName
    this.waypointDatas = props.waypointDatas
    this.debugger = new Debugger()
    this.manager = new Manager()
    this.world = new World({ gravity: Vec2(0, 0) })
    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    const quarterWidth = this.halfWidth / 2
    const quarterHeight = this.halfHeight / 2
    this.bottomCenter = Vec2(0, quarterHeight)
    this.bottomLeft = Vec2(-quarterWidth, quarterHeight)
    this.bottomRight = Vec2(quarterWidth, quarterHeight)
    this.topCenter = Vec2(0, -quarterHeight)
    this.topLeft = Vec2(-quarterWidth, -quarterHeight)
    this.topRight = Vec2(quarterWidth, -quarterHeight)
    this.nature = new Nature({ stage: this })
    this.navigation = new Navigation({ stage: this })
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })
    this.spawner = new Spawner(this)
    this.collider = new Collider(this)
    if (this.initial != null && this.waypointDatas != null) {
      const promptbook: Promptbook = {
        ...this.initial,
        waypointDatas: this.waypointDatas
      }
      this.perform({ promptbook })
    }
  }

  addInnerWall (props: {
    halfWidth: number
    halfHeight: number
    position: Vec2
  }): Wall {
    return this.addWall({ ...props, outer: false })
  }

  addOuterWall (props: {
    halfWidth: number
    halfHeight: number
    position: Vec2
  }): Wall {
    return this.addWall({ ...props, outer: true })
  }

  addPlayer (props: {
    id: string
    position?: Vec2
    gene?: Gene
  }): Player {
    const player = new Player({ stage: this, ...props })
    if (this.flags.singleGame) {
      this.nature.grown.spawn({ player })
    } else if (this.flags.extinctGame) {
      const openFamily = this.nature.players.find(family => {
        return family.members.size === 0
      })
      if (openFamily == null) {
        throw new Error('There are no open families')
      }
      openFamily.spawn({ player })
    } else {
      const minimumPlayerCount = this.nature.players.reduce((minimumPlayerCount, family) => {
        const playerCount = family.getPlayerCount()
        const minimum = Math.min(minimumPlayerCount, playerCount)
        return minimum
      }, Infinity)
      const minimumPlayerFamilies = this.nature.players.filter(family => {
        const playerCount = family.getPlayerCount()
        return playerCount === minimumPlayerCount
      })
      const minimumSize = minimumPlayerFamilies.reduce((minimumSize, family) => {
        const minimum = Math.min(minimumSize, family.members.size)
        return minimum
      }, Infinity)
      const family = minimumPlayerFamilies.find(family => family.members.size === minimumSize)
      if (family == null) {
        throw new Error('There is no available family')
      }
      family.spawn({ player })
    }
    return player
  }

  addWall (props: {
    halfWidth: number
    halfHeight: number
    outer: boolean
    position: Vec2
  }): Wall {
    const wall = new Wall({ stage: this, ...props })
    this.walls.push(wall)
    return wall
  }

  addWalls (props: {
    count: number
    gap: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): void {
    const wallRange = range(1, props.count)
    const indexOffset = (props.count) / 2
    const height = props.halfHeight * 2
    const offsetHeight = height + props.gap
    wallRange.forEach(index => {
      const offsetIndex = index - indexOffset
      const offset = offsetHeight * offsetIndex
      const position = props.position.clone()
      position.y += offset
      this.addInnerWall({ halfWidth: props.halfWidth, halfHeight: props.halfHeight, position })
    })
  }

  afterWalls (): void {
    if (this.initial != null) {
      const wallDefs = readWallDefs({
        promptbookName: this.promptbookName,
        onBook: this.onBook,
        wallCount: this.initial.wallCount
      })
      this.buildWalls({ wallDefs })
    } else {
      const wallDefs = this.walls.map(wall => wall.getDef())
      const path = `promptbooks/${this.promptbookName}/wallDefs`
      this.manager.saveMany({ data: wallDefs, path })
    }
    this.navigation.setupWaypoints({
      main: this.initial,
      waypointDefs: this.initial?.waypointIndexes
    })
  }

  buildWalls (props: {
    wallDefs: WallDef[]
  }): void {
    props.wallDefs.forEach(wallDef => {
      this.addWall({ ...wallDef, position: new Vec2(wallDef.position.x, wallDef.position.y) })
    })
  }

  buildWaypoints (props: {
    waypointDefs: WaypointDef[]
  }): void {
    props.waypointDefs.forEach(waypointDef => {
      const waypoint = new Waypoint({
        navigation: this.navigation,
        position: waypointDef.position,
        id: waypointDef.id
      })
      this.navigation.waypoints[waypoint.id] = waypoint
    })
  }

  debug<Value>(props: LogProps<Value>): void {
    this.debugger.debug(props)
  }

  debugAABB (props: {
    aabb: AABB
    color: Rgb
    width?: number
  }): void {
    const upper = props.aabb.upperBound.clone()
    const lower = props.aabb.lowerBound.clone()
    const point1 = upper
    const point2 = Vec2(lower.x, upper.y)
    const point3 = lower
    const point4 = Vec2(upper.x, lower.y)
    this.debugLine({
      a: point1, b: point2, color: props.color, width: props.width
    })
    this.debugLine({
      a: point2, b: point3, color: props.color, width: props.width
    })
    this.debugLine({
      a: point3, b: point4, color: props.color, width: props.width
    })
    this.debugLine({
      a: point4, b: point1, color: props.color, width: props.width
    })
  }

  debugCircle (props: {
    circle: CircleShape
    color: Rgb
  }): DebugCircle {
    const center = props.circle.getCenter()
    const position = { x: center.x, y: center.y }
    const radius = props.circle.getRadius()
    const color: Rgba = { alpha: 1, ...props.color }
    const debugCircle: DebugCircle = {
      position,
      radius,
      color
    }
    this.runner.debugCircles.push(debugCircle)
    return debugCircle
  }

  debugLine (props: {
    a: Vec2
    b: Vec2
    color: Rgb
    width?: number
  }): DebugLine {
    const width = props.width ?? 0.05
    const a = { x: props.a.x, y: props.a.y }
    const b = { x: props.b.x, y: props.b.y }
    const color: Rgba = { alpha: 1, ...props.color }
    const debugLine: DebugLine = {
      a,
      b,
      color,
      width
    }
    this.runner.debugLines.push(debugLine)
    return debugLine
  }

  debugPolygon (props: {
    polygon: PolygonShape
    color: Rgb
    width?: number
  }): void {
    range(0, props.polygon.m_vertices.length - 1).forEach(i => {
      const j = (i + 1) % props.polygon.m_vertices.length
      const point1 = props.polygon.m_vertices[i]
      const point2 = props.polygon.m_vertices[j]
      this.debugLine({ a: point1, b: point2, color: props.color, width: props.width })
    })
  }

  flag<Value>(props: {
    f: keyof Flags
  } & LogProps<Value>): void {
    const raised = this.flags[props.f]
    if (!raised) {
      return
    }
    this.debug(props)
  }

  flagLog<Value>(props: {
    f: keyof Flags
  } & LogProps<Value>): void {
    const raised = this.flags[props.f]
    if (!raised) {
      return
    }
    this.debug(props)
  }

  getFeaturesInShape (shape: Shape): Feature[] {
    const featuresInShape: Feature[] = []
    const origin = new Transform()
    this.runner.getBodies().forEach(body => {
      const feature = body.getUserData()
      if (!(feature instanceof Feature)) return false
      const featureShape = feature.fixture.getShape()
      const overlap = testOverlap(shape, 0, featureShape, 0, origin, body.getTransform())
      if (overlap) { featuresInShape.push(feature) }
      return true
    })
    return featuresInShape
  }

  log<Value>(props: LogProps<Value>): void {
    this.debug(props)
  }

  onStep (props: {
    stepSize: number
  }): void {
    this.debugger.onStep()
    this.navigation.onStep()
    this.spawner.onStep()
    this.nature.onStep({ stepSeconds: props.stepSize })
    this.players.forEach(player => player.onStep({ stepSize: props.stepSize }))
    const bots = [...this.actors.values()].filter(actor => actor instanceof Organism && actor.player == null)
    this.time({ label: 'bots' })
    this.checkCount = 0
    bots.forEach(actor => actor.onStep({ stepSize: props.stepSize }))
    this.timeEnd({ label: 'bots' })
    const nonBots = [...this.actors.values()].filter(actor => !(actor instanceof Organism) || actor.player != null)
    nonBots.forEach(actor => actor.onStep({ stepSize: props.stepSize }))
    this.destructionQueue.forEach(body => {
      this.world.destroyBody(body)
      const data = body.getUserData()
      if (!(data instanceof Feature)) return
      this.players.forEach(player => {
        player.seenIds = player.seenIds.filter(id => {
          return id !== data.id
        })
      })
    })
    this.killingQueue.forEach(killing => {
      killing.execute()
    })
    this.starvationQueue.forEach(starvation => {
      starvation.execute()
    })
    this.fallQueue.forEach(tree => {
      tree.fall()
    })
    this.fallQueue = []
    this.killingQueue = []
    this.starvationQueue = []
    this.destructionQueue = []
    this.virtualBoxes.forEach(box => {
      this.debugAABB({ aabb: box, color: RED })
    })
  }

  perform (props: {
    promptbook: Promptbook
  }): void {
    this.buildWalls({ wallDefs: props.promptbook.wallDefs })
    this.buildWaypoints({ waypointDefs: props.promptbook.waypointDatas })
    props.promptbook.waypointDatas.forEach(waypointData => {
      const waypoint = this.navigation.waypoints[waypointData.id]
      if (waypoint == null) throw new Error(`Missing waypoint ${waypointData.id}`)
      if (waypointData == null) return
      props.promptbook.radii.forEach(radius => {
        const nextWaypoints: Record<number, Waypoint> = {}
        const record = waypointData.nextWaypoints[radius]
        if (record == null) {
          throw new Error(`Missing waypoint ${waypointData.id} ${radius}`)
        }
        const targetIds = Object.keys(record).map(s => Number(s))
        targetIds.forEach(targetId => {
          const nextId = waypointData.nextWaypoints[radius][targetId]
          const nextWaypoint = this.navigation.waypoints[nextId]
          if (nextWaypoint == null) throw new Error(`Missing waypoint ${radius} ${targetId}`)
          nextWaypoints[targetId] = nextWaypoint
        })
        waypoint.nextWaypoints[radius] = nextWaypoints
      })
    })
    const is = [...props.promptbook.waypointIdMatrix.keys()]
    const js = [...props.promptbook.waypointIdMatrix[0].keys()]
    for (const i of is) {
      this.navigation.waypointMatrix[i] = []
      for (const j of js) {
        const id = props.promptbook.waypointIdMatrix[i][j]
        const waypoint = this.navigation.waypoints[id]
        if (waypoint == null) {
          throw new Error('missing waypoint')
        }
        this.navigation.waypointMatrix[i][j] = waypoint
      }
    }
    this.spawner.setupSpawnPoints()
    this.debug({ v: 'Starting the runner...' })
    setInterval(() => { this.runner.step() }, 1000 * this.runner.timeStep)
    this.debug({ v: 'Runner started!' })
  }

  time (props: {
    label: string
  }): void {
    if (!this.flags.performance || !this.runner.timing) return
    console.time(props.label)
  }

  timeEnd (props: {
    label: string
  }): void {
    if (!this.flags.performance || !this.runner.timing) return
    console.timeEnd(props.label)
  }
}
