import { Body } from 'planck'
import { Stage } from './stage'
import { Element } from '../shared/element'
import { Feature } from './feature/feature'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'
import { DebugLine } from '../shared/debugLine'
import { DebugCircle } from '../shared/debugCircle'
import { Player } from './actor/player'
import { Tree } from './actor/tree'

export class Runner {
  // intervalId: NodeJS.Timeout
  stage: Stage
  timeStep = 1 / 60
  timeScale = 1 // 1
  paused = false
  worldTime = 0
  debugLines: DebugLine[] = []
  debugCircles: DebugCircle[] = []
  features: Feature[] = []
  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  step (): void {
    if (this.paused) return
    this.worldTime += this.timeStep
    const bodies = this.getBodies()
    bodies.forEach(body => {
      const actor = body.getUserData() as Feature
      body.applyForceToCenter(actor.force)
    })
    const stepSize = this.timeStep * this.timeScale
    this.stage.actors.forEach(actor => {
      if (actor instanceof Tree) {
        actor.grow(stepSize)
      }
    })
    this.stage.world.step(stepSize)
    this.debugLines = []
    this.debugCircles = []
    this.stage.onStep(stepSize)
    this.features = this.getFeatures()
  }

  getSummary (props: {
    player: Player
  }): Summary {
    const elements = this.getElements(props.player)
    const summary = new Summary({
      elements,
      ropes: this.getRopes(props.player),
      debugLines: this.debugLines,
      debugCircles: this.debugCircles,
      stage: this.stage,
      id: props.player.membrane.id
    })
    return summary
  }

  getElements (player: Player): Element[] {
    const idsInVision = player.featuresInVision.map(feature => feature.id)
    const filteredFeatures = this.features.filter(feature => idsInVision.includes(feature.id))
    const elements: Element[] = filteredFeatures.map(feature => {
      const tree = feature.actor instanceof Tree
      const seen = player.seenIds.includes(feature.id)
      if (!seen) player.seenIds.push(feature.id)
      return feature.getElement(seen && !tree)
    })
    return elements
  }

  getRopes (player: Player): Rope[] {
    const ropes: Rope[] = []
    player.featuresInVision.forEach(feature => {
      feature.ropes.forEach(rope => {
        ropes.push(rope)
      })
    })
    /*
    this.stage.actors.forEach(actor => {
      actor.joints.forEach(joint => {
        const rope = new Rope({ joint })
        ropes.push(rope)
      })
    })
    */
    return ropes
  }

  getFeatures (): Feature[] {
    const bodies = this.getBodies()
    const features: Feature[] = []
    bodies.forEach(body => {
      const feature = body.getUserData()
      if (!(feature instanceof Feature)) {
        throw new Error('User data is not a feature')
      }
      features.push(feature)
    })
    return features
  }

  getBodies (): Body[] {
    const bodies = []
    for (
      let body = this.stage.world.getBodyList();
      body != null;
      body = body.getNext()
    ) {
      bodies.push(body)
    }
    return bodies
  }
}
