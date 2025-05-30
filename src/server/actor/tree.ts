import { Fixture, PolygonShape, Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { LIME } from '../../shared/color'
import { directionFromTo, mean, range, rotate } from '../math'
import { getNearestOtherPoint } from '../geometry'
import { Stand } from '../feature/stand'

export class Tree extends Actor {
  seedRadius: number
  seedSideLength: number
  seedInnerRadius: number
  radius: number
  sideLength: number
  innerRadius: number
  oldSideLength: number
  stand: Stand
  growthRate = 0.5
  foodPolygons: Vec2[][] = []
  step = 0
  growing: boolean
  foodSize: number
  foodLayer = 0
  sensor: Fixture

  constructor (props: {
    stage: Stage
    position: Vec2
    growing?: boolean
  }) {
    super({ stage: props.stage, label: 'tree' })
    this.tree = true
    this.growing = props.growing ?? true
    this.foodSize = this.stage.navigation.margin
    this.seedSideLength = 1 * this.foodSize
    this.seedRadius = this.seedSideLength / Math.sin(2 / 3 * Math.PI)
    this.stand = new Stand({
      actor: this,
      color: LIME,
      position: props.position,
      vertices: this.getVertices(this.seedRadius)
    })
    this.stand.seed = {
      vertices: this.getVertices(this.seedRadius)
    }
    this.setupVertices()
    this.stand.combatDamage = 0.999999999999
    this.features.push(this.stand)
    this.seedInnerRadius = Math.sqrt(this.seedRadius ** 2 - 0.25 * this.seedSideLength ** 2)
    this.radius = this.seedRadius
    this.sideLength = this.seedSideLength
    this.innerRadius = this.seedInnerRadius
    this.oldSideLength = this.sideLength
    this.sensor = this.stand.addSensor()
  }

  getVertices (radius: number): Vec2[] {
    const turns = [1 / 4, 7 / 12, 11 / 12]
    const angles = turns.map(turn => 2 * Math.PI * turn)
    return angles.map(angle => {
      return Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
    })
  }

  setupVertices (): void {
    this.stand.polygon = {
      vertices: this.getVertices(this.radius)
    }
    this.stand.seed = {
      vertices: this.getVertices(this.radius)
    }
  }

  addFoodLayer (): void {
    const rowCount = 1 + Math.floor(this.oldSideLength / this.foodSize)
    const seedBottomY = this.seedRadius * Math.sin(2 * Math.PI * 7 / 12)
    const y0 = seedBottomY - this.foodLayer * this.foodSize
    const y1 = y0 - this.foodSize
    const foodRow1 = range(0, rowCount - 1).map(i => {
      const x0 = i * this.foodSize - 0.5 * this.oldSideLength
      const x1 = x0 + this.foodSize
      return [
        Vec2(x0, y0),
        Vec2(x1, y0),
        Vec2(x1, y1),
        Vec2(x0, y1)
      ]
    })
    const foodRow2 = foodRow1.map(points => {
      return points.map(point => rotate(point, 2 / 3 * Math.PI))
    })
    const foodRow3 = foodRow2.map(points => {
      return points.map(point => rotate(point, 2 / 3 * Math.PI))
    })
    this.foodPolygons.push(...foodRow1, ...foodRow2, ...foodRow3)
    this.foodLayer += 1
    this.oldSideLength = this.sideLength
    this.stand.combatDamage = 0
  }

  fall (): void {
    this.radius = this.seedRadius
    this.stand.combatDamage = 0.999999999999
    if (this.stand.polygon == null) {
      throw new Error('There is no polygon')
    }
    this.stand.polygon = {
      vertices: this.getVertices(this.radius)
    }
    this.foodLayer = 0
    this.radius = this.seedRadius
    this.sideLength = this.seedSideLength
    this.innerRadius = this.seedInnerRadius
    this.oldSideLength = this.sideLength
    this.foodPolygons.forEach(polygon => {
      const worldVertices = polygon.map(localPoint => {
        return this.stand.body.getWorldPoint(localPoint)
      })
      const xValues = worldVertices.map(point => point.x)
      const yValues = worldVertices.map(point => point.y)
      const position = Vec2(mean(xValues), mean(yValues))
      const vertices = worldVertices.map(point => Vec2.mul(0.9, Vec2.sub(point, position)))
      this.stage.addFood({ vertices, position })
    })
    this.foodPolygons = []
  }

  grow (stepSize: number): void {
    this.step += 1
    this.radius = this.radius + stepSize * this.growthRate
    this.sideLength = this.radius * Math.sin(2 / 3 * Math.PI)
    this.innerRadius = Math.sqrt(this.radius ** 2 - 0.1 * this.sideLength ** 2)
    if (this.step % 2 === 0) {
      this.stand.body.destroyFixture(this.stand.fixture)
      this.setupVertices()
      if (this.stand.polygon == null) {
        throw new Error('There is no polygon')
      }
      this.stand.fixture = this.stand.body.createFixture({
        shape: new PolygonShape(this.stand.polygon.vertices),
        density: 1,
        restitution: 0,
        friction: 0
      })
      this.stand.body.setUserData(this.stand)
      this.stand.fixture.setUserData(this.stand)
    }
    const gapSize = this.innerRadius - this.seedInnerRadius - this.foodLayer * this.foodSize
    if (gapSize > this.foodSize) {
      this.addFoodLayer()
    }
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
    const features = this.stand.getFeaturesInRange()
    const otherFeatures = features.filter(feature => feature !== this.stand)
    const nearestOtherPoint = getNearestOtherPoint(this.stage, this.stand, otherFeatures)
    // this.stage.debugLine({ a: this.sculpture.body.getPosition(), b: nearestOtherPoint, color: RED })
    const position = this.stand.body.getPosition()
    const direction = directionFromTo(nearestOtherPoint, position)
    const force = Vec2.mul(5, direction)
    this.stand.body.applyForceToCenter(force)
  }
}
