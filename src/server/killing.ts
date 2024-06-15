import { AABB, Vec2 } from 'planck'
import { SIGHT } from '../shared/sight'
import { Membrane } from './feature/membrane'
import { getCompass, whichMax } from './math'
import { Stage } from './stage'
import { Puppet } from './actor/puppet'
import { Death } from './death'
import { Brick } from './actor/brick'

export class Killing extends Death {
  killer: Membrane

  constructor (props: { killer: Membrane, stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.killer = props.killer
  }

  execute (props?: {
    debug?: boolean
  }): void {
    if (props?.debug === true) {
      console.debug('Killing.execute', this.killer, this.victim)
    }
    const killerPosition = this.killer.body.getPosition()
    const brickDirection = getCompass(Vec2.sub(killerPosition, this.victim.deathPosition))
    const brickLookDistance = brickDirection.x !== 0 ? SIGHT.x : SIGHT.y
    const sideLookDistance = brickDirection.x !== 0 ? SIGHT.y : SIGHT.x
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
    console.log('localBrickCorners', localBrickCorners)
    console.log('localPuppetCorners', localPuppetCorners)
    if (Math.min(halfWidth, halfHeight) > 0) {
      if (props?.debug === true) {
        console.debug('Killing.execute new Brick', { halfWidth, halfHeight, brickPosition })
      }
      console.log('halfWidth', halfWidth)
      console.log('halfHeight', halfHeight)
      void new Brick({ stage: this.stage, halfWidth, halfHeight, position: brickPosition })
      // void new Puppet({ stage: this.stage, vertices: brickCorners, position: brickPosition })
    }
  }
}
