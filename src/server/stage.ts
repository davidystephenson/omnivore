import { World, Vec2, Contact, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from './runner'
import { Organism } from './actor/organism'
import { Wall } from './actor/wall'
import { Actor } from './actor/actor'
import { Brick } from './actor/brick'
import { Feature } from './feature/feature'
import { Killing } from './killing'
import { Rgb, RED, Rgba } from '../shared/color'
import { DebugLine } from '../shared/debugLine'
import { Vision } from './vision'
import { Puppet } from './actor/puppet'
import { range } from './math'
import { DebugCircle } from '../shared/debugCircle'
import { Starvation } from './starvation'
import { LogProps, Logger } from './logger'
import { Navigation } from './navigation'
import { Bot } from './actor/bot'
import { Player } from './actor/player'
import { Gene } from './gene'
import { Tree } from './actor/tree'
import { Food } from './actor/food'

export class Stage {
  actors = new Map<number, Actor>()
  debugBotChase: boolean
  debugBotFlee: boolean
  debugBotPath: boolean
  debugWaypoints: boolean
  destructionQueue: Body[] = []
  halfHeight: number
  halfWidth: number
  killingQueue: Killing[] = []
  logger: Logger
  respawnQueue: Organism[] = []
  runner: Runner
  spawnPoints: Vec2[]
  starvationQueue: Starvation[] = []
  fallQueue: Tree[] = []
  vision: Vision
  walls: Wall[] = []
  food: Food[] = []
  world: World
  virtualBoxes: AABB[] = []
  navigation: Navigation

  constructor (props: {
    debugBotChase?: boolean
    debugBotFlee?: boolean
    debugBotPath?: boolean
    debugWaypoints?: boolean
    halfHeight: number
    halfWidth: number
  }) {
    this.debugBotChase = props.debugBotChase ?? false
    this.debugBotFlee = props.debugBotFlee ?? false
    this.debugBotPath = props.debugBotPath ?? false
    this.debugWaypoints = props.debugWaypoints ?? false
    this.world = new World({ gravity: Vec2(0, 0) })
    this.world.on('pre-solve', contact => this.preSolve(contact))
    this.world.on('begin-contact', contact => this.beginContact(contact))
    this.world.on('end-contact', contact => this.endContact(contact))

    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    this.logger = new Logger()
    this.navigation = new Navigation({ stage: this })
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })

    const xMin = -this.halfWidth
    const xMax = this.halfWidth
    const yMin = -this.halfHeight
    const yMax = this.halfHeight
    const steps = 10
    this.spawnPoints = range(0, steps).flatMap(i =>
      range(0, steps).map(j => {
        const x = xMin + i / steps * (xMax - xMin)
        const y = yMin + j / steps * (yMax - yMin)
        return Vec2(x, y)
      })
    )
  }

  addBot (props: {
    position: Vec2
    gene: Gene
  }): Bot {
    const organism = new Bot({ stage: this, ...props })
    return organism
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

  addPlayer (props: {
    position: Vec2
    gene: Gene
  }): Player {
    const player = new Player({ stage: this, ...props })
    return player
  }

  addPuppet (props: {
    vertices: [Vec2, Vec2, Vec2]
    position: Vec2
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
      this.addPuppet({ vertices: props.vertices, position })
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

  addFood (props: { vertices: Vec2[], position: Vec2 }): Food {
    const food = new Food({ stage: this, ...props })
    return food
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
      const feature = fixture.getBody().getUserData() as Feature
      const otherFeature = otherFixture.getBody().getUserData() as Feature
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
      const feature = fixture.getBody().getUserData() as Feature
      const otherFeature = otherFixture.getBody().getUserData() as Feature
      feature.contacts = feature.contacts.filter(contact => contact.id !== otherFeature.id)
      if (fixture.isSensor() && !otherFixture.isSensor()) {
        feature.sensorFeatures = feature.sensorFeatures.filter(contact => contact.id !== otherFeature.id)
      }
    })
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
      const feature = fixture.getBody().getUserData() as Feature
      const otherFeature = otherFixture.getBody().getUserData() as Feature
      const actor = feature.actor
      const otherActor = otherFeature.actor
      if (!sensorContact) {
        if (actor instanceof Tree) this.fallQueue.push(actor)
        if (otherActor instanceof Tree) this.fallQueue.push(otherActor)
      }
    })
  }

  debug<Value>(props: LogProps<Value>): void {
    this.logger.debug(props)
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
      const feature = body.getUserData() as Feature
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

  onStep (stepSize: number): void {
    this.logger.onStep()
    this.navigation.onStep()
    this.actors.forEach(actor => actor.onStep(stepSize))
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
    this.killingQueue = []
    this.starvationQueue = []
    this.fallQueue = []
    this.respawnQueue = this.respawnQueue.filter(organism => {
      const respawned = organism.respawn()
      return !respawned
    })
    if (this.respawnQueue.length > 0) {
      this.log({ value: ['respawnQueue.length', this.respawnQueue.length] })
    }
    this.destructionQueue = []
    this.virtualBoxes.forEach(box => {
      this.debugBox({ box, color: RED })
    })
  }
}
