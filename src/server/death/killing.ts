import { AABB, CircleShape, Fixture, Vec2 } from 'planck'
import { HALF_SIGHT_SIZE } from '../../shared/sight'
import { Membrane } from '../feature/membrane'
import { directionFromTo, getCompass, whichMax } from '../math'
import { Stage } from '../stage/stage'
import { Death } from './death'
import { River } from '../actor/river'
import { COLOR, GREEN, PURPLE, RED, WHITE } from '../../shared/color'
import { Feature } from '../feature/feature'
// import { Feature } from '../feature/feature'

export class Killing extends Death {
  killer: Membrane

  constructor (props: { killer: Membrane, stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.killer = props.killer
  }

  execute (): void {
    if (this.stage.flags.killingGame) {
      const debug = this.stage.flags.death || this.stage.flags.killing
      if (
        this.stage.flags.playerDeath &&
        this.victim.actor.player != null
      ) {
        const timestamp = new Date().toLocaleTimeString()
        console.debug('player killing execute', timestamp)
      }
      this.stage.flag({ f: 'death', v: 'Killing.execute' })
      const killerPosition = this.killer.body.getPosition()
      const spawnDirection = directionFromTo(killerPosition, this.victim.deathPosition)
      const brickDirection = getCompass(spawnDirection)
      const brickLookDistance = (brickDirection.x !== 0 ? HALF_SIGHT_SIZE.x : HALF_SIGHT_SIZE.y) - this.killer.radius
      const sideLookDistance = brickDirection.x !== 0 ? HALF_SIGHT_SIZE.y : HALF_SIGHT_SIZE.x
      const base = Vec2.combine(1, this.victim.deathPosition, this.victim.radius, brickDirection)
      if (debug) {
        this.stage.debugCircle({
          circle: new CircleShape(this.victim.deathPosition, 0.3),
          color: RED
        })
        this.stage.debugCircle({
          circle: new CircleShape(base, 0.3),
          color: PURPLE
        })
      }
      const checkPoint = Vec2.combine(1, this.victim.deathPosition, this.victim.radius + 0.2, brickDirection)
      const checkBox = new AABB(Vec2.sub(checkPoint, new Vec2(0.01, 0.01)), Vec2.add(checkPoint, new Vec2(0.01, 0.01)))
      let blocker = false as Feature | false
      let blocked = false
      this.stage.world.queryAABB(checkBox, (fixture: Fixture): boolean => {
        const test = fixture.testPoint(checkPoint)
        if (!test) return true
        const feature = fixture.getUserData()
        if (fixture.isSensor()) return true
        if (!(feature instanceof Feature)) {
          throw new Error('Fixture data is not a Feature')
        }
        if (debug) {
          console.debug('feature.label', feature.label)
          console.debug('feature.actor.label', feature.actor.label)
          if (feature instanceof Membrane) {
            console.debug('feature.actor.player', feature.actor.player != null)
            console.debug('feature.actor.color', feature.actor.color)
          }
        }
        blocker = feature
        blocked = true
        return false
      })
      if (blocked) {
        if (this.killer.actor.player != null && debug) {
          if (!(blocker instanceof Feature)) {
            throw new Error('Blocker is not defined')
          }
          this.stage.debugAABB({
            aabb: checkBox,
            color: COLOR.RED
          })
          const circle = new CircleShape(blocker.body.getPosition(), 0.2)
          this.stage.debugCircle({
            circle,
            color: COLOR.RED
          })
          this.stage.runner.paused = true
        }
      } else {
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
          this.stage.debugAABB({
            aabb: new AABB(lookLowerBound, lookUpperBound),
            color,
            width: 0.25
          })
          this.stage.runner.paused = true
        }
        const lookBox = new AABB(lookLowerBound, lookUpperBound)
        const maximumBox = this.trim({ base, lookBox })
        const maximumCenter = maximumBox.getCenter()
        if (debug) {
          this.stage.debugCircle({
            circle: new CircleShape(maximumCenter, 0.2),
            color: WHITE
          })
          this.stage.debugAABB({
            aabb: maximumBox,
            color: WHITE,
            width: 0.2
          })
        }
        const totalStrength = this.killer.actor.gene.strength + this.victim.actor.gene.strength
        const averageStrength = totalStrength / 2
        const strengthFactor = Math.pow(averageStrength, 0.5)
        const halfWidth = maximumBox.getExtents().x * strengthFactor
        const halfHeight = maximumBox.getExtents().y * strengthFactor
        if (debug) {
          const scaledLower = Vec2.sub(maximumCenter, Vec2(halfWidth, halfHeight))
          const scaledUpper = Vec2.add(maximumCenter, Vec2(halfWidth, halfHeight))
          const scaledAABB = new AABB(scaledLower, scaledUpper)
          this.stage.debugAABB({
            aabb: scaledAABB,
            color: GREEN
          })
        }
        const minimum = Math.min(halfWidth, halfHeight)
        this.stage.flag({ f: 'death', k: 'minimum', v: minimum })
        if (minimum > Death.MINIMUM_SIZE) {
          const localBrickCorners = [
            Vec2(+halfWidth, +halfHeight),
            Vec2(+halfWidth, -halfHeight),
            Vec2(-halfWidth, +halfHeight),
            Vec2(-halfWidth, -halfHeight)
          ]
          const brickCorners = localBrickCorners.map(localCorner => Vec2.add(maximumCenter, localCorner))
          const nearestIndex = whichMax(brickCorners.map(corner => {
            return Vec2.distance(this.killer.body.getPosition(), corner)
          }))
          const localPuppetCorners = localBrickCorners.filter((corner, index) => {
            return index !== nearestIndex
          })

          const killerSpeed = this.killer.body.getLinearVelocity().length()
          console.log('killerSpeed', killerSpeed)
          const victimSpeed = this.victim.body.getLinearVelocity().length()
          console.log('victimSpeed', victimSpeed)
          const victimPosition = this.victim.body.getPosition()
          const power = Math.min(killerSpeed, victimSpeed) * 25
          console.log('power', power)
          const direction = directionFromTo(killerPosition, victimPosition)
          const force = Vec2.mul(power, direction)
          const speed = Math.max(killerSpeed, victimSpeed)
          console.log('speed', speed)
          const averageStamina = (this.killer.actor.gene.stamina + this.victim.actor.gene.stamina) / 2
          const health = Math.max(averageStamina, Death.MINIMUM_HEALTH)
          const center = this.getCenter({
            base,
            debug,
            halfHeight,
            halfWidth,
            maximum: maximumBox
          })
          void new River({
            force,
            health,
            position: center,
            speed,
            stage: this.stage,
            vertices: localPuppetCorners
          })
        }
        if (debug) {
          this.stage.runner.paused = true
        }
      }
    }
    super.execute()
  }
}
