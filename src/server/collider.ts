import { Contact } from 'planck'
import { Stage } from './stage/stage'
import { Tree } from './actor/tree'
import { Feature } from './feature/feature'
import { Spawner } from './spawner'
import { Spawnpoint } from './spawnpoint'
import { Membrane } from './feature/membrane'
import { Prop } from './feature/prop'
import { Debris } from './actor/debris'
import { Curtain } from './curtain'

export class Collider {
  stage: Stage

  constructor (stage: Stage) {
    this.stage = stage
    this.stage.world.on('begin-contact', contact => this.beginContact(contact))
    this.stage.world.on('end-contact', contact => this.endContact(contact))
    this.stage.world.on('pre-solve', contact => this.preSolve(contact))
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
        if (otherFeature.actor.label === 'food') {
          return false
        }
        const data = fixture.getUserData()
        if (data instanceof Spawnpoint) {
          data.collideCount += 1
        } else if (data instanceof Curtain) {
          data.collideCount += 1
          if (otherFeature instanceof Prop && otherFeature.actor instanceof Debris) {
            otherFeature.blockCount += 1
          }
        } else {
          throw new Error('data is not a Spawnpoint or Curtain')
        }
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
        if (actor instanceof Tree) this.stage.fallQueue.push(actor)
        if (otherActor instanceof Tree) this.stage.fallQueue.push(otherActor)
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
        if (otherFeature.actor.label === 'food') {
          return false
        }
        const data = fixture.getUserData()
        if (data instanceof Spawnpoint) {
          data.collideCount -= 1
        } else if (data instanceof Curtain) {
          data.collideCount -= 1
          if (otherFeature instanceof Prop && otherFeature.actor instanceof Debris) {
            otherFeature.blockCount -= 1
          }
        } else {
          throw new Error('data is not a Spawnpoint or Curtain')
        }
      }
      if (!(feature instanceof Feature)) return
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
      const feature = fixture.getBody().getUserData()
      const otherFeature = otherFixture.getBody().getUserData()
      if (!(feature instanceof Feature)) return
      if (!(otherFeature instanceof Feature)) return
      if (feature instanceof Membrane) {
        feature.collideFeatures.add(otherFeature)
      }
      const actor = feature.actor
      const otherActor = otherFeature.actor
      if (!sensorContact) {
        if (actor instanceof Tree) this.stage.fallQueue.push(actor)
        if (otherActor instanceof Tree) this.stage.fallQueue.push(otherActor)
      }
    })
  }
}
