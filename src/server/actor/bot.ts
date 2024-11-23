import { Circle, CircleShape, Vec2 } from 'planck'
import { GREEN, MAGENTA, RED, Rgb, WHITE } from '../../shared/color'
import { Feature } from '../feature/feature'
import { Membrane } from '../feature/membrane'
import { Gene } from '../gene'
import { directionFromTo, range, rotate, whichMax } from '../math'
import { Stage } from '../stage'
import { Waypoint } from '../waypoint'
import { Food } from './food'
import { Organism } from './organism'
import { Tree } from './tree'

export class Bot extends Organism {
  giveUpTime: number
  giveUpTimer = 0
  chasePoint: Vec2 | undefined
  chaseRadius = 0

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
  }

  charge (enemy: Feature): void {
    const enemyPosition = enemy.body.getPosition()
    const myPosition = this.membrane.body.getPosition()
    const navPoint = this.stage.navigation.navigate(myPosition, enemyPosition, this.membrane.radius, enemy.radius)
    const navPosition = navPoint instanceof Vec2 ? navPoint : navPoint.position
    if (this.stage.flags.charge) {
      this.stage.debugLine({
        a: myPosition,
        b: navPosition,
        color: WHITE,
        width: 0.2
      })
    }
    // TODO navigate
    const dirToEnemy = directionFromTo(myPosition, navPosition)
    this.setControls(dirToEnemy)
    this.chasePoint = enemyPosition.clone()
    this.chaseRadius = enemy.radius
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

  debugPath (props: {
    target: Vec2
  }): void {
    // TODO abstract position to onstep
    const myPosition = this.membrane.body.getPosition()
    const path = this.stage.navigation.getPath(myPosition, props.target, this.membrane.radius, this.chaseRadius)
    const circle = new CircleShape(props.target, this.chaseRadius)
    this.stage.debugCircle({ circle, color: RED })
    range(0, path.length - 2).forEach(index => {
      const currentPoint = path[index]
      const nextPoint = path[index + 1]
      this.stage.debugLine({ a: currentPoint, b: nextPoint, color: GREEN, width: 0.2 })
    })
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
    if (this.stage.flags.botFlee) {
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
      if (this.stage.flags.botFlee) {
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

  // isUrgent (props: { feature: Feature }): boolean {
  //   switch (props.feature.constructor) {
  //     case Membrane:
  //       const theirMass = feature.body.getMass()
  //       const myMass = this.membrane.body.getMass()
  //   const foody = feature.actor instanceof Food
  //   const arboreal = feature.actor instanceof Tree
  //   const membrany = feature instanceof Membrane
  //   const nutritious = foody || arboreal || membrany
  //   if (!nutritious) continue
  //   const theirMass = feature.body.getMass()
  //   const myMass = this.membrane.body.getMass()
  //   if (membrany) {
  //     if (feature.color === this.color) continue
  //     if (theirMass === myMass) continue
  //   }
  //   if (arboreal) {
  //     const unhealthy = feature.health < 0.1
  //     if (unhealthy) continue
  //   }
  // }

  isFeatureReachable (props: {
    feature: Feature
    otherRadius?: number
  }): boolean {
    const position = props.feature.body.getPosition()
    return this.isPointReachable(position, props.otherRadius)
  }

  isPointReachable (end: Vec2, otherRadius?: number): boolean {
    const start = this.membrane.body.getPosition()
    return this.stage.navigation.isPointReachable(start, end, this.membrane.radius, otherRadius)
  }

  isTouching (props: {
    point: Vec2
  }): boolean {
    const myPosition = this.membrane.body.getPosition()
    const distance = Vec2.distance(myPosition, props.point)
    const reachDistance = this.membrane.radius + this.chaseRadius
    const reached = distance < reachDistance
    return reached
  }

  judge ({ feature }: { feature: Feature }): boolean | undefined {
    switch (feature.constructor) {
      case Membrane: {
        const allied = feature.color === this.color
        if (allied) return undefined
        const theirMass = feature.body.getMass()
        const myMass = this.membrane.body.getMass()
        const tied = theirMass === myMass
        if (tied) return undefined
        const prey = theirMass < myMass
        return prey
      }
      case Tree: {
        const unhealthy = feature.health < 0.1
        if (unhealthy) return undefined
        return true
      }
      case Food: return true
      default: return undefined
    }
  }

  navigate (props: {
    debug?: boolean
    target: Vec2
  }): void {
    if (props.debug === true) {
      this.debugPath(props)
    }
    const myPosition = this.membrane.body.getPosition()
    const nextPoint = this.stage.navigation.navigate(myPosition, props.target, this.membrane.radius, this.chaseRadius)
    const nextPosition = nextPoint instanceof Waypoint ? nextPoint.position : nextPoint
    const direction = directionFromTo(myPosition, nextPosition)
    this.setControls(direction)
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
    if (this.player != null) {
      return
    }
    this.explore(stepSize)
    const sorted = this.sortNearest({ features: this.featuresInVision })
    for (const feature of sorted) {
      const judgement = this.judge({ feature })
      if (judgement == null) continue
      const reachable = this.isFeatureReachable({ feature })
      if (!reachable) continue
      if (judgement) return this.charge(feature)
      return this.flee(feature)
    }
    if (this.chasePoint == null) return this.wander()
    const reachable = this.isPointReachable(this.chasePoint, this.chaseRadius)
    if (!reachable) {
      this.chasePoint = undefined
      return this.wander()
    }
    const reached = this.isTouching({ point: this.chasePoint })
    if (reached) return this.wander()
    return this.navigate({ debug: this.stage.flags.botChase, target: this.chasePoint })
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

  sortNearest (props: {
    features: Feature[]
  }): Feature[] {
    const myPosition = this.membrane.body.getPosition()
    const distances = props.features.map(feature => {
      // TODO get nearest point, not center
      const distance = Vec2.distance(feature.body.getPosition(), myPosition)
      return {
        distance,
        feature
      }
    })
    const sorted = distances.sort((a, b) => a.distance - b.distance)
    const features = sorted.map(pair => pair.feature)
    return features
  }

  wander (): void {
    const start = this.membrane.body.getPosition()
    const explorationId = this.explorationIds[0]
    const explorationPoint = this.explorationPoints[explorationId]
    const end = explorationPoint.position
    if (this.stage.flags.botPath) {
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
}
