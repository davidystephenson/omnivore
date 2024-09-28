import { PolygonShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/sculpture'
import { Color } from '../../shared/color'
import { range, rotate } from '../math'

export class Tree extends Actor {
  seedRadius = 1.25
  seedSideLength: number
  seedInnerRadius: number
  radius: number
  sideLength: number
  innerRadius: number
  oldSideLength: number
  sculpture: Sculpture
  growthRate = 0.5
  vertices: Vec2[] = []
  seedVertices: Vec2[] = []
  foodPolygons: Vec2[][] = []
  step = 0
  growing: boolean
  foodSize: number
  foodLayer = 0

  constructor (props: {
    stage: Stage
    position: Vec2
    growing?: boolean
  }) {
    super({ stage: props.stage, label: 'tree' })
    this.growing = props.growing ?? true
    this.seedVertices = this.getVertices(this.seedRadius)
    this.setupVertices()
    this.sculpture = new Sculpture({
      actor: this,
      color: Color.LIME,
      position: props.position,
      vertices: this.vertices
    })
    this.sculpture.health = 0.0000000000000000001
    this.features.push(this.sculpture)
    this.foodSize = this.seedRadius * 2 * Math.sin(2 / 3 * Math.PI)
    this.seedSideLength = this.seedRadius * 2 * Math.sin(2 / 3 * Math.PI)
    this.seedInnerRadius = Math.sqrt(this.seedRadius ** 2 - 0.25 * this.seedSideLength ** 2)
    this.radius = this.seedRadius
    this.sideLength = this.seedSideLength
    this.innerRadius = this.seedInnerRadius
    this.oldSideLength = this.sideLength
  }

  getVertices (radius: number): Vec2[] {
    const turns = [1 / 4, 7 / 12, 11 / 12]
    const angles = turns.map(turn => 2 * Math.PI * turn)
    return angles.map(angle => {
      return Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
    })
  }

  setupVertices (): void {
    this.vertices = this.getVertices(this.radius)
  }

  addFood (): void {
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
  }

  fall (): void {
    this.radius = this.seedRadius
    this.vertices = this.seedVertices
    this.foodLayer = 0
    this.radius = this.seedRadius
    this.sideLength = this.seedSideLength
    this.innerRadius = this.seedInnerRadius
    this.oldSideLength = this.sideLength
    this.foodPolygons = []
  }

  grow (stepSize: number): void {
    this.step += 1
    this.radius = this.radius + stepSize * this.growthRate
    this.seedSideLength = this.seedRadius * 2 * Math.sin(2 / 3 * Math.PI)
    this.sideLength = this.radius * 2 * Math.sin(2 / 3 * Math.PI)
    this.innerRadius = Math.sqrt(this.radius ** 2 - 0.25 * this.sideLength ** 2)
    if (this.step % 2 === 0) {
      this.sculpture.body.destroyFixture(this.sculpture.fixture)
      this.setupVertices()
      this.sculpture.fixture = this.sculpture.body.createFixture({
        shape: new PolygonShape(this.vertices),
        density: 1,
        restitution: 0,
        friction: 0
      })
      this.sculpture.body.setUserData(this.sculpture)
      this.sculpture.fixture.setUserData(this.sculpture)
    }
    const gapSize = this.innerRadius - this.seedInnerRadius - this.foodLayer * this.foodSize
    if (gapSize > this.foodSize) {
      this.addFood()
    }
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
  }
}
