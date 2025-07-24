import { AABB, CircleShape, Fixture, Vec2 } from 'planck'
import { Membrane } from '../feature/membrane'
import { Stage } from '../stage/stage'
import { Obituary, Organism } from '../actor/organism'
import { Spawnpoint } from '../spawnpoint'
import { LogProps } from '../debugger'
import { BLUE, CYAN } from '../../shared/color'

export class Death {
  static MINIMUM_SIZE = 1
  static MINIMUM_HEALTH = 0.1
  stage: Stage
  victim: Membrane

  constructor (props: { stage: Stage, victim: Membrane }) {
    if (props.victim.actor.player != null && props.stage.flags.playerDeath) {
      console.debug('Death constructor', new Date().toLocaleTimeString())
    }
    this.stage = props.stage
    this.victim = props.victim
    this.victim.actor.dead = true
    this.victim.deathPosition = this.victim.body.getPosition()
    this.victim.actor.destroy()
  }

  execute (): void {
    if (this.stage.flags.playerDeath && this.victim.actor.player != null) {
      console.debug('playerDeath execute', new Date().toLocaleTimeString())
    }
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
      if (this.stage.flags.playerDeath && this.victim.actor.player != null) {
        console.debug('playerDeath move', relatives.length, new Date().toLocaleTimeString())
      }
      this.victim.actor.player.organism = oldest
      oldest.player = this.victim.actor.player
      return
    }
    if (this.stage.flags.playerDeath && this.victim.actor.player != null) {
      console.debug('playerDeath respawn', relatives.length, new Date().toLocaleTimeString())
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
      this.victim.actor.player.ageCache = 0
      this.victim.actor.player.points = 0
    }
    this.stage.spawner.queue.push(spawn)
  }

  getArea (box: AABB): number {
    const extents = box.getExtents()
    return extents.x * extents.y
  }

  getCenter (props: {
    base: Vec2
    debug: boolean
    halfHeight: number
    halfWidth: number
    maximum: AABB
  }): Vec2 {
    const baseLeft = props.base.x - props.halfWidth
    const baseRight = props.base.x + props.halfWidth
    const baseTop = props.base.y - props.halfHeight
    const baseBottom = props.base.y + props.halfHeight
    const baseLower = Vec2(baseLeft, baseBottom)
    const baseUpper = Vec2(baseRight, baseTop)
    const baseBox = new AABB(baseLower, baseUpper)
    if (props.debug) {
      this.stage.debugAABB({ aabb: baseBox, color: CYAN, width: 0.15 })
    }
    const leftOverflow = props.maximum.lowerBound.x - baseLeft
    this.deathLog({ k: 'leftOverflow', v: leftOverflow })
    const rightOverflow = baseRight - props.maximum.upperBound.x
    this.deathLog({ k: 'rightOverflow', v: rightOverflow })
    const topOverflow = props.maximum.lowerBound.y - baseTop
    this.deathLog({ k: 'topOverflow', v: topOverflow })
    const bottomOverflow = baseBottom - props.maximum.upperBound.y
    this.deathLog({ k: 'bottomOverflow', v: bottomOverflow })
    const brickX = leftOverflow > 0
      ? props.base.x + leftOverflow
      : rightOverflow > 0
        ? props.base.x - rightOverflow
        : props.base.x
    const brickY = topOverflow > 0
      ? props.base.y + topOverflow
      : bottomOverflow > 0
        ? props.base.y - bottomOverflow
        : props.base.y
    const center = Vec2(brickX, brickY)
    if (props.debug) {
      const circle = new CircleShape(center, 0.1)
      this.stage.debugCircle({ circle, color: BLUE })
      const lower = Vec2(brickX - props.halfWidth, brickY - props.halfHeight)
      const upper = Vec2(brickX + props.halfWidth, brickY + props.halfHeight)
      const box = new AABB(lower, upper)
      this.stage.debugAABB({ aabb: box, color: BLUE, width: 0.15 })
    }
    return center
  }

  deathLog<Value>(props: LogProps<Value>): void {
    this.stage.flag({ f: 'death', ...props })
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

  trimHeight (props: { base: Vec2, lookBox: AABB }): AABB {
    const lowerBound = props.lookBox.lowerBound.clone()
    const upperBound = props.lookBox.upperBound.clone()
    const extended = new AABB(lowerBound, upperBound)
    extended.extend(-0.2)
    this.stage.world.queryAABB(extended, (fixture: Fixture): boolean => {
      const fixtureData = fixture.getUserData()
      if (fixtureData instanceof Spawnpoint) return true
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.y > props.base.y) upperBound.y = Math.min(upperBound.y, fixtureBox.lowerBound.y)
      if (fixtureBox.upperBound.y < props.base.y) lowerBound.y = Math.max(lowerBound.y, fixtureBox.upperBound.y)
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    return trimmed
  }

  trimWidth (props: { base: Vec2, lookBox: AABB }): AABB {
    const lowerBound = props.lookBox.lowerBound.clone()
    const upperBound = props.lookBox.upperBound.clone()
    const extended = new AABB(lowerBound, upperBound)
    extended.extend(-0.2)
    this.stage.world.queryAABB(extended, (fixture: Fixture): boolean => {
      const fixtureData = fixture.getUserData()
      if (fixtureData instanceof Spawnpoint) return true
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.x > props.base.x) upperBound.x = Math.min(upperBound.x, fixtureBox.lowerBound.x)
      if (fixtureBox.upperBound.x < props.base.x) lowerBound.x = Math.max(lowerBound.x, fixtureBox.upperBound.x)
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    return trimmed
  }
}
