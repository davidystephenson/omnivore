import { World, Vec2, Contact, Body, AABB, PolygonShape, CircleShape } from 'planck'
import { Runner } from './runner'
import { Player } from './actor/player'
import { Wall } from './actor/wall'
import { Actor } from './actor/actor'
import { Brick } from './actor/brick'
import { Feature } from './feature/feature'
import { Mouth } from './feature/mouth'
import { Barrier } from './feature/barrier'
import { Killing } from './killing'
import { Color } from '../shared/color'
import { DebugLine } from '../shared/debugLine'
import { Vision } from './vision'
// import { Puppet } from './actor/puppet'
import { range } from './math'
import { DebugCircle } from '../shared/debugCircle'
import SIGHT from '../shared/sight'

export class Stage {
  world: World
  runner: Runner
  vision: Vision
  destructionQueue: Body[] = []
  respawnQueue: Player[] = []
  killingQueue: Killing[] = []
  actors = new Map<number, Actor>()

  constructor () {
    this.world = new World({ gravity: Vec2(0, 0) })
    this.world.on('pre-solve', contact => this.preSolve(contact))
    this.world.on('begin-contact', contact => this.beginContact(contact))
    this.runner = new Runner({ stage: this })
    this.vision = new Vision({ stage: this })

    // outer walls
    // this.addWall({ halfWidth: 50, halfHeight: 1, position: Vec2(0, 50) })
    // this.addWall({ halfWidth: 50, halfHeight: 1, position: Vec2(0, -50) })
    // this.addWall({ halfWidth: 1, halfHeight: 50, position: Vec2(50, 0) })
    // this.addWall({ halfWidth: 1, halfHeight: 50, position: Vec2(-50, 0) })

    // inner walls
    /*
    this.addWall({ halfWidth: 10, halfHeight: 1, position: Vec2(0, 10) })
    this.addWall({ halfWidth: 10, halfHeight: 1, position: Vec2(0, -10) })
    this.addWall({ halfWidth: 1, halfHeight: 15, position: Vec2(20, 0) })
    this.addWall({ halfWidth: 1, halfHeight: 15, position: Vec2(-20, 0) })
    */

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

    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, 9.9) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, 7.7) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, 5.5) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, 3.3) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, 1.1) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, -1.1) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, -3.3) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, -5.5) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, -7.7) })
    this.addWall({ halfWidth: SIGHT.x - 1.1, halfHeight: 1, position: Vec2(-14, -9.9) })
    void new Brick({ stage: this, halfWidth: 1, halfHeight: 10, position: Vec2(-14 + SIGHT.x - 0.1, 0) })
    // void new Brick({ stage: this, halfWidth: 1, halfHeight: 2, position: Vec2(-5, 0) })
    // this.addWall({ halfWidth: 0.5, halfHeight: 3, position: Vec2(-2, 0) })
    // void new Brick({ stage: this, halfWidth: 2, halfHeight: 1, position: Vec2(2, 3) })
    this.addWall({ halfWidth: 1, halfHeight: 6, position: Vec2(5, 3) })
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

  addPlayer (props: { position: Vec2 }): Player {
    const player = new Player({ stage: this, ...props })
    return player
  }

  addWall (props: { halfWidth: number, halfHeight: number, position: Vec2 }): Wall {
    const wall = new Wall({ stage: this, ...props })
    return wall
  }

  onStep (): void {
    this.actors.forEach(actor => actor.onStep())
    this.destructionQueue.forEach(body => {
      this.world.destroyBody(body)
    })
    this.respawnQueue.forEach(player => {
      player.respawn()
    })
    this.killingQueue.forEach(killing => killing.execute())
    this.killingQueue = []
    this.respawnQueue = []
    this.destructionQueue = []
  }

  beginContact (contact: Contact): void {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const featureA = fixtureA.getBody().getUserData() as Feature
    const featureB = fixtureB.getBody().getUserData() as Feature
    const mouthyA = featureA instanceof Mouth
    const mouthyB = featureB instanceof Mouth
    const mouthy = mouthyA || mouthyB
    if (!mouthy) return
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
        feature.health -= feature instanceof Mouth ? 0.2 : 0.5
        feature.color.alpha = featureA.health
      }
      if (feature.health <= 0) {
        if (feature.actor instanceof Player) {
          this.respawnQueue.push(feature.actor)
          const killing = new Killing({
            victim: feature as Mouth,
            stage: this,
            killer: otherFeature as Mouth
          })
          this.killingQueue.push(killing)
        } else {
          this.destructionQueue.push(feature.body)
          this.actors.delete(feature.actor.id)
        }
      }
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
      if (feature.label === 'egg' && otherFeature.label === 'mouth') contact.setEnabled(false)
      // if (feature.label === 'egg' && otherFeature.label === 'crate') contact.setEnabled(false)
    })
  }
}
