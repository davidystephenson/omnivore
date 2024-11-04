import { AABB, Fixture, Vec2 } from 'planck'
import { Membrane } from './feature/membrane'
import { Stage } from './stage'
import { Organism } from './actor/organism'

export class Death {
  stage: Stage
  victim: Membrane

  constructor (props: { stage: Stage, victim: Membrane }) {
    this.stage = props.stage
    this.victim = props.victim
  }

  execute (): void {}

  trim (props: { base: Vec2, lookBox: AABB }): AABB {
    const widthTrimmedBox = this.trimWidth(props)
    const heightTrimmedBox = this.trimHeight(props)
    const widthFirstBox = this.trimHeight({ base: props.base, lookBox: widthTrimmedBox })
    const heightFirstBox = this.trimWidth({ base: props.base, lookBox: heightTrimmedBox })
    const widthFirstArea = this.getArea(widthFirstBox)
    const heightFirstArea = this.getArea(heightFirstBox)
    if (widthFirstArea > heightFirstArea) return widthFirstBox
    return heightFirstBox
  }

  trimWidth (props: { base: Vec2, lookBox: AABB }): AABB {
    const lowerBound = props.lookBox.lowerBound.clone()
    const upperBound = props.lookBox.upperBound.clone()
    const extended = new AABB(lowerBound, upperBound)
    extended.extend(-0.2)
    this.stage.world.queryAABB(extended, (fixture: Fixture): boolean => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.x > props.base.x) upperBound.x = Math.min(upperBound.x, fixtureBox.lowerBound.x)
      if (fixtureBox.upperBound.x < props.base.x) lowerBound.x = Math.max(lowerBound.x, fixtureBox.upperBound.x)
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    return trimmed
  }

  trimHeight (props: { base: Vec2, lookBox: AABB }): AABB {
    const lowerBound = props.lookBox.lowerBound.clone()
    const upperBound = props.lookBox.upperBound.clone()
    const extended = new AABB(lowerBound, upperBound)
    extended.extend(-0.2)
    this.stage.world.queryAABB(extended, (fixture: Fixture): boolean => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.y > props.base.y) upperBound.y = Math.min(upperBound.y, fixtureBox.lowerBound.y)
      if (fixtureBox.upperBound.y < props.base.y) lowerBound.y = Math.max(lowerBound.y, fixtureBox.upperBound.y)
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    return trimmed
  }

  getArea (box: AABB): number {
    const extents = box.getExtents()
    return extents.x * extents.y
  }

  respawn (): void {
    const actors = [...this.stage.actors.values()]
    console.log('actors.length', actors.length)
    const organisms = actors.filter((actor) => actor instanceof Organism) as Organism[]
    console.log('organisms.length', organisms.length)
    const relatives = organisms.filter((actor) => {
      const relative = actor.color === this.victim.color
      return relative
    })
    console.log('relatives.length', relatives.length)
    if (relatives.length > 1) return
    console.log('respawn', this.victim.actor.color)
    this.stage.respawnQueue.push(this.victim.actor)
  }
}
