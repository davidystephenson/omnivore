import { AABB, Vec2 } from 'planck'
import { SIGHT } from '../shared/sight'
import { Membrane } from './feature/membrane'
import { getCompass, whichMax } from './math'
import { Stage } from './stage'
import { Death } from './death'
import { Brick } from './actor/brick'
import { Puppet } from './actor/puppet'

export class Starvation extends Death {
  stage: Stage
  victim: Membrane

  constructor (props: { stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.stage = props.stage
    this.victim = props.victim
    console.debug('construct starvation')
  }

  execute (props?: {
    debug?: boolean
  }): void {
    // WORK IN PROGRESS
    console.debug('execute starvation')
    const killerPosition = this.victim.body.getPosition()
    const brickDirection = getCompass(Vec2.sub(this.victim.deathPosition, killerPosition))
    const brickLookDistance = brickDirection.x !== 0 ? SIGHT.x : SIGHT.y
    const sideLookDistance = brickDirection.x !== 0 ? SIGHT.y : SIGHT.x
    const base = Vec2.combine(1, killerPosition, this.victim.radius, brickDirection)
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
    const brickCorners = [
      Vec2.add(brickPosition, Vec2(+halfWidth, +halfHeight)),
      Vec2.add(brickPosition, Vec2(+halfWidth, -halfHeight)),
      Vec2.add(brickPosition, Vec2(-halfWidth, +halfHeight)),
      Vec2.add(brickPosition, Vec2(-halfWidth, -halfHeight))
    ]
    const nearestIndex = whichMax(brickCorners.map(corner => {
      return Vec2.distance(this.victim.body.getPosition(), corner)
    }))
    const nearestCorner = brickCorners[nearestIndex]
    const puppetCorners = brickCorners.filter(corner => {
      return Vec2.distance(corner, nearestCorner) > 0
    })
    const puppetCenter = Vec2(
      (puppetCorners[0].x + puppetCorners[1].x + puppetCorners[2].x) / 3,
      (puppetCorners[0].y + puppetCorners[1].y + puppetCorners[2].y) / 3
    )
    const localPuppetCorners = puppetCorners.map(corner => {
      return Vec2.sub(corner, puppetCenter)
    })
    if (Math.min(halfWidth, halfHeight) > 0) {
      if (props?.debug === true) {
        console.debug('Starvation.execute new Brick', { halfWidth, halfHeight, brickPosition })
      }
      // void new Brick({ stage: this.stage, halfWidth, halfHeight, position: brickPosition })
      // const vertices: [Vec2, Vec2, Vec2] = [
      //   localPuppetCorners[0],
      //   localPuppetCorners[1],
      //   localPuppetCorners[2]
      // ]
      void new Puppet({ stage: this.stage, vertices: localPuppetCorners, position: puppetCenter })
    }
  }
}
