import { AABB, Fixture, Vec2 } from 'planck'
import { Mouth } from './feature/mouth'
import { Stage } from './stage'

export class Death {
  stage: Stage
  victim: Mouth

  constructor (props: { stage: Stage, victim: Mouth }) {
    this.stage = props.stage
    this.victim = props.victim
  }

  execute (): void {}

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
