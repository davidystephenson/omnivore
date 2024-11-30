import { LogProps } from './debugger'
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
    this.debug({ k: 'CHANGESTATS props.stat', v: props.stat })
    this.debug({ k: 'changeStats props.increase', v: props.increase })
    const stats = {
      speed: props.gene.speed,
      stamina: props.gene.stamina,
      strength: props.gene.strength
    }
    this.debug({ k: 'changeStats stats', v: stats })

    const half = props.increase / 2
    this.debug({ k: 'changeStats half', v: half })
    STATS.forEach(stat => {
      this.debug({ k: 'changeStats stat', v: stat })
      const value = props.gene[stat]
      this.debug({ k: 'changeStats value', v: value })
      if (stat === props.stat) {
        const increased = value + props.increase
        this.debug({ k: 'changeStats increased', v: increased })
        const rounded = roundNumber({ number: increased, decimals: 3 })
        props.gene[stat] = rounded
        this.debug({ k: 'changeStats newValue', v: props.gene[stat] })
      } else {
        const other = STATS.find(other => other !== props.stat && other !== stat)
        if (other == null) throw new Error('There is no other')
        this.debug({ k: 'changeStats other', v: other })
        const otherValue = stats[other]
        this.debug({ k: 'changeStats otherValue', v: otherValue })
        if (otherValue < half) {
          const remaining = half - otherValue
          this.debug({ k: 'changeStats remaining', v: remaining })
          const decrease = half + remaining
          this.debug({ k: 'changeStats decrease', v: decrease })
          const decreased = value - decrease
          this.debug({ k: 'changeStats decreased', v: decreased })
          const rounded = roundNumber({ number: decreased, decimals: 3 })
          props.gene[stat] = rounded
          this.debug({ k: 'changeStats newValue', v: props.gene[stat] })
        } else {
          if (value < half) {
            props.gene[stat] = 0
            this.debug({ k: 'changeStats zeroed', v: props.gene[stat] })
          } else {
            const decreased = value - half
            this.debug({ k: 'changeStats half decreased', v: decreased })
            const rounded = roundNumber({ number: decreased, decimals: 3 })
            props.gene[stat] = rounded
            this.debug({ k: 'changeStats newValue', v: props.gene[stat] })
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

  debug (props: LogProps<unknown>): void {
    this.stage.flag({ f: 'mutation', frames: 0, ...props })
  }

  getMutated (props: {
    stat: keyof Stats
  }): Gene {
    this.debug({ k: 'GETMUTATED props.stat', v: props.stat })
    const gene = new Gene({
      angle: this.angle,
      speed: this.speed,
      stage: this.stage,
      stamina: this.stamina,
      strength: this.strength,
      branches: this.branches
    })
    const value = this[props.stat]
    this.debug({ k: 'getMutated value', v: value })
    const remaining = 1 - value
    this.debug({ k: 'getMutated remaining', v: remaining })
    const random = Math.round(Math.random() * 0.5)
    this.debug({ k: 'getMutated random', v: random })
    const others = STATS.filter(stat => stat !== props.stat)
    this.debug({ k: 'getMutated others', v: others })
    const total = others.reduce((acc, stat) => acc + this[stat], 0)
    this.debug({ k: 'getMutated total', v: total })
    const minimum = Math.min(random, remaining, total)
    this.debug({ k: 'getMutated minimum', v: minimum })
    const increase = roundNumber({ number: minimum })
    this.debug({ k: 'getMutated increase', v: increase })
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
