import { Body } from 'planck'
import { Stage } from './stage'
import { Element } from '../shared/element'
import { Feature } from './feature/feature'
import { Summary } from '../shared/summary'
import { Player } from './actor/player'
import { Rope } from '../shared/rope'
import { DebugLine } from '../shared/debugLine'

export class Runner {
  stage: Stage
  timeStep = 1 / 60
  timeScale = 1
  paused = false
  worldTime = 0
  elements: Element[]
  debugLines: DebugLine[] = []

  constructor (props: {
    stage: Stage
  }) {
    console.log('runner')
    this.stage = props.stage
    this.elements = this.getElements()
    setInterval(() => this.step(), 1000 * this.timeStep)
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
    this.stage.world.step(stepSize)
    this.elements = this.getElements()
    this.debugLines = []
    this.stage.onStep()
  }

  getSummary (props: {
    player: Player
  }): Summary {
    const idsInVision = props.player.featuresInVision.map(feature => feature.id)
    const filteredElements = this.elements.filter(element => idsInVision.includes(element.id))
    const summary = new Summary({
      elements: filteredElements,
      ropes: this.getRopes(props.player),
      debugLines: this.debugLines,
      id: props.player.eye.id
    })
    return summary
  }

  getElements (): Element[] {
    const bodies = this.getBodies()
    const elements: Element[] = []
    bodies.forEach(body => {
      const actor = body.getUserData() as Feature
      const element = new Element({ feature: actor })
      elements.push(element)
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
