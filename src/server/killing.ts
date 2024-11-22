import { AABB, Vec2 } from 'planck'
import { HALF_SIGHT } from '../shared/sight'
import { Membrane } from './feature/membrane'
import { getCompass, whichMax } from './math'
import { Stage } from './stage'
import { Death } from './death'
import { Puppet } from './actor/puppet'

export class Killing extends Death {
  killer: Membrane

  constructor (props: { killer: Membrane, stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.killer = props.killer
  }

  execute (): void {
    this.stage.flag({ f: 'death', v: 'Killing.execute' })
    const killerPosition = this.killer.body.getPosition()
    const brickDirection = getCompass(Vec2.sub(this.victim.deathPosition, killerPosition))
    const brickLookDistance = (brickDirection.x !== 0 ? HALF_SIGHT.x : HALF_SIGHT.y) - this.killer.radius
    const sideLookDistance = brickDirection.x !== 0 ? HALF_SIGHT.y : HALF_SIGHT.x
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
    const lookBox = new AABB(lookLowerBound, lookUpperBound)
    const brickBox = this.trim({ base, lookBox })
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
    if (Math.min(halfWidth, halfHeight) > 0) {
      void new Puppet({ stage: this.stage, vertices: localPuppetCorners, position: brickPosition })
    }
    this.respawn()
  }
}
