import { AABB, Fixture, Vec2 } from 'planck'
import { SIGHT } from '../shared/constants'
import { Brick } from './actor/brick'
import { Mouth } from './feature/mouth'
import { getCompass } from './math'
import { Stage } from './stage'

export class Killing {
  killer: Mouth
  stage: Stage
  victim: Mouth

  constructor (props: { killer: Mouth, stage: Stage, victim: Mouth }) {
    this.killer = props.killer
    this.stage = props.stage
    this.victim = props.victim
  }

  execute (): void {
    console.log('begin execute')
    if (this.killer.actor.invincibleTime > 0) return
    const killerPosition = this.killer.body.getPosition()
    const victimPosition = this.victim.deathPosition
    const brickDirection = getCompass(Vec2.sub(victimPosition, killerPosition))
    const brickLookDistance = brickDirection.x !== 0 ? SIGHT.x : SIGHT.y
    const sideLookDistance = brickDirection.x !== 0 ? SIGHT.y : SIGHT.x
    const killerRadius = this.killer.radius
    const nearPoint = Vec2.combine(1, killerPosition, killerRadius, brickDirection)
    const sideDirections = [
      Vec2(-brickDirection.y, brickDirection.x),
      Vec2(brickDirection.y, -brickDirection.x)
    ]
    const nearLookPoints = sideDirections.map(sideDirection => {
      return Vec2.combine(1, nearPoint, sideLookDistance, sideDirection)
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
    const brickBox = this.trim(nearPoint, lookBox)
    const halfWidth = brickBox.getExtents().x
    const halfHeight = brickBox.getExtents().y
    const brickPosition = brickBox.getCenter()
    console.log('halfWidth', halfWidth)
    console.log('halfHeight', halfHeight)
    if (Math.min(halfWidth, halfHeight) > 0) {
      void new Brick({ stage: this.stage, halfWidth, halfHeight, position: brickPosition })
    }
    console.log('end execute')
  }

  trim (preserve: Vec2, box: AABB): AABB {
    const widthFirstBox = this.trimHeight(preserve, this.trimWidth(preserve, box))
    const heightFirstBox = this.trimWidth(preserve, this.trimHeight(preserve, box))
    const widthFirstArea = this.getArea(widthFirstBox)
    const heightFirstArea = this.getArea(heightFirstBox)
    if (widthFirstArea > heightFirstArea) return widthFirstBox
    return heightFirstBox
  }

  trimWidth (base: Vec2, box: AABB): AABB {
    box.extend(-0.1)
    const upperBound = box.upperBound.clone()
    const lowerBound = box.lowerBound.clone()
    this.stage.world.queryAABB(box, (fixture: Fixture): boolean => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.x > base.x) upperBound.x = fixtureBox.lowerBound.x
      if (fixtureBox.upperBound.x < base.x) lowerBound.x = fixtureBox.upperBound.x
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    trimmed.extend(-0.1)
    return trimmed
  }

  trimHeight (base: Vec2, box: AABB): AABB {
    box.extend(-0.1)
    const upperBound = box.upperBound.clone()
    const lowerBound = box.lowerBound.clone()
    this.stage.world.queryAABB(box, (fixture: Fixture): boolean => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.y > base.y) upperBound.y = fixtureBox.lowerBound.y
      if (fixtureBox.upperBound.y < base.y) lowerBound.y = fixtureBox.upperBound.y
      return true
    })
    const trimmed = new AABB(lowerBound, upperBound)
    trimmed.extend(-0.1)
    return trimmed
  }

  trimBaseWidth (base: Vec2, box: AABB): AABB {
    const lowerBound = box.lowerBound.clone()
    const upperBound = box.upperBound.clone()
    const leftPoint = Vec2(base.x - SIGHT.x, base.y)
    const rightPoint = Vec2(base.x + SIGHT.x, base.y)
    this.stage.world.rayCast(base, leftPoint, (fixture, point, normal, fraction) => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.upperBound.x < base.x) lowerBound.x = fixtureBox.upperBound.x
      return fraction
    })
    this.stage.world.rayCast(base, rightPoint, (fixture, point, normal, fraction) => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.x > base.x) upperBound.x = fixtureBox.lowerBound.x
      return fraction
    })
    return new AABB(lowerBound, upperBound)
  }

  trimBaseHeight (base: Vec2, box: AABB): AABB {
    const lowerBound = box.lowerBound.clone()
    const upperBound = box.upperBound.clone()
    const downPoint = Vec2(base.x, base.y - SIGHT.y)
    const upPoint = Vec2(base.x, base.y + SIGHT.y)
    this.stage.world.rayCast(base, downPoint, (fixture, point, normal, fraction) => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.upperBound.y < base.y) lowerBound.y = fixtureBox.upperBound.y
      return fraction
    })
    this.stage.world.rayCast(base, upPoint, (fixture, point, normal, fraction) => {
      const fixtureBox = fixture.getAABB(0)
      if (fixtureBox.lowerBound.y > base.y) upperBound.y = fixtureBox.lowerBound.y
      return fraction
    })
    return new AABB(lowerBound, upperBound)
  }

  getArea (box: AABB): number {
    const extents = box.getExtents()
    return extents.x * extents.y
  }
}
