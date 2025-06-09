import { World, Vec2, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from '../runner'
import { Organism } from '../actor/organism'
import { Wall } from '../actor/wall'
import { Actor } from '../actor/actor'
import { Rock } from '../actor/rock'
import { Feature } from '../feature/feature'
import { Killing } from '../death/killing'
import { Rgb, RED, Rgba } from '../../shared/color'
import { DebugLine } from '../../shared/debugLine'
import { Vision } from '../vision'
import { River } from '../actor/river'
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
import { Manager, SerializationError } from '../../manager'
import { Index, Promptbook } from '../types'
import fs from 'fs'

export class Stage {
  actors = new Map<number, Actor>()
  debugger: Debugger
  destructionQueue: Body[] = []
  fallQueue: Tree[] = []
  families: Map<string, Organism[]> = new Map()
  flags: Flags
  food: Food[] = []
  halfHeight: number
  halfWidth: number
  killingQueue: Killing[] = []
  manager: Manager
  navigation: Navigation
  players = new Map<string, Player>()
  runner: Runner
  spawner: Spawner
  starvationQueue: Starvation[] = []
  virtualBoxes: AABB[] = []
  vision: Vision
  walls: Wall[] = []
  world: World
  collider: Collider
  checkCount = 0

  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    this.flags = props.flags
    this.debugger = new Debugger()
    this.manager = new Manager()
    this.world = new World({ gravity: Vec2(0, 0) })
    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    this.navigation = new Navigation({ stage: this })
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })
    this.spawner = new Spawner(this)
    this.collider = new Collider(this)
  }

  addBrick (props: {
    angle?: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): Rock {
    const brick = new Rock({ stage: this, ...props })
    return brick
  }

  addFood (props: {
    color?: Rgb
    nutrition?: number
    position: Vec2
    vertices: Vec2[]
  }): Food {
    const food = new Food({ stage: this, ...props })
    return food
  }

  addFoodSquare (props: {
    color?: Rgb
    halfSize: number
    nutrition?: number
    position: Vec2
  }): Food {
    const y0 = 0 - props.halfSize
    const y1 = 0 + props.halfSize
    const x0 = 0 - props.halfSize
    const x1 = 0 + props.halfSize
    const vertices = [
      Vec2(x0, y0),
      Vec2(x1, y0),
      Vec2(x1, y1),
      Vec2(x0, y1)
    ]
    return this.addFood({
      color: props.color,
      position: props.position,
      nutrition: props.nutrition,
      vertices
    })
  }

  // TODO Compare to tree food size
  addFruit (props: {
    position: Vec2
  }): Food {
    return this.addFoodSquare({
      halfSize: 1.25,
      position: props.position
    })
  }

  addInnerWall (props: {
    halfWidth: number
    halfHeight: number
    position: Vec2
  }): Wall {
    return this.addWall({ ...props, outer: false })
  }

  addOrganism (props: {
    color: Rgb
    position: Vec2
    gene: Gene
  }): Organism {
    const organism = new Organism({ stage: this, ...props })
    return organism
  }

  addOuterWall (props: {
    halfWidth: number
    halfHeight: number
    position: Vec2
  }): Wall {
    return this.addWall({ ...props, outer: true })
  }

  addPlayer (props: {
    color: Rgb
    id: string
    position: Vec2
    gene: Gene
  }): Player {
    const player = new Player({ stage: this, ...props })
    return player
  }

  addPuppet (props: {
    vertices: [Vec2, Vec2, Vec2]
    position: Vec2
    force: Vec2
    speed: number
  }): River {
    const puppet = new River({ stage: this, ...props })
    return puppet
  }

  addPuppets (props: {
    count: number
    spacing: number
    vertices: [Vec2, Vec2, Vec2]
    position: Vec2
  }): void {
    const puppetRange = range(1, props.count)
    const indexOffset = (props.count - 1) / 2
    puppetRange.forEach(index => {
      const offsetIndex = index - indexOffset
      const offset = props.spacing * offsetIndex
      const position = props.position.clone()
      position.y += offset
      this.addPuppet({ vertices: props.vertices, position, force: Vec2(0, 0), speed: 0 })
    })
  }

  addTree (props: {
    position: Vec2
  }): Tree {
    const puppet = new Tree({
      stage: this,
      ...props
    })
    return puppet
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

  addBricks (props: {
    angle?: number
    count: number
    gap: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): void {
    const brickRange = range(1, props.count)
    const indexOffset = (props.count) / 2
    const height = props.halfHeight * 2
    const offsetHeight = height + props.gap
    brickRange.forEach(index => {
      const offsetIndex = index - indexOffset
      const offset = offsetHeight * offsetIndex
      const position = props.position.clone()
      position.y += offset
      this.addBrick({
        angle: props.angle,
        halfHeight: props.halfHeight,
        halfWidth: props.halfWidth,
        position
      })
    })
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

  debug<Value>(props: LogProps<Value>): void {
    this.debugger.debug(props)
  }

  debugAABB (props: {
    box: AABB
    color: Rgb
  }): void {
    const upper = props.box.upperBound.clone()
    const lower = props.box.lowerBound.clone()
    const point1 = upper
    const point2 = Vec2(lower.x, upper.y)
    const point3 = lower
    const point4 = Vec2(upper.x, lower.y)
    this.debugLine({ a: point1, b: point2, color: props.color })
    this.debugLine({ a: point2, b: point3, color: props.color })
    this.debugLine({ a: point3, b: point4, color: props.color })
    this.debugLine({ a: point4, b: point1, color: props.color })
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
  }): void {
    range(0, props.polygon.m_vertices.length - 1).forEach(i => {
      const j = (i + 1) % props.polygon.m_vertices.length
      const point1 = props.polygon.m_vertices[i]
      const point2 = props.polygon.m_vertices[j]
      this.debugLine({ a: point1, b: point2, color: props.color })
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

  getInnerWalls (): Wall[] {
    return this.walls.filter(wall => {
      const top = wall.position.y + wall.halfHeight
      const bottom = wall.position.y - wall.halfHeight
      const right = wall.position.x + wall.halfWidth
      const left = wall.position.x - wall.halfWidth
      if (top > this.halfHeight) return false
      if (bottom < -this.halfHeight) return false
      if (right > this.halfWidth) return false
      if (left < -this.halfWidth) return false
      return true
    })
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
      this.debugAABB({ box, color: RED })
    })
    this.families = new Map()
    this.actors.forEach(actor => {
      if (!(actor instanceof Organism)) return
      const family = this.families.get(actor.color.label)
      if (family != null) {
        family.push(actor)
      } else {
        this.families.set(actor.color.label, [actor])
      }
    })
  }

  saveLayout (): void {
    fs.rmSync('./promptbooks/output', { recursive: true, force: true })
    const waypointIdMatrix = this.navigation.getWaypointIdMatrix()
    const index: Index = {
      halfHeight: this.halfHeight,
      halfWidth: this.halfWidth,
      radii: this.navigation.radii,
      waypointIdMatrix
    }
    this.manager.saveToFile({ data: index, path: 'promptbooks/output/index.json' })
    const navAreaDefs = this.navigation.navAreas.map(navArea => navArea.getDef())
    this.manager.saveMany({
      data: navAreaDefs,
      path: 'promptbooks/output/navAreaDefs'
    })
    const wallDefs = this.walls.map(wall => wall.getDef())
    this.manager.saveMany({
      data: wallDefs,
      path: 'promptbooks/output/wallDefs'
    })
    const waypointDatas = this.navigation.getWaypointData()
    this.manager.saveMany({
      data: waypointDatas,
      path: 'promptbooks/output/waypointDatas'
    })
    const promptbook: Promptbook = {
      halfHeight: this.halfHeight,
      halfWidth: this.halfWidth,
      navAreaDefs,
      radii: this.navigation.radii,
      wallDefs,
      waypointDatas,
      waypointIdMatrix
    }
    try {
      console.info('Starting layout data validation...')
      this.manager.validateObject(promptbook)
      // Log validation summary
      console.info('Validation complete. Starting serialization process...')

      // Save the layout data (will convert empty/infinite values to null)
      this.manager.saveToFile({ data: promptbook, path: 'promptbooks/output.json' })
      console.info('Layout data saved successfully to output.json')
    } catch (error: unknown) {
      if (error instanceof SerializationError) {
        console.error(`Layout validation failed: ${error.message}`)
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Failed to save layout: ${errorMessage}`)
      }
    }
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
