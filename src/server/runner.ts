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
  elements: Element[]
  debugLines: DebugLine[] = []
  debugCircles: DebugCircle[] = []

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
    this.elements = this.getElements()
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
    this.elements = this.getElements()
    this.debugLines = []
    this.debugCircles = []
    this.stage.onStep(stepSize)
    this.elements = this.getElements()
  }

  getSummary (props: {
    player: Player
  }): Summary {
    const idsInVision = props.player.featuresInVision.map(feature => feature.element.id)
    const filteredElements = this.elements.filter(element => idsInVision.includes(element.id))
    const summary = new Summary({
      elements: filteredElements,
      ropes: this.getRopes(props.player),
      debugLines: this.debugLines,
      debugCircles: this.debugCircles,
      stage: this.stage,
      id: props.player.membrane.element.id
    })
    this.stage.log({ value: ['summary.elements.length 1', summary.elements.length] })
    // this.stage.log({ value: ['summary.elements', JSON.stringify(summary.elements, null, 2)], seconds: 5 })
    // summary.elements = summary.elements.filter(element => {
    //   return element.color.green !== 255 || element.color.blue !== 255
    // })
    this.stage.log({ value: ['summary.elements.length 2', summary.elements.length] })
    return summary
  }

  getElements (): Element[] {
    const bodies = this.getBodies()
    const elements: Element[] = bodies.map(body => {
      const feature = body.getUserData() as Feature
      if (!(feature instanceof Feature)) {
        throw new Error('User data is not a feature')
      }
      // if (feature.actor instanceof Food) return
      return feature.element
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
