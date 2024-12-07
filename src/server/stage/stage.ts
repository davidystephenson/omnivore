import { World, Vec2, Contact, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from '../runner'
import { Organism } from '../actor/organism'
import { Wall } from '../actor/wall'
import { Actor } from '../actor/actor'
import { Brick } from '../actor/brick'
import { Feature } from '../feature/feature'
import { Killing } from '../death/killing'
import { Rgb, RED, Rgba } from '../../shared/color'
import { DebugLine } from '../../shared/debugLine'
import { Vision } from '../vision'
import { Puppet } from '../actor/puppet'
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
import { Spawnpoint } from '../spawnpoint'
import { Flags } from '../flags'

export class Stage {
  actors = new Map<number, Actor>()
  debugger: Debugger
  destructionQueue: Body[] = []
  fallQueue: Tree[] = []
  flags: Flags
  food: Food[] = []
  halfHeight: number
  halfWidth: number
  killingQueue: Killing[] = []
  navigation: Navigation
  players = new Map<string, Player>()
  runner: Runner
  spawner: Spawner
  starvationQueue: Starvation[] = []
  virtualBoxes: AABB[] = []
  vision: Vision
  walls: Wall[] = []
  world: World
  timings = {
    vision: 0,
    movement: 0,
    explore: 0,
    isVisible: 0,
    isPointInRange: 0,
    sort: 0,
    target: 0,
    maneuver: 0,
    sortNearest: 0,
    maneuverElse: 0
  }

  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    this.flags = props.flags
    this.debugger = new Debugger()
    this.world = new World({ gravity: Vec2(0, 0) })
    this.world.on('pre-solve', contact => this.preSolve(contact))
    this.world.on('begin-contact', contact => this.beginContact(contact))
    this.world.on('end-contact', contact => this.endContact(contact))

    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    this.navigation = new Navigation({ stage: this })
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })
    this.spawner = new Spawner(this)
  }

  addBrick (props: {
    angle?: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): Brick {
    const brick = new Brick({ stage: this, ...props })
    return brick
  }

  addOrganism (props: {
    color: Rgb
    position: Vec2
    gene: Gene
  }): Organism {
    const organism = new Organism({ stage: this, ...props })
    return organism
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
  }): Puppet {
    const puppet = new Puppet({ stage: this, ...props })
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
    // vertices: [Vec2, Vec2, Vec2]
    position: Vec2
  }): Tree {
    const puppet = new Tree({
      stage: this,
      ...props
    })
    return puppet
  }

  addWall (props: { halfWidth: number, halfHeight: number, position: Vec2 }): Wall {
    const wall = new Wall({ stage: this, ...props })
    this.walls.push(wall)
    return wall
  }

  // TODO Compare to tree food size
  addFood (props: {
    nutrition?: number
    position: Vec2
    vertices: Vec2[]
  }): Food {
    const food = new Food({ stage: this, ...props })
    return food
  }

  addFoodSquare (props: {
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
      position: props.position,
      nutrition: props.nutrition,
      vertices
    })
  }

  addFruit (props: {
    position: Vec2
  }): Food {
    return this.addFoodSquare({
      halfSize: 1.25,
      position: props.position
    })
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
      this.addWall({ halfWidth: props.halfWidth, halfHeight: props.halfHeight, position })
    })
  }

  beginContact (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const pairs = [
      [fixtureA, fixtureB],
      [fixtureB, fixtureA]
    ]
    pairs.forEach(pair => {
      const fixture = pair[0]
      const otherFixture = pair[1]
      const sensorContact = fixture.isSensor() || otherFixture.isSensor()
      const feature = fixture.getBody().getUserData()
      const otherFeature = otherFixture.getBody().getUserData()
      if (!(otherFeature instanceof Feature)) return
      if (feature instanceof Spawner && !otherFixture.isSensor()) {
        const spawnPoint = fixture.getUserData()
        if (!(spawnPoint instanceof Spawnpoint)) {
          throw new Error('spawnPoint is not a SpawnPoint')
        }
        if (otherFeature.actor.label === 'food') {
          return false
        }
        spawnPoint.collideCount += 1
      }
      if (!(feature instanceof Feature)) return
      const actor = feature.actor
      const otherActor = otherFeature.actor
      if (sensorContact) {
        if (fixture.isSensor() && !otherFixture.isSensor()) {
          feature.sensorFeatures.push(otherFeature)
        }
        return
      } else {
        if (actor instanceof Tree) this.fallQueue.push(actor)
        if (otherActor instanceof Tree) this.fallQueue.push(otherActor)
      }
      feature.contacts.push(otherFeature)
    })
  }

  endContact (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const pairs = [
      [fixtureA, fixtureB],
      [fixtureB, fixtureA]
    ]
    pairs.forEach(pair => {
      const fixture = pair[0]
      const otherFixture = pair[1]
      const feature = fixture.getBody().getUserData()
      const otherFeature = otherFixture.getBody().getUserData()
      if (!(otherFeature instanceof Feature)) return
      if (feature instanceof Spawner && !otherFixture.isSensor()) {
        const spawnPoint = fixture.getUserData()
        if (!(spawnPoint instanceof Spawnpoint)) {
          throw new Error('spawnPoint is not a SpawnPoint')
        }
        if (otherFeature.actor.label === 'food') {
          return false
        }
        spawnPoint.collideCount -= 1
      }
      if (!(feature instanceof Feature)) return
      feature.contacts = feature.contacts.filter(contact => contact.id !== otherFeature.id)
      if (fixture.isSensor() && !otherFixture.isSensor()) {
        feature.sensorFeatures = feature.sensorFeatures.filter(contact => contact.id !== otherFeature.id)
      }
    })
  }

  flag <Value> (props: {
    f: keyof Flags
  } & LogProps<Value>): void {
    const raised = this.flags[props.f]
    if (!raised) {
      return
    }
    this.debug(props)
  }

  preSolve (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const pairs = [
      [fixtureA, fixtureB],
      [fixtureB, fixtureA]
    ]
    pairs.forEach(pair => {
      const fixture = pair[0]
      const otherFixture = pair[1]
      const sensorContact = fixture.isSensor() || otherFixture.isSensor()
      const feature = fixture.getBody().getUserData()
      const otherFeature = otherFixture.getBody().getUserData()
      if (!(feature instanceof Feature)) return
      if (!(otherFeature instanceof Feature)) return
      const actor = feature.actor
      const otherActor = otherFeature.actor
      if (!sensorContact) {
        if (actor instanceof Tree) this.fallQueue.push(actor)
        if (otherActor instanceof Tree) this.fallQueue.push(otherActor)
      }
    })
  }

  debug<Value>(props: LogProps<Value>): void {
    this.debugger.debug(props)
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

  debugBox (props: {
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

  onStep (props: {
    stepSize: number
  }): void {
    this.timings = { vision: 0, movement: 0, explore: 0, isPointInRange: 0, sort: 0, isVisible: 0, target: 0, maneuver: 0, sortNearest: 0, maneuverElse: 0 }
    this.debugger.onStep()
    this.navigation.onStep()
    this.spawner.onStep()
    this.players.forEach(player => player.onStep({ stepSize: props.stepSize }))
    const bots = [...this.actors.values()].filter(actor => actor instanceof Organism && actor.player == null)
    this.time({ label: 'bots' })
    bots.forEach(actor => actor.onStep({ stepSize: props.stepSize }))
    this.timeEnd({ label: 'bots' })
    const nonBots = [...this.actors.values()].filter(actor => !(actor instanceof Organism) || actor.player != null)
    nonBots.forEach(actor => actor.onStep({ stepSize: props.stepSize }))
    this.destructionQueue.forEach(body => {
      this.world.destroyBody(body)
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
      this.debugBox({ box, color: RED })
    })
    if (this.runner.timing) {
      console.log('maneuver', this.timings.maneuver.toFixed(2))
      console.log('sortNearest', this.timings.sortNearest.toFixed(2))
      console.log('maneuverElse', this.timings.maneuverElse.toFixed(2))
    }
  }
}
