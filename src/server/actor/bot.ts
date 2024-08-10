import { Circle, CircleShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { directionFromTo, range, rotate, whichMax, whichMin } from '../math'
import { Color } from '../../shared/color'
import { Waypoint } from '../waypoint'
import { Tree } from '../tree'
import { Membrane } from '../feature/membrane'

export class Bot extends Organism {
  giveUpTime: number
  giveUpTimer = 0
  chasePoint: Vec2 | undefined
  nearestVisibleEnemy: Membrane | undefined

  constructor (props: {
    stage: Stage
    position: Vec2
    tree: Tree
  }) {
    super({
      stage: props.stage,
      position: props.position,
      tree: props.tree
    })
    this.membrane.acceleration = 1
    this.giveUpTime = 30 / this.membrane.acceleration
    this.nearestVisibleEnemy = this.getNearestReachableEnemy()
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

  debugControls (): void {
    const start = this.membrane.body.getPosition()
    this.stage.debugCircle({
      circle: new Circle(start, 0.4),
      color: Color.RED
    })
    const length = 1
    if (this.controls.up) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x, start.y + length),
        color: Color.RED,
        width: 0.2
      })
    }
    if (this.controls.down) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x, start.y - length),
        color: Color.RED,
        width: 0.2
      })
    }
    if (this.controls.left) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x - length, start.y),
        color: Color.RED,
        width: 0.2
      })
    }
    if (this.controls.right) {
      this.stage.debugLine({
        a: start,
        b: Vec2(start.x + length, start.y),
        color: Color.RED,
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

  isPointReachable (end: Vec2): boolean {
    const start = this.membrane.body.getPosition()
    return this.stage.navigation.isPointReachable(start, end, this.membrane.radius)
  }

  getNearestReachableEnemy (): Membrane | undefined {
    const membranes = this.featuresInVision.filter(feature => feature instanceof Membrane)
    const enemies = membranes.filter(m => m.actor.id !== this.id)
    const reachableEnemies = enemies.filter(enemy => {
      return this.isPointReachable(enemy.body.getPosition())
    })
    if (this.membrane.radius === 1.2) this.stage.log({ value: ['reachableEnemies.length', reachableEnemies.length] })
    if (reachableEnemies.length === 0) return undefined
    const distances = reachableEnemies.map(m => Vec2.distance(m.body.getPosition(), this.membrane.body.getPosition()))
    const nearestReachableEnemy = reachableEnemies[whichMin(distances)]
    return nearestReachableEnemy as Membrane
  }

  maneuver (): boolean {
    this.nearestVisibleEnemy = this.getNearestReachableEnemy()
    if (!(this.nearestVisibleEnemy instanceof Membrane)) {
      return this.checkChasePoint()
    }
    const enemyMass = this.nearestVisibleEnemy.body.getMass()
    const myMass = this.membrane.body.getMass()
    if (enemyMass === myMass) {
      return false
    }
    if (enemyMass < myMass) {
      this.chase(this.nearestVisibleEnemy)
    } else {
      this.flee(this.nearestVisibleEnemy)
    }
    return true
  }

  checkChasePoint (): boolean {
    this.stage.log({ value: 'checkChasePoint' })
    const myPosition = this.membrane.body.getPosition()
    if (this.chasePoint == null) {
      return false
    }
    const reachable = this.isPointReachable(this.chasePoint)
    if (!reachable) {
      this.chasePoint = undefined
      return false
    }
    const distance = Vec2.distance(myPosition, this.chasePoint)
    if (distance < this.membrane.radius) {
      this.chasePoint = undefined
      return false
    }
    if (this.stage.debugBotChase) {
      const path = this.stage.navigation.getPath(myPosition, this.chasePoint, this.membrane.radius)
      range(0, path.length - 2).forEach(index => {
        const currentPoint = path[index]
        const nextPoint = path[index + 1]
        this.stage.debugLine({ a: currentPoint, b: nextPoint, color: Color.GREEN, width: 0.2 })
      })
      const circle = new CircleShape(this.chasePoint, 0.5)
      this.stage.debugCircle({ circle, color: Color.GREEN })
    }
    const nextPoint = this.stage.navigation.navigate(myPosition, this.chasePoint, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(myPosition, nextPosition)
    this.setControls(direction)
    return true
  }

  flee (enemy: Membrane): void {
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
        const color = hitArray.length === 0 ? Color.WHITE : Color.RED
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
          color: Color.GREEN,
          width: 0.4
        })
      }
      return
    }
    this.setControls(dirFromEnemy)
  }

  chase (enemy: Membrane): void {
    const enemyPosition = enemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    this.stage.debugLine({
      a: myPosition,
      b: enemyPosition,
      color: Color.WHITE
    })
    const dirToEnemy = directionFromTo(myPosition, enemyPosition)
    this.setControls(dirToEnemy)
    this.chasePoint = enemyPosition.clone()
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
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
        this.stage.debugLine({ a: currentPoint, b: nextPoint, color: Color.WHITE, width: 0.1 })
      })
      const circle = new CircleShape(end, 0.5)
      this.stage.debugCircle({ circle, color: Color.RED })
    }
    const nextPoint = this.stage.navigation.navigate(start, end, this.membrane.radius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const directionToNext = directionFromTo(start, nextPosition)
    this.setControls(directionToNext)
  }
}
