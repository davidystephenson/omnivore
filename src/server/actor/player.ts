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
    const north = Vec2(0, 1)

    /*
    const steps1 = [-0.75, -0.25, 0.25, 0.75]
    const steps2 = [-1 / 3, 0, 1 / 3]
    const steps3 = [-0.1, 0.1]
    const steps4 = [0]
    */

    // type Tree = Record<number, Record<number, Record<number, Record<number, {}>>>>

    // const tree: Tree = {
    //   0: {
    //     '-0.3': {},
    //     0: {},
    //     0.3: {}
    //   },
    //   1: {
    //     '-0.3': {},
    //     0: {
    //       0: {
    //         0: {}
    //       }
    //     },
    //     0.3: {}
    //   }
    // }

    interface Branch {
      angle: number
      radius: number
      branches: Branch[]
    }

    interface Tree {
      branches: Branch[]
    }

    const tree: Tree = {
      branches: [
        {
          angle: 0,
          radius: 1,
          branches: [
            { angle: -0.3, radius: 0.2, branches: [] },
            { angle: 0, radius: 0.5, branches: [] },
            { angle: 0.3, radius: 0.2, branches: [] }
          ]
        },
        {
          angle: 1,
          radius: 0.2,
          branches: [
            { angle: -0.3, radius: 0.2, branches: [] },
            {
              angle: 0,
              radius: 0.3,
              branches: [
                {
                  angle: 0,
                  radius: 0.4,
                  branches: [
                    { angle: 0, radius: 0.5, branches: [] }
                  ]
                }
              ]
            },
            { angle: 0.4, radius: 1, branches: [] }
          ]
        }
      ]
    }

    const cells: Mouth[] = []
    const gap = 0.4 - Number.MIN_VALUE
    for (const branch1 of tree.branches) {
      const distance = this.eye.radius + branch1.radius + gap
      const offset = rotate(Vec2.mul(north, distance), Math.PI * branch1.angle)
      const child1 = this.createMouth({
        position: Vec2.add(eyePosition, offset),
        cell: this.eye,
        radius: branch1.radius
      })
      cells.push(child1)
      for (const branch2 of branch1.branches) {
        const parentPosition = child1.body.getPosition()
        const away = directionFromTo(eyePosition, parentPosition)
        const distance = child1.radius + branch2.radius + gap
        const offset = rotate(Vec2.mul(away, distance), Math.PI * branch2.angle)
        const child2 = this.createMouth({
          position: Vec2.add(parentPosition, offset),
          cell: child1,
          radius: branch2.radius
        })
        cells.push(child2)
        for (const branch3 of branch2.branches) {
          const parentPosition = child2.body.getPosition()
          const away = directionFromTo(eyePosition, parentPosition)
          const distance = child2.radius + branch3.radius + gap
          const offset = rotate(Vec2.mul(away, distance), Math.PI * branch3.angle)
          const child3 = this.createMouth({
            position: Vec2.add(parentPosition, offset),
            cell: child2,
            radius: branch3.radius
          })
          cells.push(child3)
          for (const branch4 of branch3.branches) {
            const parentPosition = child3.body.getPosition()
            const away = directionFromTo(eyePosition, parentPosition)
            const distance = child3.radius + branch4.radius + gap
            const offset = rotate(Vec2.mul(away, distance), Math.PI * branch4.angle)
            const child4 = this.createMouth({
              position: Vec2.add(parentPosition, offset),
              cell: child3,
              radius: branch4.radius
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
    radius?: number
  }): Mouth {
    const mouth = new Mouth({ position: props.position, actor: this, radius: props.radius })
    if (props.cell != null) {
      const maxLength = Vec2.distance(props.position, props.cell.body.getPosition())
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: mouth.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength
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
