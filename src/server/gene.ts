import { roundNumber } from './math'
import { ONE_THIRD, TWO_THIRDS } from './numbers'
import { Stage } from './stage/stage'

const STATS = ['speed', 'stamina', 'strength'] as const
type Stat = typeof STATS[number]
type Stats = {
  [key in Stat]: number
}

export class Gene {
  angle: number
  branches: Gene[]
  speed: number
  stage: Stage
  stamina: number
  strength: number

  constructor (props: {
    angle?: number
    speed: number
    stage: Stage
    stamina: number
    strength: number
    branches?: Gene[]
  }) {
    this.angle = props.angle ?? 0
    this.branches = props.branches ?? []
    this.speed = props.speed
    this.stage = props.stage
    this.stamina = props.stamina
    this.strength = props.strength
    this.validateSum()
  }

  changeStats (props: {
    gene: Gene
    increase: number
    stat: keyof Stats
  }): Gene {
    const stats = {
      speed: props.gene.speed,
      stamina: props.gene.stamina,
      strength: props.gene.strength
    }
    const half = props.increase / 2
    STATS.forEach(stat => {
      const value = props.gene[stat]
      if (stat === props.stat) {
        const increased = value + props.increase
        const rounded = roundNumber({ number: increased, decimals: 3 })
        props.gene[stat] = rounded
      } else {
        const other = STATS.find(other => other !== props.stat && other !== stat)
        if (other == null) throw new Error('There is no other')
        const otherValue = stats[other]
        if (otherValue < half) {
          const remaining = half - otherValue
          const decrease = half + remaining
          const decreased = value - decrease
          const rounded = roundNumber({ number: decreased, decimals: 3 })
          props.gene[stat] = rounded
        } else {
          if (value < half) {
            props.gene[stat] = 0
          } else {
            const decreased = value - half
            const rounded = roundNumber({ number: decreased, decimals: 3 })
            props.gene[stat] = rounded
          }
        }
      }
    })
    props.gene.validateSum()
    if (props.gene.speed < 0) throw new Error('speed is negative')
    if (props.gene.stamina < 0) throw new Error('stamina is negative')
    if (props.gene.strength < 0) throw new Error('strength is negative')
    if (props.gene.speed > 1) throw new Error('speed is greater than 1')
    if (props.gene.stamina > 1) throw new Error('stamina is greater than 1')
    if (props.gene.strength > 1) throw new Error('strength is greater than 1')
    return props.gene
  }

  getMutated (props: {
    stat: keyof Stats
  }): Gene {
    const gene = new Gene({
      angle: this.angle,
      speed: this.speed,
      stage: this.stage,
      stamina: this.stamina,
      strength: this.strength,
      branches: this.branches
    })
    const value = this[props.stat]
    const remaining = 1 - value
    const random = Math.random() * 0.1
    const others = STATS.filter(stat => stat !== props.stat)
    const total = others.reduce((acc, stat) => acc + this[stat], 0)
    const minimum = Math.min(random, remaining, total)
    const increase = roundNumber({ number: minimum })
    const changed = this.changeStats({ gene, increase, stat: props.stat })
    return changed
  }

  getStat (): Stat {
    const random = Math.random()
    if (random < ONE_THIRD) return STATS[0]
    if (random < TWO_THIRDS) return STATS[1]
    return STATS[2]
  }

  mutate (): Gene {
    const stat = this.getStat()
    this.validateSum()
    const gene = this.getMutated({ stat })
    return gene
  }

  validateSum (): void {
    const sum = this.speed + this.stamina + this.strength
    const scaled = sum * 1000
    const rounded = Math.round(scaled)
    if (rounded !== 1000) {
      throw new Error('sum is not 1')
    }
  }
}
