import { World, Vec2, Contact, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from './runner'
import { Player } from './actor/player'
import { Wall } from './actor/wall'
import { Actor } from './actor/actor'
import { Brick } from './actor/brick'
import { Feature } from './feature/feature'
import { Membrane } from './feature/membrane'
import { Structure } from './feature/structure'
import { Killing } from './killing'
import { Color } from '../shared/color'
import { DebugLine } from '../shared/debugLine'
import { Vision } from './vision'
import { Puppet } from './actor/puppet'
import { range } from './math'
import { DebugCircle } from '../shared/debugCircle'
import { Starvation } from './starvation'
import { LogProps, Logger } from './logger'

export class Stage {
  actors = new Map<number, Actor>()
  destructionQueue: Body[] = []
  halfHeight: number
  halfWidth: number
  killingQueue: Killing[] = []
  logger: Logger
  respawnQueue: Player[] = []
  runner: Runner
  spawnPoints: Vec2[]
  starvationQueue: Starvation[] = []
  vision: Vision
  world: World
  virtualBoxes: AABB[] = []

  constructor (props?: {
    halfHeight?: number
    halfWidth?: number
  }) {
    this.world = new World({ gravity: Vec2(0, 0) })
    this.world.on('pre-solve', contact => this.preSolve(contact))
    this.world.on('begin-contact', contact => this.beginContact(contact))

    this.halfHeight = props?.halfHeight ?? 20
    this.halfWidth = props?.halfWidth ?? 20
    this.logger = new Logger()
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

  addBrick (props: {
    angle?: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): Brick {
    const brick = new Brick({ stage: this, ...props })
    return brick
  }

  addPlayer (props: { position: Vec2 }): Player {
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

  addWall (props: { halfWidth: number, halfHeight: number, position: Vec2 }): Wall {
    const wall = new Wall({ stage: this, ...props })
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
      this.addWall({ halfWidth: props.halfWidth, halfHeight: props.halfHeight, position })
    })
  }

  beginContact (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const featureA = fixtureA.getBody().getUserData() as Feature
    const featureB = fixtureB.getBody().getUserData() as Feature
    const mebranyA = featureA instanceof Membrane
    const membranyB = featureB instanceof Membrane
    const membrany = mebranyA || membranyB
    if (!membrany) return
    const wallyA = featureA instanceof Structure
    const wallyB = featureB instanceof Structure
    const wally = wallyA || wallyB
    if (wally) return
    if (featureA.actor === featureB.actor) return
    const pairs = [
      [featureA, featureB],
      [featureB, featureA]
    ]
    const now = Date.now()
    pairs.forEach(pair => {
      const feature = pair[0]
      const otherFeature = pair[1]
      if (
        !(feature instanceof Membrane) ||
        !(otherFeature instanceof Membrane) ||
        feature.actor.dead ||
        otherFeature.actor.dead
      ) {
        return
      }
      if (feature.actor.invincibleTime === 0) {
        feature.health -= 0.5
        feature.color.alpha = featureA.health
      }
      if (feature.health <= 0) {
        this.log({
          value: ['new Killing', now]
        })
        const killing = new Killing({
          victim: feature,
          stage: this,
          killer: otherFeature
        })
        this.killingQueue.push(killing)
      }
      // if (feature.actor instanceof Player) {
      //   this.respawnQueue.push(feature.actor)
      //   const killing = new Killing({
      //     victim: feature as Membrane,
      //     stage: this,
      //     killer: otherFeature as Membrane
      //   })
      //   this.killingQueue.push(killing)
      // } else {
      //   this.destructionQueue.push(feature.body)
      //   this.actors.delete(feature.actor.id)
      // }
    })
  }

  debug <Value> (props: LogProps<Value>): void {
    this.logger.debug(props)
  }

  debugLine (props: {
    a: Vec2
    b: Vec2
    color: Color
  }): DebugLine {
    const debugLine = new DebugLine({
      a: props.a,
      b: props.b,
      color: props.color
    })
    this.runner.debugLines.push(debugLine)
    return debugLine
  }

  debugCircle (props: {
    circle: CircleShape
    color: Color
  }): DebugCircle {
    const debugCircle = new DebugCircle({
      position: props.circle.getCenter(),
      radius: props.circle.getRadius(),
      color: props.color
    })
    this.runner.debugCircles.push(debugCircle)
    return debugCircle
  }

  debugBox (props: {
    box: AABB
    color: Color
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
    color: Color
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

  log <Value> (props: LogProps<Value>): void {
    this.debug(props)
  }

  onStep (): void {
    this.logger.onStep()
    this.actors.forEach(actor => actor.onStep())
    this.destructionQueue.forEach(body => {
      this.world.destroyBody(body)
    })
    this.killingQueue.forEach(killing => {
      killing.execute()
    })
    this.starvationQueue.forEach(starvation => {
      starvation.execute()
      this.respawnQueue.push(starvation.victim.actor)
    })
    this.killingQueue = []
    this.starvationQueue = []
    this.respawnQueue = this.respawnQueue.filter(player => {
      const respawned = player.respawn()
      return !respawned
    })
    if (this.respawnQueue.length > 0) {
      this.log({ value: ['respawnQueue.length', this.respawnQueue.length] })
    }
    this.destructionQueue = []
    this.virtualBoxes.forEach(box => {
      this.debugBox({ box, color: Color.RED })
    })
  }

  preSolve (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const featureA = fixtureA.getBody().getUserData() as Feature
    const featureB = fixtureB.getBody().getUserData() as Feature
    const pairs = [
      [featureA, featureB],
      [featureB, featureA]
    ]
    pairs.forEach(pair => {
      const feature = pair[0]
      const otherFeature = pair[1]
      if (feature.label === 'egg' && otherFeature.label === 'membrane') contact.setEnabled(false)
      // if (feature.label === 'egg' && otherFeature.label === 'crate') contact.setEnabled(false)
    })
  }
}
