import { Vec2 } from 'planck'
import { Rgb } from '../shared/color'
import { Obituary, Organism } from './actor/organism'
import { Gene } from './gene'
import { Stage } from './stage/stage'
import { Player } from './actor/player'

export default class Family {
  color: Rgb
  gene: Gene
  highlight: Rgb
  members: Map<number, Organism> = new Map()
  stage: Stage

  constructor (props: {
    color: Rgb
    highlight: Rgb
    speed?: number
    strength?: number
    stamina?: number
    stage: Stage
  }) {
    this.color = props.color
    const speed = props.speed ?? 0.33
    const strength = props.strength ?? 0.33
    const stamina = props.stamina ?? 0.34
    this.gene = new Gene({
      speed,
      strength,
      stamina,
      stage: props.stage
    })
    this.highlight = props.highlight
    this.stage = props.stage
  }

  addMember (props: {
    gene?: Gene
    health?: number
    player?: Player
    position: Vec2
  }): Organism {
    const gene = props?.gene ?? this.gene
    const member = new Organism({
      family: this,
      gene,
      health: props.health,
      player: props.player,
      position: props.position,
      stage: this.stage
    })
    member.membrane.hungerDamage = 1 - Organism.INITIAL_HEALTH
    this.members.set(member.id, member)
    return member
  }

  spawn (props?: {
    player?: Player
    position?: Vec2
  }): void {
    const position = props?.position ?? Vec2(0, 0)
    const spawn: Obituary = {
      family: this,
      player: props?.player,
      position
    }
    this.stage.spawner.queue.push(spawn)
  }
}
