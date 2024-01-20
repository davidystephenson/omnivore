import { Body } from 'planck'
import { Stage } from './stage'
import { Component } from './component'
import { Actor } from './actor'

export class Runner {
  stage: Stage
  timeStep = 1 / 60
  timeScale = 1
  paused = false

  constructor (props: {
    stage: Stage
  }) {
    console.log('runner')
    this.stage = props.stage
    setInterval(() => this.step(), this.timeStep)
  }

  getComponents (): void {
    const bodies = this.getBodies()
    const components: Component[] = []
    bodies.forEach(body => {
      const actor = body.getUserData() as Actor
      const component = new Component({ actor })
      components.push(component)
    })
  }

  step (): void {
    if (this.paused) return
    const stepSize = this.timeStep * this.timeScale
    this.stage.world.step(stepSize)
    this.stage.onStep()
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
