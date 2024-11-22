import { Vec2 } from 'planck'
import { Walled } from './walled'
import { YELLOW, RED } from '../shared/color'
import { Gene } from './gene'
import { Bot } from './actor/bot'
import { DebugFlags } from './debugFlags'

export class Rehearsal extends Walled {
  bigGene = new Gene({
    radius: this.navigation.radii[0]
  })

  smallGene = new Gene({
    radius: this.navigation.radii[this.navigation.radii.length - 1]
  })

  constructor () {
    super({
      flags: new DebugFlags({
        botChase: true,
        botFlee: true,
        respawn: true
      }),
      halfHeight: 50,
      halfWidth: 50
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(-45, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(5, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(10, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(15, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(20, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(25, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(30, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(35, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(40, 0)
    })
    this.addBricks({
      count: 20,
      gap: 0.1,
      halfHeight: 1,
      halfWidth: 1,
      position: Vec2(45, 0)
    })

    this.addBig({ position: Vec2(0, 10) })
    this.addBig({ position: Vec2(0, 20) })
    this.addBig({ position: Vec2(-10, -50) })
    this.addBig({ position: Vec2(20, 20) })

    this.addSmall({ position: Vec2(-10, 15) })
    this.addSmall({ position: Vec2(-10, 20) })
    this.addSmall({ position: Vec2(-10, 25) })
    this.addSmall({ position: Vec2(-10, 30) })
    this.addSmall({ position: Vec2(-10, 35) })
    this.addSmall({ position: Vec2(-10, 35) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
  }

  addBig (props: {
    position: Vec2
  }): Bot {
    return this.addBot({
      color: RED,
      gene: this.bigGene,
      position: props.position
    })
  }

  addSmall (props: {
    position: Vec2
  }): Bot {
    return this.addBot({
      color: YELLOW,
      gene: this.smallGene,
      position: props.position
    })
  }
}
