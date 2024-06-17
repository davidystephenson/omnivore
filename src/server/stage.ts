import { World, Vec2, Contact, Body, AABB, PolygonShape, CircleShape, Shape, Transform, testOverlap } from 'planck'
import { Runner } from './runner'
import { Player } from './actor/player'
import { Wall } from './actor/wall'
import { Actor } from './actor/actor'
import { Brick } from './actor/brick'
import { Feature } from './feature/feature'
import { Membrane } from './feature/membrane'
import { Barrier } from './feature/barrier'
import { Killing } from './killing'
import { Color } from '../shared/color'
import { DebugLine } from '../shared/debugLine'
import { Vision } from './vision'
import { Puppet } from './actor/puppet'
import { range } from './math'
import { DebugCircle } from '../shared/debugCircle'
// import { SIGHT_HALF_WIDTH } from '../shared/sight'
import { Starvation } from './starvation'

interface DebugPair {
  key: string
  interval?: number
  value: string | number | Array<string | number>
}
interface DebugFrames { frames: number, seconds?: undefined }
interface DebugSeconds { frames?: undefined, seconds: number }
interface DebugUntimed { frames?: undefined, seconds?: undefined }
type DebugTime = DebugFrames | DebugSeconds | DebugUntimed
type DebugProps = DebugPair & DebugTime

export class Stage {
  world: World
  runner: Runner
  vision: Vision
  destructionQueue: Body[] = []
  respawnQueue: Player[] = []
  killingQueue: Killing[] = []
  starvationQueue: Starvation[] = []
  actors = new Map<number, Actor>()
  spawnPoints: Vec2[]
  debugIntervals: Record<string, number> = {}

