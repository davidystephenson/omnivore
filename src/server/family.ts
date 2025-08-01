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
  id: string
  members: Map<number, Organism> = new Map()
  stage: Stage

  constructor (props: {
    color: Rgb
    highlight: Rgb
    id: string
    speed: number
    strength: number
    stamina: number
    stage: Stage
  }) {
    this.color = props.color
    this.highlight = props.highlight
    this.id = props.id
    this.stage = props.stage
    const speed = this.stage.flags.cooperativeGame
      ? props.speed
      : 0.33
    const strength = this.stage.flags.cooperativeGame
      ? props.strength
      : 0.33
    const stamina = this.stage.flags.cooperativeGame
      ? props.stamina
      : 0.34
    this.gene = new Gene({
      speed,
      strength,
      stamina,
      stage: props.stage
    })
  }

  addMember (props: {
    gene?: Gene
    grown?: boolean
    health?: number
    player?: Player
    position: Vec2
  }): Organism {
    const gene = props?.gene ?? this.gene
    const member = new Organism({
      family: this,
      gene,
      grown: props?.grown,
      health: props.health,
      player: props.player,
      position: props.position,
      stage: this.stage
    })
    member.membrane.hungerDamage = 1 - Organism.INITIAL_HEALTH
    this.members.set(member.id, member)
    this.stage.nature.organisms.set(member.id, member)
    return member
  }

  getPlayerCount (): number {
    const members = [...this.members.values()]
    const playerCount = members.filter(member => member.player != null).length
    return playerCount
  }

  spawn (props?: {
    gene?: Gene
    grown?: boolean
    player?: Player
    position?: Vec2
  }): void {
    const position = props?.position ?? Vec2(0, 0)
    const spawn: Obituary = {
      family: this,
      gene: props?.gene,
      grown: props?.grown,
      mutate: false,
      player: props?.player,
      position
    }
    this.stage.spawner.queue.push(spawn)
  }
}
