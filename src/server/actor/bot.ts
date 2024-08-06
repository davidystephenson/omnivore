import { Circle, CircleShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { angleToDirection, directionFromTo, range, whichMax, whichMin } from '../math'
import { Color } from '../../shared/color'
import { Waypoint } from '../waypoint'
import { Tree } from '../tree'
import { Membrane } from '../feature/membrane'

export class Bot extends Organism {
  debug: boolean
  giveUpTime: number
  giveUpTimer = 0
  nearestVisibleEnemy: Membrane | undefined

  constructor (props: {
    debug?: boolean
    stage: Stage
    position: Vec2
    tree: Tree
  }) {
    super({
      stage: props.stage,
      position: props.position,
      tree: props.tree
    })
    this.debug = props.debug ?? false
    this.membrane.acceleration = 1
    this.giveUpTime = 30 / this.membrane.acceleration
    this.nearestVisibleEnemy = this.getNearestVisibleEnemy()
  }

  setControls (direction: Vec2): void {
    const roundDirs = range(0, 7).map(i => angleToDirection(2 * Math.PI * i / 8))
    const dotProducts = roundDirs.map(roundDir => Vec2.dot(roundDir, direction))
    const roundDir = roundDirs[whichMax(dotProducts)]
    const start = this.membrane.body.getPosition()
    this.stage.debugLine({
      a: start,
      b: Vec2.combine(1, start, 2, roundDir),
      color: Color.RED,
      width: 0.2
    })
    this.stage.debugCircle({
      circle: new Circle(start, 0.4),
      color: Color.RED
    })
    this.controls.up = roundDir.y > 0
    this.controls.down = roundDir.y < 0
    this.controls.left = roundDir.x < 0
    this.controls.right = roundDir.x > 0
  }

  explore (stepSize: number): void {
    this.giveUpTimer += stepSize
    const position = this.membrane.body.getPosition()
    this.explorationPoints.forEach(point => {
      const visible = this.stage.vision.isVisible(position, point.position)
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

  getNearestVisibleEnemy (): Membrane | undefined {
    const membranes = this.featuresInVision.filter(feature => feature instanceof Membrane)
    const enemies = membranes.filter(m => m.actor.id !== this.id)
    if (enemies.length === 0) return undefined
    const distances = enemies.map(m => Vec2.distance(m.body.getPosition(), this.membrane.body.getPosition()))
    const nearestEnemy = enemies[whichMin(distances)]
    return nearestEnemy as Membrane
  }

  maneuver (): boolean {
    if (!(this.nearestVisibleEnemy instanceof Membrane)) return false
    const enemyMass = this.nearestVisibleEnemy.body.getMass()
    const myMass = this.membrane.body.getMass()
    if (enemyMass === myMass) {
      return false
    }
    const enemyPosition = this.nearestVisibleEnemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    const dirToEnemy = directionFromTo(myPosition, enemyPosition)
    if (enemyMass < myMass) {
      this.setControls(dirToEnemy)
    } else {
      const dirFromEnemy = Vec2.mul(dirToEnemy, -1)
      this.setControls(dirFromEnemy)
    }
    return true
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
    this.explore(stepSize)
    this.nearestVisibleEnemy = this.getNearestVisibleEnemy()
    const maneuvered = this.maneuver()
    if (maneuvered) return
    const start = this.membrane.body.getPosition()
    const explorationId = this.explorationIds[0]
    const explorationPoint = this.explorationPoints[explorationId]
    const end = explorationPoint.position
    if (this.debug) {
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
