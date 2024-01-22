import { Body } from 'planck'
import { Stage } from './stage'
import { Component } from '../shared/component'
import { Actor } from './actors/actor'
import { Summary } from '../shared/summary'

export class Runner {
  stage: Stage
  timeStep = 1 / 60
  timeScale = 1
  paused = false
  components: Component[]

  constructor (props: {
    stage: Stage
  }) {
    console.log('runner')
    this.stage = props.stage
    this.components = this.getComponents()
    setInterval(() => this.step(), this.timeStep)
  }

  step (): void {
    if (this.paused) return
    const bodies = this.getBodies()
    bodies.forEach(body => {
      const actor = body.getUserData() as Actor
      body.applyForceToCenter(actor.force)
    })
    const stepSize = this.timeStep * this.timeScale
    this.stage.world.step(stepSize)
    this.components = this.getComponents()
    this.stage.onStep()
  }

  getSummary (props: {
    actor: Actor
  }): Summary {
    const summary = new Summary({
      components: this.components,
      position: props.actor.body.getPosition()
    })
    return summary
  }

  getComponents (): Component[] {
    const bodies = this.getBodies()
    const components: Component[] = []
    bodies.forEach(body => {
      const actor = body.getUserData() as Actor
      const component = new Component({ actor })
      components.push(component)
    })
    return components
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
