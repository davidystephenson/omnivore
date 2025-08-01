import { LogProps } from './debugger'
import { roundAdd, roundSubtract } from './math'
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
    decrease: number
    increase: number
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
    this.debug({ k: 'CHANGESTATS props.stat', v: props.stat })
    this.debug({ k: 'changeStats props.increase', v: props.increase })
    this.debug({ k: 'changeStats props.decrease', v: props.decrease })
    const stats = {
      speed: gene.speed,
      stamina: gene.stamina,
      strength: gene.strength
    }
    this.debug({ k: 'changeStats stats', v: stats })
    STATS.forEach(stat => {
      this.debug({ k: 'changeStats stat', v: stat })
      const value = gene[stat]
      this.debug({ k: 'changeStats value', v: value })
      if (stat === props.stat) {
        gene[stat] = roundAdd({ a: value, b: props.increase })
        this.debug({ k: 'changeStats newValue', v: gene[stat] })
      } else {
        const other = STATS.find(other => other !== props.stat && other !== stat)
        if (other == null) throw new Error('There is no other')
        this.debug({ k: 'changeStats other', v: other })
        const otherValue = stats[other]
        this.debug({ k: 'changeStats otherValue', v: otherValue })
        if (otherValue < props.decrease) {
          const remaining = props.decrease - otherValue
          this.debug({ k: 'changeStats remaining', v: remaining })
          const decrease = props.decrease + remaining
          this.debug({ k: 'changeStats decrease', v: decrease })
          gene[stat] = roundSubtract({ a: value, b: decrease })
          this.debug({ k: 'changeStats newValue', v: gene[stat] })
        } else {
          if (value < props.decrease) {
            gene[stat] = 0
            this.debug({ k: 'changeStats zeroed', v: gene[stat] })
          } else {
            gene[stat] = roundSubtract({ a: value, b: props.decrease })
            this.debug({ k: 'changeStats newValue', v: gene[stat] })
          }
        }
      }
    })
    gene.validateSum()
    if (gene.speed < 0) {
      const message = `speed is negative: ${gene.speed}`
      throw new Error(message)
    }
    if (gene.stamina < 0) {
      const message = `stamina is negative: ${gene.stamina}`
      throw new Error(message)
    }
    if (gene.strength < 0) {
      const message = `strength is negative: ${gene.strength}`
      throw new Error(message)
    }
    if (gene.speed > 1) {
      const message = `speed is greater than 1: ${gene.speed}`
      throw new Error(message)
    }
    if (gene.stamina > 1) {
      const message = `stamina is greater than 1: ${gene.stamina}`
      throw new Error(message)
    }
    if (gene.strength > 1) {
      const message = `strength is greater than 1: ${gene.strength}`
      throw new Error(message)
    }
    return gene
  }

  debug (props: LogProps<unknown>): void {
    this.stage.flag({ f: 'mutation', frames: 0, ...props })
  }

  getMutated (props: {
    stat: keyof Stats
  }): Gene {
    this.debug({ k: 'GETMUTATED props.stat', v: props.stat })

    const value = this[props.stat]
    this.debug({ k: 'getMutated value', v: value })
    const remaining = 1 - value
    this.debug({ k: 'getMutated remaining', v: remaining })
    const random = Math.random() * 0.33
    this.debug({ k: 'getMutated random', v: random })
    const others = STATS.filter(stat => stat !== props.stat)
    this.debug({ k: 'getMutated others', v: others })
    const total = others.reduce((acc, stat) => acc + this[stat], 0)
    this.debug({ k: 'getMutated total', v: total })
    const minimum = Math.min(random, remaining, total)
    this.debug({ k: 'getMutated minimum', v: minimum })
    const scaledUp = minimum * 100
    const rounded = Math.floor(scaledUp)
    const even = rounded % 2 === 0
    const increase = even ? rounded : rounded - 1
    const decrease = increase / 2
    this.debug({ k: 'getMutated increase', v: increase })
    this.debug({ k: 'getMutated decrease', v: decrease })
    const scaledIncrease = increase / 100
    this.debug({ k: 'getMutated scaledIncrease', v: scaledIncrease })
    const scaledDecrease = decrease / 100
    this.debug({ k: 'getMutated scaledDecrease', v: scaledDecrease })
    const changed = this.changeStats({
      decrease: scaledDecrease,
      increase: scaledIncrease,
      stat: props.stat
    })
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
