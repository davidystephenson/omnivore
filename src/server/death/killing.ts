import { AABB, Vec2 } from 'planck'
import { HALF_SIGHT_SIZE } from '../../shared/sight'
import { Membrane } from '../feature/membrane'
import { directionFromTo, getCompass, whichMax } from '../math'
import { Stage } from '../stage/stage'
import { Death } from './death'
import { River } from '../actor/river'
import { GREEN, RED } from '../../shared/color'
// import { Feature } from '../feature/feature'

export class Killing extends Death {
  killer: Membrane

  constructor (props: { killer: Membrane, stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.killer = props.killer
  }

  execute (): void {
    if (this.stage.flags.killingGame) {
      this.stage.flag({ f: 'death', v: 'Killing.execute' })
      const killerPosition = this.killer.body.getPosition()
      console.log('killerPosition', killerPosition)
      console.log('this.victim.deathPosition', this.victim.deathPosition)
      const killerToVictim = Vec2.sub(this.victim.deathPosition, killerPosition)
      console.log('killerToVictim', killerToVictim)
      const brickDirection = getCompass(killerToVictim)
      console.log('brickDirection', brickDirection)
      const brickLookDistance = (brickDirection.x !== 0 ? HALF_SIGHT_SIZE.x : HALF_SIGHT_SIZE.y) - this.killer.radius
      const sideLookDistance = brickDirection.x !== 0 ? HALF_SIGHT_SIZE.y : HALF_SIGHT_SIZE.x
      const base = Vec2.combine(1, killerPosition, this.killer.radius, brickDirection)
      const sideDirections = [
        Vec2(-brickDirection.y, brickDirection.x),
        Vec2(brickDirection.y, -brickDirection.x)
      ]
      const nearLookPoints = sideDirections.map(sideDirection => {
        return Vec2.combine(1, base, sideLookDistance, sideDirection)
      })
      const farLookPoints = nearLookPoints.map((point: Vec2): Vec2 => {
        return Vec2.combine(1, point, brickLookDistance, brickDirection)
      })
      const lookPoints = [...nearLookPoints, ...farLookPoints]
      const lookPointsX = lookPoints.map(point => point.x)
      const lookPointsY = lookPoints.map(point => point.y)
      const lookLowerBound = Vec2(Math.min(...lookPointsX), Math.min(...lookPointsY))
      const lookUpperBound = Vec2(Math.max(...lookPointsX), Math.max(...lookPointsY))
      if (this.stage.flags.death) {
        const color = { ...RED, a: 0.1 }
        this.stage.debugBox({
          box: new AABB(lookLowerBound, lookUpperBound),
          color
        })
        this.stage.runner.paused = true
      }
      const lookBox = new AABB(lookLowerBound, lookUpperBound)
      const brickBox = this.trim({ base, lookBox })
      if (this.stage.flags.death) {
        const color = { ...GREEN, a: 0.1 }
        this.stage.debugBox({
          box: brickBox,
          color
        })
        this.stage.runner.paused = true
      }
      const averageStrength = (this.killer.actor.gene.strength + this.victim.actor.gene.strength) / 2
      const strengthFactor = Math.pow(averageStrength, 0.5)
      void strengthFactor
      const halfWidth = brickBox.getExtents().x
      const halfHeight = brickBox.getExtents().y
      const brickPosition = brickBox.getCenter()
      const localBrickCorners = [
        Vec2(+halfWidth, +halfHeight),
        Vec2(+halfWidth, -halfHeight),
        Vec2(-halfWidth, +halfHeight),
        Vec2(-halfWidth, -halfHeight)
      ]
      const brickCorners = localBrickCorners.map(localCorner => Vec2.add(brickPosition, localCorner))
      const nearestIndex = whichMax(brickCorners.map(corner => {
        return Vec2.distance(this.killer.body.getPosition(), corner)
      }))
      const localPuppetCorners = localBrickCorners.filter((corner, index) => {
        return index !== nearestIndex
      })
      const minimum = Math.min(halfWidth, halfHeight)
      this.stage.flag({ f: 'death', k: 'minimum', v: minimum })
      if (minimum > Death.MINIMUM) {
        const killerSpeed = this.killer.body.getLinearVelocity().length()
        const victimSpeed = this.victim.body.getLinearVelocity().length()
        const victimPosition = this.victim.body.getPosition()
        const power = Math.max(killerSpeed, victimSpeed) * 25
        const direction = directionFromTo(killerPosition, victimPosition)
        const force = Vec2.mul(power, direction)
        const speed = Math.min(killerSpeed, victimSpeed)
        const averageStamina = (this.killer.actor.gene.stamina + this.victim.actor.gene.stamina) / 2
        void new River({
          force,
          health: averageStamina,
          position: brickPosition,
          speed,
          stage: this.stage,
          vertices: localPuppetCorners
        })
      }
    }
    super.execute()
  }
}
