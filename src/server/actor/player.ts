import { RopeJoint, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Mouth } from '../feature/mouth'
import { Color } from '../../shared/color'
import { directionFromTo, rotate } from '../math'

export class Player extends Actor {
  eye: Mouth
  mouths: Mouth[] = []

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.eye = this.createMouth({ position: props.position })
    this.eye.borderWidth = 0.2
    this.eye.health = 1
    const eyePosition = this.eye.body.getPosition()
    const north = Vec2(0, 3)

    /*
    const steps1 = [-0.75, -0.25, 0.25, 0.75]
    const steps2 = [-1 / 3, 0, 1 / 3]
    const steps3 = [-0.1, 0.1]
    const steps4 = [0]
    */

    const steps1 = [0]
    const steps2 = [-0.7, 0, 0.7]
    const steps3 = [-0.4, 0, 0.4]
    const steps4 = [-0.1, 0.1]

    type Tree = Record<number, Record<number, Record<number, Record<number, {}>>>>

    const tree: Tree = {
      0: {
        '-0.3': {},
        0: {},
        0.3: {}
      },
      1: {
        '-0.3': {},
        0: {
          0: {
            0: {}
          }
        },
        0.3: {}
      }
    }

    const cells: Mouth[] = []

    for (const key1 in tree) {
      const offset = rotate(north, Math.PI * Number(key1))
      const child1 = this.createMouth({
        position: Vec2.add(eyePosition, offset),
        cell: this.eye
      })
      cells.push(child1)
      const branch1 = tree[key1]
      for (const key2 in branch1) {
        const parentPosition = child1.body.getPosition()
        const away = directionFromTo(eyePosition, parentPosition)
        const offset = rotate(Vec2.mul(away, 3), Math.PI * Number(key2))
        const child2 = this.createMouth({
          position: Vec2.add(parentPosition, offset),
          cell: child1
        })
        cells.push(child2)
        const branch2 = branch1[key2]
        for (const key3 in branch2) {
          const parentPosition = child2.body.getPosition()
          const away = directionFromTo(eyePosition, parentPosition)
          const offset = rotate(Vec2.mul(away, 3), Math.PI * Number(key3))
          const child3 = this.createMouth({
            position: Vec2.add(parentPosition, offset),
            cell: child2
          })
          cells.push(child3)
          const branch3 = branch2[key3]
          for (const key4 in branch3) {
            const parentPosition = child3.body.getPosition()
            const away = directionFromTo(eyePosition, parentPosition)
            const offset = rotate(Vec2.mul(away, 3), Math.PI * Number(key4))
            const child4 = this.createMouth({
              position: Vec2.add(parentPosition, offset),
              cell: child3
            })
            cells.push(child4)
          }
        }
      }
    }

    /*
    const layer1: Mouth[] = []
    steps1.forEach(i => {
      const offset = rotate(north, Math.PI * i)
      layer1.push(this.createMouth({
        position: Vec2.add(eyePosition, offset),
        cell: this.eye
      }))
    })
    const layer2: Mouth[] = []
    layer1.forEach(parent => {
      steps2.forEach(i => {
        const parentPosition = parent.body.getPosition()
        const away = directionFromTo(eyePosition, parentPosition)
        const offset = rotate(Vec2.mul(away, 3), Math.PI * i)
        layer2.push(this.createMouth({
          position: Vec2.add(parentPosition, offset),
          cell: parent
        }))
      })
    })
    const layer3: Mouth[] = []
    layer2.forEach(parent => {
      steps3.forEach(i => {
        const parentPosition = parent.body.getPosition()
        const away = directionFromTo(eyePosition, parentPosition)
        const offset = rotate(Vec2.mul(away, 3), Math.PI * i)
        layer3.push(this.createMouth({
          position: Vec2.add(parentPosition, offset),
          cell: parent
        }))
      })
    })
    const layer4: Mouth[] = []
    layer3.forEach(parent => {
      steps4.forEach(i => {
        const parentPosition = parent.body.getPosition()
        const away = directionFromTo(eyePosition, parentPosition)
        const offset = rotate(Vec2.mul(away, 3), 1 * i)
        layer4.push(this.createMouth({
          position: Vec2.add(parentPosition, offset),
          cell: parent
        }))
      })
    })
    */
  }

  createMouth (props: {
    position: Vec2
    cell?: Mouth
  }): Mouth {
    const mouth = new Mouth({ position: props.position, actor: this })
    if (props.cell != null) {
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: mouth.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength: 3
      })
      this.joints.push(joint)
      this.stage.world.createJoint(joint)
    }
    this.mouths.push(mouth)
    this.features.push(mouth)
    return mouth
  }

  onStep (): void {
    super.onStep()
    this.features.forEach(feature => {
      feature.color.alpha = feature.health
      if (this.invincibleTime === 0) {
        feature.borderColor = new Color({ red: 0, green: 255, blue: 0 })
      }
    })
  }

  respawn (): void {
    const eyePosition = this.eye.body.getPosition()
    this.invincibleTime = 5
    const noise = Vec2(0.1 * Math.random(), 0.1 * Math.random())
    this.features.forEach(feature => {
      feature.health = 1
      feature.color.alpha = feature.health
      feature.borderColor = new Color({ red: 0, green: 0, blue: 255 })
      const featurePosition = feature.body.getPosition()
      const relativePosition = Vec2.sub(featurePosition, eyePosition)
      feature.deathPosition = Vec2.clone(featurePosition)
      feature.spawnPosition = Vec2.add(relativePosition, noise)
    })
    this.features.forEach(feature => {
      feature.body.setPosition(feature.spawnPosition)
    })
  }
}
