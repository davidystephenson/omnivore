import { Circle, CircleShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { directionFromTo, range, rotate, whichMax, whichMin } from '../math'
import { GREEN, MAGENTA, RED, Rgb, WHITE } from '../../shared/color'
import { Waypoint } from '../waypoint'
import { Gene } from '../gene'
import { Membrane } from '../feature/membrane'
import { Food } from './food'
import { Feature } from '../feature/feature'
import { Tree } from './tree'

export class Bot extends Organism {
  giveUpTime: number
  giveUpTimer = 0
  chasePoint: Vec2 | undefined
  chaseRadius: number | undefined
  enemy: Feature | undefined

  constructor (props: {
    color: Rgb
    gene: Gene
    stage: Stage
    position: Vec2
  }) {
    super({
      color: props.color,
      gene: props.gene,
      stage: props.stage,
      position: props.position
    })
    this.giveUpTime = 30 / this.membrane.acceleration
    this.enemy = this.getNearestReachableEnemy()
  }

  chase (enemy: Feature): void {
    const enemyPosition = enemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    const navPoint = this.stage.navigation.navigate(myPosition, enemyPosition, this.membrane.radius, enemy.radius)
    const navPosition = navPoint instanceof Vec2 ? navPoint : navPoint.position
    // this.stage.debugLine({
    //   a: myPosition,
    //   b: navPosition,
    //   color: Color.WHITE,
    //   width: 0.2
    // })
    const dirToEnemy = directionFromTo(myPosition, navPosition)
    this.setControls(dirToEnemy)
    this.chasePoint = enemyPosition.clone()
    this.chaseRadius = enemy.radius
  }

  checkChasePoint (): boolean {
    if (this.chasePoint == null) {
      return false
    }
    const myPosition = this.membrane.body.getPosition()
    const chaseRadius = this.chaseRadius ?? 0
    const reachable = this.isPointReachable(this.chasePoint, chaseRadius)
    // const open = this.stage.navigation.isOpen({
    //   fromPosition: myPosition,
    //   toPosition: this.chasePoint,
    //   radius: this.membrane.radius,
    //   otherRadius: chaseRadius
    // })
    // if (this.radius === 1.2) {
    //   // this.stage.log({ value: ['chaseRadius', chaseRadius] })
    //   // this.stage.log({ value: ['reachable', reachable] })
    //   // this.stage.log({ value: ['open', open] })
    // }
    if (!reachable) {
      this.chasePoint = undefined
      return false
    }
    const distance = Vec2.distance(myPosition, this.chasePoint)
    if (distance < this.membrane.radius + chaseRadius) {
      this.chasePoint = undefined
      return false
    }
    // if (this.stage.debugBotChase) {
    //   const path = this.stage.navigation.getPath(myPosition, this.chasePoint, this.membrane.radius, chaseRadius)
    //   const circle = new CircleShape(this.chasePoint, chaseRadius)
    //   this.stage.debugCircle({ circle, color: Color.RED })
    //   // range(0, path.length - 2).forEach(index => {
    //   //   const currentPoint = path[index]
    //   //   const nextPoint = path[index + 1]
    //   //   this.stage.debugLine({ a: currentPoint, b: nextPoint, color: Color.GREEN, width: 0.2 })
    //   // })
    // }
    const nextPoint = this.stage.navigation.navigate(myPosition, this.chasePoint, this.membrane.radius, chaseRadius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(myPosition, nextPosition)
    this.setControls(direction)
    return true
  }

  debugControls (): void {
    const start = this.membrane.body.getPosition()
    this.stage.debugCircle({
      circle: new Circle(start, 0.4),
      color: MAGENTA
    })
    const length = 1
    if (this.controls.up) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x, start.y + length),
        color: MAGENTA,
        width: 0.2
      })
    }
    if (this.controls.down) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x, start.y - length),
        color: MAGENTA,
        width: 0.2
      })
    }
    if (this.controls.left) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x - length, start.y),
        color: MAGENTA,
        width: 0.2
      })
    }
    if (this.controls.right) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x + length, start.y),
        color: MAGENTA,
        width: 0.2
      })
    }
  }

  explore (stepSize: number): void {
    this.giveUpTimer += stepSize
    const position = this.membrane.body.getPosition()
    this.explorationPoints.forEach(point => {
      const visible = this.stage.vision.isVisible(position, point.position)
      point.visible = visible
      if (visible) point.time = Date.now()
    })
    const targetPoint = this.explorationPoints[this.explorationIds[0]]
    const targetVisible = this.stage.vision.isVisible(position, targetPoint.position)
    if (targetVisible || this.giveUpTimer > this.giveUpTime) {
      this.giveUpTimer = 0
      targetPoint.time = Date.now()
      this.sortExplorationPoints()
    }
  }

  flee (enemy: Feature): void {
    const enemyPosition = enemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    const dirFromEnemy = directionFromTo(enemyPosition, myPosition)
    const perps = [
      rotate(dirFromEnemy, +0.5 * Math.PI),
      rotate(dirFromEnemy, -0.5 * Math.PI)
    ]
    const sidePoints = perps.map(perp => {
      return Vec2.combine(1, myPosition, this.membrane.radius, perp)
    })
    const lookDistance = 4
    const lookPoints = sidePoints.map(sidePoint => {
      return Vec2.combine(1, sidePoint, lookDistance, dirFromEnemy)
    })
    const rays = sidePoints.map((sidePoint, i) => {
      return [sidePoint, lookPoints[i]]
    })
    const hitArrays = rays.map(ray => {
      return this.stage.vision.rayCast(ray[0], ray[1])
    })
    if (this.stage.debugBotFlee) {
      hitArrays.forEach((hitArray, i) => {
        const color = hitArray.length === 0 ? WHITE : RED
        this.stage.debugLine({
          a: sidePoints[i],
          b: lookPoints[i],
          color,
          width: 0.2
        })
      })
    }
    const blocked = hitArrays[0].length > 0 || hitArrays[1].length > 0
    if (blocked) {
      const visibleExplorationPoints = this.explorationPoints.filter(point => point.visible)
      const directions = visibleExplorationPoints.map(point => directionFromTo(myPosition, point.position))
      const dotProducts = directions.map(direction => Vec2.dot(direction, dirFromEnemy))
      if (directions.length === 0) return
      const fleeDir = directions[whichMax(dotProducts)]
      this.setControls(fleeDir)
      if (this.stage.debugBotFlee) {
        this.stage.debugLine({
          a: myPosition,
          b: Vec2.combine(1, myPosition, 2, fleeDir),
          color: GREEN,
          width: 0.4
        })
      }
      return
    }
    this.setControls(dirFromEnemy)
  }

  getNearestReachableEnemy (): Feature | undefined {
    const enemies = this.featuresInVision.filter(feature => {
      if (feature instanceof Membrane) {
        return feature.color !== this.color
      }
      if (feature.actor instanceof Food) {
        return true
      }
      if (feature.actor instanceof Tree) {
        const healthy = feature.health > 0.1
        this.stage.debugLine({
          a: this.membrane.body.getPosition(),
          b: feature.body.getPosition(),
          color: healthy ? GREEN : RED,
        })
        return healthy
      }
      return false
    })
    const reachableEnemies = enemies.filter(enemy => {
      return this.isPointReachable(enemy.body.getPosition(), enemy.radius)
    })
    if (reachableEnemies.length === 0) return undefined
    // TODO get nearest point, not center
    const distances = reachableEnemies.map(m => Vec2.distance(m.body.getPosition(), this.membrane.body.getPosition()))
    const nearestReachableEnemy = reachableEnemies[whichMin(distances)]
    return nearestReachableEnemy
  }

  getNearestReachableFood (): Food | undefined {
    const foods = this.featuresInVision.filter(feature => feature.actor instanceof Food)
    const reachableFoods = foods.filter(food => {
      return this.isPointReachable(food.body.getPosition(), 1)
    })
    if (reachableFoods.length === 0) return undefined
    const distances = reachableFoods.map(m => Vec2.distance(m.body.getPosition(), this.membrane.body.getPosition()))
    const nearestReachableFood = reachableFoods[whichMin(distances)]
    return nearestReachableFood.actor as Food
  }

  isPointReachable (end: Vec2, otherRadius?: number): boolean {
    const start = this.membrane.body.getPosition()
    return this.stage.navigation.isPointReachable(start, end, this.membrane.radius, otherRadius)
  }

  maneuver (): boolean {
    this.enemy = this.getNearestReachableEnemy()
    if (this.enemy == null) {
      return this.checkChasePoint()
    }
    const foody = this.enemy.actor instanceof Food
    const arboreal = this.enemy.actor instanceof Tree
    const nutritious = foody || arboreal
    const enemyMass = nutritious ? -1 : this.enemy.body.getMass()
    const myMass = this.membrane.body.getMass()
    if (enemyMass === myMass) {
      return false
    }
    if (enemyMass < myMass) {
      this.chase(this.enemy)
    } else {
      this.flee(this.enemy)
    }
    const food = this.getNearestReachableFood()
    if (food == null) return true
    const foodPosition = food.sculpture.body.getPosition()
    const enemyPosition = this.enemy.body.getPosition()
    const position = this.membrane.body.getPosition()
    const enemyDistance = Vec2.distance(enemyPosition, position)
    const foodDistance = Vec2.distance(foodPosition, position)
    const foodDirection = directionFromTo(position, foodPosition)
    if (foodDistance < enemyDistance) {
      this.setControls(foodDirection)
    }
    return true
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
    if (this.player != null) {
      return
    }
    this.explore(stepSize)
    const maneuvered = this.maneuver()
    if (maneuvered) return
    const start = this.membrane.body.getPosition()
    const explorationId = this.explorationIds[0]
    const explorationPoint = this.explorationPoints[explorationId]
    const end = explorationPoint.position
    if (this.stage.debugBotPath) {
      const path = this.stage.navigation.getPath(start, end, this.membrane.radius)
      range(0, path.length - 2).forEach(index => {
        const currentPoint = path[index]
        const nextPoint = path[index + 1]
        this.stage.debugLine({ a: currentPoint, b: nextPoint, color: WHITE, width: 0.1 })
      })
      const circle = new CircleShape(end, this.membrane.radius)
      this.stage.debugCircle({ circle, color: RED })
    }
    const nextPoint = this.stage.navigation.navigate(start, end, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const directionToNext = directionFromTo(start, nextPosition)
    this.setControls(directionToNext)
  }

  setControls (direction: Vec2): void {
    const root2over2 = Math.sqrt(2) / 2
    const roundDirs = [
      Vec2(+1, +0),
      Vec2(-1, +0),
      Vec2(+0, +1),
      Vec2(+0, -1),
      Vec2(+root2over2, +root2over2),
      Vec2(+root2over2, -root2over2),
      Vec2(-root2over2, +root2over2),
      Vec2(-root2over2, -root2over2)
    ]
    const dotProducts = roundDirs.map(roundDir => Vec2.dot(roundDir, direction))
    const whichMaxDot = whichMax(dotProducts)
    const roundDir = roundDirs[whichMaxDot]
    this.controls.up = roundDir.y > 0
    this.controls.down = roundDir.y < 0
    this.controls.left = roundDir.x < 0
    this.controls.right = roundDir.x > 0
    this.debugControls()
  }
}
