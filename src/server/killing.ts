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
    const killerPosition = this.killer.body.getPosition()
    const brickDirection = getCompass(Vec2.sub(this.victim.deathPosition, killerPosition))
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
    if (Math.min(halfWidth, halfHeight) > 0) {
      void new Brick({ stage: this.stage, halfWidth, halfHeight, position: brickPosition })
    }
  }

  trim (props: { base: Vec2, lookBox: AABB }): AABB {
    const widthTrimmed = this.trimWidth(props)
    const heightTrimmed = this.trimWidth(props)
    const widthFirstBox = this.trimHeight({ base: props.base, lookBox: widthTrimmed })
    const heightFirstBox = this.trimWidth({ base: props.base, lookBox: heightTrimmed })
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
      if (fixtureBox.lowerBound.x > props.base.x) upperBound.x = fixtureBox.lowerBound.x
      if (fixtureBox.upperBound.x < props.base.x) lowerBound.x = fixtureBox.upperBound.x
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
      if (fixtureBox.lowerBound.y > props.base.y) upperBound.y = fixtureBox.lowerBound.y
      if (fixtureBox.upperBound.y < props.base.y) lowerBound.y = fixtureBox.upperBound.y
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
