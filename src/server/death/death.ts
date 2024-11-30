import { AABB, Fixture, Vec2 } from 'planck'
import { Membrane } from '../feature/membrane'
import { Stage } from '../stage/stage'
import { Obituary, Organism } from '../actor/organism'

export class Death {
  stage: Stage
  victim: Membrane

  constructor (props: { stage: Stage, victim: Membrane }) {
    this.stage = props.stage
    this.victim = props.victim
    this.victim.actor.dead = true
    this.victim.deathPosition = this.victim.body.getPosition()
    this.victim.actor.destroy()
  }

  execute (): void {
    const actors = [...this.stage.actors.values()]
    const organisms = actors.filter((actor) => actor instanceof Organism) as Organism[]
    const relatives = organisms.filter((actor) => {
      const self = actor === this.victim.actor
      if (self) return false
      const related = actor.color === this.victim.color
      return related
    })
    if (relatives.length > 0) {
      if (this.victim.actor.player == null) {
        return
      }
      const first = relatives[0]
      const oldest = relatives.reduce((a, b) => a.createdAt < b.createdAt ? a : b, first)
      if (oldest == null) {
        throw new Error('There is no oldest relative')
      }
      this.victim.actor.player.organism = oldest
      oldest.player = this.victim.actor.player
      return
    }
    this.victim.actor.respawning = true
    const spawn: Obituary = {
      color: this.victim.actor.color,
      gene: this.victim.actor.gene,
      player: this.victim.actor.player,
      position: this.victim.deathPosition
    }
    if (this.victim.actor instanceof Organism && this.victim.actor.player != null) {
      this.victim.actor.player.age = 0
    }
    this.stage.spawner.queue.push(spawn)
  }

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
}