  constructor () {
    this.world = new World({ gravity: Vec2(0, 0) })
    this.world.on('pre-solve', contact => this.preSolve(contact))
    this.world.on('begin-contact', contact => this.beginContact(contact))
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })

    const xMin = -50
    const xMax = 50
    const yMin = -50
    const yMax = 50
    const steps = 10
    this.spawnPoints = range(0, steps).flatMap(i =>
      range(0, steps).map(j => {
        const x = xMin + i / steps * (xMax - xMin)
        const y = yMin + j / steps * (yMax - yMin)
        return Vec2(x, y)
      })
    )

    // outer walls
    this.addWall({ halfWidth: 50, halfHeight: 1, position: Vec2(0, 50) })
    this.addWall({ halfWidth: 50, halfHeight: 1, position: Vec2(0, -50) })
    this.addWall({ halfWidth: 1, halfHeight: 50, position: Vec2(50, 0) })
    this.addWall({ halfWidth: 1, halfHeight: 50, position: Vec2(-50, 0) })

    // inner walls
    // this.addWall({ halfWidth: 30, halfHeight: 5, position: Vec2(0, 10) })
    // this.addWall({ halfWidth: 30, halfHeight: 5, position: Vec2(0, -10) })
    // this.addWall({ halfWidth: 15, halfHeight: 15, position: Vec2(20, 0) })
    // this.addWall({ halfWidth: 15, halfHeight: 15, position: Vec2(-20, 0) })
    this.addBrick({ halfWidth: 40, halfHeight: 10, position: Vec2(0, 35) })
    this.addBrick({ halfWidth: 40, halfHeight: 10, position: Vec2(0, -35) })

    // void new Puppet({
    //   stage: this,
    //   vertices: [
    //     Vec2(10, 15),
    //     Vec2(10, 5),
    //     Vec2(-10, -10)
    //   ],
    //   position: Vec2(0, 20)
    // })
    // void new Puppet({
    //   stage: this,
    //   vertices: [
    //     Vec2(2, 3),
    //     Vec2(2, 1),
    //     Vec2(-2, -2)
    //   ],
    //   position: Vec2(0, 5)
    // })

    // const brickX = -14 + SIGHT_HALF_WIDTH - 0.1
    // const propHalfWidth = SIGHT_HALF_WIDTH - 5
    // const wallHalfWidth = SIGHT_HALF_WIDTH - 1.1
    // const rightPropX = brickX + 1.25 + propHalfWidth
    // const leftPropX = brickX - 1.25 - propHalfWidth
    // this.addBrick({ halfHeight: 10, halfWidth: 1, position: Vec2(brickX, 16) })
    // this.addPuppet({
    //   vertices: [
    //     Vec2(-1, 5),
    //     Vec2(1, 5),
    //     Vec2(0, -5)
    //   ],
    //   position: Vec2(brickX, 15)
    // })
    this.addPlayer({
      position: Vec2(-10, 0)
    })
    // Wall Group
    // this.addWalls({
    //   halfWidth: wallHalfWidth,
    //   halfHeight: 1,
    //   position: Vec2(-14, 15),
    //   count: 10,
    //   gap: 0.1
    // })

    // Big puppet
    // this.addPuppet({
    //   vertices: [
    //     Vec2(propHalfWidth, 15),
    //     Vec2(-propHalfWidth, 0),
    //     Vec2(propHalfWidth, -15)
    //   ],
    //   position: Vec2(rightPropX, 15)
    // })

    // Big wall
    // this.addWall({
    //   halfWidth: 5,
    //   halfHeight: 5,
    //   position: Vec2(-10, 15)
    // })

    // Wide bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: propHalfWidth,
    //   position: Vec2(rightPropX, -20)
    // })

    // Big brick
    // this.addBrick({
    //   // angle: Math.PI * 0.9,
    //   halfHeight: 6,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX, 15)
    // })

    // Angled bricks
    // this.addBricks({
    //   angle: Math.PI * 0.75,
    //   count: 10,
    //   gap: 0.5,
    //   halfHeight: 0.5,
    //   halfWidth: propHalfWidth - 3,
    //   position: Vec2(rightPropX, 10)
    // })

    // Tight Angled bricks
    // this.addBricks({
    //   angle: Math.PI * 0.6,
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: propHalfWidth - 3,
    //   position: Vec2(rightPropX - 2, 10)
    // })

    // Misaligned walls
    // this.addWalls({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(-20, 16)
    // })
    // this.addWalls({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(-14, 15)
    // })

    // Misaligned bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(rightPropX, 15)
    // })
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(rightPropX - 5, 16)
    // })

    // Aligned walls
    // this.addWalls({
    //   count: 8,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: 0.5,
    //   position: Vec2(-10, 15)
    // })
    // this.addWalls({
    //   count: 8,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: 0.5,
    //   position: Vec2(-5, 15)
    // })

    // Aligned bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX, 16)
    // })
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX + 5, 16)
    // })

    // Aligned puppets
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2,
    //   vertices: [
    //     Vec2(-propHalfWidth, 0.8),
    //     Vec2(propHalfWidth, 0),
    //     Vec2(-propHalfWidth, -0.8)
    //   ],
    //   position: Vec2(rightPropX, 15)
    // })
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2,
    //   vertices: [
    //     Vec2(propHalfWidth, 0.8),
    //     Vec2(-propHalfWidth, 0),
    //     Vec2(propHalfWidth, -0.8)
    //   ],
    //   position: Vec2(rightPropX, 16)
    // })

    // Misaligned puppets
    // this.addPuppets({
    //   count: 2,
    //   spacing: 10.1,
    //   vertices: [
    //     Vec2(-1, 5),
    //     Vec2(1, 0),
    //     Vec2(-1, -5)
    //   ],
    //   position: Vec2(leftPropX - 5, 15)
    // })
    // this.addPuppets({
    //   count: 2,
    //   spacing: 10.1,
    //   vertices: [
    //     Vec2(-1, 5),
    //     Vec2(1, 0),
    //     Vec2(-1, -5)
    //   ],
    //   position: Vec2(leftPropX, 16.5)
    // })

    // Puppet Group
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2.1,
    //   vertices: [
    //     Vec2(-propHalfWidth, 1),
    //     Vec2(propHalfWidth, 0),
    //     Vec2(-propHalfWidth, -1)
    //   ],
    //   position: Vec2(rightPropX, 15)
    // })

    // void new Brick({ stage: this, halfWidth: 1, halfHeight: 2, position: Vec2(-5, 0) })
    // this.addWall({ halfWidth: 0.5, halfHeight: 3, position: Vec2(-2, 0) })
    // void new Brick({ stage: this, halfWidth: 2, halfHeight: 1, position: Vec2(2, 3) })
    // this.addWall({ halfWidth: 1, halfHeight: 6, position: Vec2(5, 3) })
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
    const wallyA = featureA instanceof Barrier
    const wallyB = featureB instanceof Barrier
    const wally = wallyA || wallyB
    if (wally) return
    if (featureA.actor === featureB.actor) return
    const pairs = [
      [featureA, featureB],
      [featureB, featureA]
    ]
    pairs.forEach(pair => {
      const feature = pair[0]
      const otherFeature = pair[1]
      if (!(otherFeature.actor instanceof Player) && feature.actor instanceof Player) return
      if (feature.actor.invincibleTime === 0) {
        feature.health -= 0.5
        feature.color.alpha = featureA.health
      }
      if (feature.health <= 0) {
        if (feature.actor instanceof Player) {
          this.respawnQueue.push(feature.actor)
          const killing = new Killing({
            victim: feature as Membrane,
            stage: this,
            killer: otherFeature as Membrane
          })
          this.killingQueue.push(killing)
        } else {
          this.destructionQueue.push(feature.body)
          this.actors.delete(feature.actor.id)
        }
      }
    })
  }

  debug (props: DebugProps): void {
    const message = Array.isArray(props.value)
      ? props.value.join(' ')
      : props.value
    const interval = props.frames == null
      ? props.seconds == null
        ? 300
        : props.seconds * 60
      : props.frames
    const debugInterval = this.debugIntervals[props.key]
    if (debugInterval == null) {
      this.debugIntervals[props.key] = 0
      console.debug(props.key, message)
      return
    }
    const remainder = debugInterval % interval
    const debugging = remainder === 0
    if (debugging) {
      console.debug(props.key, message)
    }
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

  log (props: DebugProps): void {
    this.debug(props)
  }

  onStep (): void {
    for (const key in this.debugIntervals) {
      this.debugIntervals[key] += 1
    }
    this.actors.forEach(actor => actor.onStep())
    this.destructionQueue.forEach(body => {
      this.world.destroyBody(body)
    })
    this.killingQueue.forEach(killing => killing.execute())
    this.starvationQueue.forEach(starvation => {
      starvation.execute()
      this.respawnQueue.push(starvation.victim.actor)
    })
    this.killingQueue = []
    this.starvationQueue = []
    this.log({
      key: 'this.respawnQueue.length',
      value: this.respawnQueue.length
    })
    this.respawnQueue = this.respawnQueue.filter(player => {
      const respawned = player.respawn()
      return !respawned
    })
    this.destructionQueue = []
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
