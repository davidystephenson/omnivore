import { Vec2, Fixture, Box, BoxShape } from 'planck'
import { Rgb } from '../shared/color'
import { HALF_SIGHT_SIZE } from '../shared/sight'
import { Stage } from './stage/stage'

export class Spawnpoint {
  featureBox: BoxShape
  membraneBox: BoxShape
  position: Vec2
  featureSensor: Fixture
  membraneSensor: Fixture
  collideCount = 0
  stage: Stage

  constructor (props: {
    position: Vec2
    stage: Stage
    vertical: boolean
  }) {
    this.stage = props.stage
    this.position = props.position
    this.membraneBox = new Box(HALF_SIGHT_SIZE.x, HALF_SIGHT_SIZE.y, this.position)
    this.membraneSensor = this.stage.spawner.body.createFixture({
      isSensor: true,
      shape: this.membraneBox
    })
    this.membraneSensor.setUserData(this)
    const featureWidth = props.vertical
      ? this.stage.navigation.margin
      : HALF_SIGHT_SIZE.x
    const featureHeight = props.vertical
      ? HALF_SIGHT_SIZE.y
      : this.stage.navigation.margin
    this.featureBox = new Box(featureWidth, featureHeight, this.position)
    this.featureSensor = this.stage.spawner.body.createFixture({
      isSensor: true,
      shape: this.featureBox
    })
    this.featureSensor.setUserData(this)
  }

  debug (props: {
    color: Rgb
  }): void {
    this.stage.debugPolygon({
      polygon: this.membraneBox,
      color: props.color
    })
    this.stage.debugPolygon({
      polygon: this.featureBox,
      color: props.color,
      width: 0.2
    })
  }
}
