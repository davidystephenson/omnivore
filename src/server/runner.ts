import { Body, Fixture } from 'planck'
import { Stage } from './stage/stage'
import { Element } from '../shared/element'
import { Feature } from './feature/feature'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'
import { DebugLine } from '../shared/debugLine'
import { DebugCircle } from '../shared/debugCircle'
import { Player } from './actor/player'
import { Tree } from './actor/tree'
import { Timings } from './timings'
import { Organism } from './actor/organism'

export class Runner {
  static FPS = 30
  // intervalId: NodeJS.Timeout

  paused = false
  debugLines: DebugLine[] = []
  debugCircles: DebugCircle[] = []
  features: Feature[] = []
  fps = 0
  oldStepDate?: number
  stage: Stage

  stepDate = performance.now()
  stepCount = 0
  stepCountInterval = 30
  timeStep = 1 / Runner.FPS
  timeScale = 1 // 1
  timing = false
  timings: Timings = {}

  worldTime = 0

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  debugTiming (props: {
    key: keyof Runner['timings']
  }): void {
    const value = this.timings[props.key] ?? 0
    const fixed = value.toFixed(2)
    console.debug(props.key, fixed)
  }

  endTiming (props: {
    key: keyof Runner['timings']
    start: number
  }): number {
    const now = performance.now()
    if (this.timing) {
      const difference = now - props.start
      const current = this.timings[props.key]
      if (current == null) {
        this.timings[props.key] = difference
      } else {
        const total = current + difference
        this.timings[props.key] = total
      }
    }
    return now
  }

  getBodies (): Body[] {
    const bodies: Body[] = []
    for (
      let body = this.stage.world.getBodyList();
      body != null;
      body = body.getNext()
    ) {
      bodies.push(body)
    }
    return bodies
  }

  getFixtures (): Fixture[] {
    const fixtures: Fixture[] = []
    this.getBodies().forEach(body => {
      for (
        let fixture = body.getFixtureList();
        fixture != null;
        fixture = fixture.getNext()
      ) {
        fixtures.push(fixture)
      }
    })
    return fixtures
  }

  getElements (player: Player): Element[] {
    const idsInVision = player.organism?.featuresInVision.map(feature => feature.id)
    const filteredFeatures = this.features.filter(feature => {
      return idsInVision?.includes(feature.id)
    })
    const elements: Element[] = filteredFeatures.map(feature => {
      const tree = feature.actor instanceof Tree
      const seen = player.seenIds.includes(feature.id)
      if (!seen) player.seenIds.push(feature.id)
      return feature.getElement(seen && !tree)
    })
    return elements
  }

  getFeatures (): Feature[] {
    const bodies = this.getBodies()
    const features: Feature[] = []
    bodies.forEach(body => {
      const feature = body.getUserData()
      if (feature instanceof Feature) {
        features.push(feature)
      }
    })
    return features
  }

  getRopes (player: Player): Rope[] {
    const ropes: Rope[] = []
    player.organism?.featuresInVision.forEach(feature => {
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

  getSummary (props: {
    player: Player
  }): Summary {
    const elements = this.getElements(props.player)
    const age = Math.floor(props.player.age)
    const summary: Summary = {
      age,
      elements,
      fps: this.fps,
      foodCount: this.stage.food.length,
      ropes: this.getRopes(props.player),
      debugLines: this.debugLines,
      debugCircles: this.debugCircles,
      respawn: -1
    }
    if (props.player.organism != null) {
      summary.id = props.player.organism.membrane.id
      summary.controls = props.player.organism.controls
    }
    this.stage.spawner.queue.forEach((obituary, index) => {
      if (obituary.player !== props.player) return
      summary.respawn = index
    })
    if (this.stage.flags.summary) {
      this.stage.debug({ vs: ['getSummary elements.length', elements.length], seconds: 10 })
      const json = JSON.stringify(summary)
      this.stage.debug({ vs: ['getSummary json.length', json.length], seconds: 10 })
    }
    return summary
  }

  step (): void {
    this.stepCount = this.stepCount + 1
    this.oldStepDate = this.stepDate
    this.stepDate = performance.now()
    if (this.paused) return
    const difference = this.stepDate - this.oldStepDate
    this.fps = 1000 / difference
    this.timing = this.stepCount % this.stepCountInterval === 0
    if (this.stage.flags.performance && this.timing) {
      const fpsString = this.fps.toFixed(2)
      console.info('fps', fpsString)
      const msString = difference.toFixed(2)
      console.info('ms', msString)
    }
    this.worldTime += this.timeStep
    const bodies = this.getBodies()
    bodies.forEach(body => {
      const feature = body.getUserData()
      if (!(feature instanceof Feature)) return
      body.applyForceToCenter(feature.force)
    })
    const stepSize = this.timeStep * this.timeScale
    this.stage.actors.forEach(actor => {
      if (actor instanceof Tree) {
        actor.grow(stepSize)
      }
      if (actor instanceof Organism) {
        if (actor.membrane.collideFeatures.size === 0) actor.membrane.grow(stepSize)
      }
    })
    const worldStepBefore = performance.now()
    this.stage.world.step(stepSize)
    const worldStepAfter = performance.now()
    if (this.stage.flags.performance && this.timing) {
      const worldStepDifference = worldStepAfter - worldStepBefore
      const worldStepDifferenceString = worldStepDifference.toFixed(2)
      console.info('planck', worldStepDifferenceString)
      const bodyCount = this.stage.world.getBodyCount()
      console.info('bodyCount', bodyCount)
      const fixtureCount = this.getFixtures().length
      console.info('fixtureCount', fixtureCount)
      const contactCount = this.stage.world.getContactCount()
      console.info('contactCount', contactCount)
    }
    this.debugLines = []
    this.debugCircles = []
    if (this.stage.flags.performance && this.timing) {
      console.time('stageStep')
    }
    this.timings = {}
    this.stage.onStep({ stepSize })

    if (this.stage.flags.performance && this.timing) {
      if (this.stage.flags.timings) {
        this.debugTiming({ key: 'navigate' })
        this.debugTiming({ key: 'charge' })
        this.debugTiming({ key: 'chase' })
        this.debugTiming({ key: 'wander' })
        this.debugTiming({ key: 'flee' })
        this.debugTiming({ key: 'navigate' })
        this.debugTiming({ key: 'afterIsOpen' })
        this.debugTiming({ key: 'distances' })
        this.debugTiming({ key: 'neighborToEnd' })
        this.debugTiming({ key: 'afterDistances' })
      }
      const organisms: Organism[] = []
      this.stage.actors.forEach(actor => {
        if (!(actor instanceof Organism)) {
          return
        }
        organisms.push(actor)
      })
      this.stage.flag({ f: 'organismsCount', k: 'organismsCount', v: organisms.length })
      const familyCounts: Record<string, number> = {}
      const entries = [...this.stage.families.entries()]
      entries.forEach((entry) => {
        familyCounts[entry[0]] = entry[1].length
      })
      console.log('familyCounts', familyCounts)
      console.timeEnd('stageStep')
    }
    this.features = this.getFeatures()
  }
}
