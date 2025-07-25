import { Vec2 } from 'planck'
import { Rgb } from '../shared/color'
import { Organism } from './actor/organism'
import { Gene } from './gene'
import { Stage } from './stage/stage'
import { Player } from './actor/player'

export default class Family {
  color: Rgb
  gene: Gene
  highlight: Rgb
  members: Map<number, Organism> = new Map()
  position: Vec2
  stage: Stage

  constructor (props: {
    color: Rgb
    highlight: Rgb
    position: Vec2
    speed: number
    strength: number
    stamina: number
    stage: Stage
  }) {
    this.color = props.color
    this.gene = new Gene({
      speed: props.speed,
      strength: props.strength,
      stamina: props.stamina,
      stage: props.stage
    })
    this.highlight = props.highlight
    this.position = props.position
    this.stage = props.stage
  }

  addMember (props?: {
    gene?: Gene
    health?: number
    player?: Player
    position?: Vec2
  }): Organism {
    const gene = props?.gene ?? this.gene
    const position = props?.position ?? this.position
    const member = new Organism({
      family: this,
      gene,
      health: props?.health,
      player: props?.player,
      position,
      stage: this.stage
    })
    this.members.set(member.id, member)
    return member
  }
}
