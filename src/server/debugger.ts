interface V <Value> {
  v: Value
}
interface Vs <Value> {
  vs: Value[]
}
type Vx <Value> = V<Value> | Vs<Value>
interface K {
  k?: string
}
type Pair <Value> = Vx<Value> & K

interface Frames { frames: number, seconds?: number }
interface Seconds { frames?: number, seconds: number }
interface Default { frames?: number, seconds?: number }
type Time = Frames | Seconds | Default
export type LogProps<Value> = Pair<Value> & Time
interface Interval {
  frame: number
  frames: number
}

export class Debugger {
  intervals: Record<string, Interval> = {}
  windowed: boolean

  constructor () {
    this.windowed = process.platform === 'win32'
  }

  debug <Value> (props: LogProps<Value>): void {
    const caller = this.getCaller()
    const message = this.getMessage(props)
    const frames = props.frames == null
      ? props.seconds == null
        ? 30
        : props.seconds * 30
      : props.frames

    const key = props.k ?? caller
    const debugInterval = this.intervals[key] ?? (
      this.intervals[key] = { frame: 0, frames }
    )
    const debugging = debugInterval.frame === 0
    if (debugging) {
      this.debugLog({
        caller,
        message
      })
    }
  }

  debugLog (props: {
    caller: string
    message?: string | number
  }): void {
    const caller = `[${props.caller}]`
    console.debug(caller, props.message)
  }

  getCaller (): string {
    const line = this.getLine()
    const slashParts = this.getSlashParts({ line })
    const lastSlashIndex = slashParts.length - 1
    const lastSlashPart = slashParts[lastSlashIndex]
    const slashColonParts = lastSlashPart.split(':')
    const file = slashColonParts[0]
    const method = this.getMethod({ line })
    const number = this.getNumber({ line })
    const key = `${file}:${method}:${number}`

    return key
  }

  getLine (): string {
    const error = new Error()
    if (error.stack == null) {
      throw new Error('There is no stack')
    }
    const lines = error.stack?.split('\n')
    const sources = this.getSources({ lines })
    if (sources.length === 0) {
      return lines[0]
    }
    const internals = ['log', 'debug', 'getCaller', 'getLine', 'flag']
    const externals = sources.filter(line => {
      const method = this.getMethod({ line })
      const internal = internals.includes(method)
      return !internal
    })
    if (externals.length === 0) {
      return sources[0]
    }
    const names = externals.filter(line => {
      const name = this.getMethod({ line })
      const bridged = internals.includes(name)
      if (bridged) {
        return false
      }
      const named = name !== '<anonymous>'
      return named
    })
    if (names.length === 0) {
      return externals[0]
    }
    return names[0]
  }

  getMessage <Value> (props: LogProps<Value>): string {
    if ('vs' in props) {
      const joined = this.join({ values: props.vs })
      return joined
    }
    if (props.k != null) {
      const key = props.k != null ? `${props.k}:` : ''
      const values = [key, props.v]
      const joined = this.join({ values })
      return joined
    }
    return this.stringify({ value: props.v })
  }

  getMethod (props: {
    line: string
  }): string {
    const spaceParts = props.line.split(' ')
    const name = spaceParts[5]
    const periodPars = name.split('.')
    const lastPart = periodPars[periodPars.length - 1]
    return lastPart
  }

  getNumber (props: {
    line: string
  }): string {
    const colonParts = props.line.split(':')
    const index = this.windowed ? 2 : 1
    const number = colonParts[index]
    return number
  }

  getSlashParts (props: {
    line: string
  }): string[] {
    const slash = this.windowed ? '\\' : '/'
    const slashParts = props.line.split(slash)
    return slashParts
  }

  getSources (props: {
    lines: string[]
  }): string[] {
    const source = this.windowed ? 'omnivore\\src' : 'omnivore/src'
    const sources = props.lines.filter(line => {
      const sourced = line.includes(source)
      return sourced
    })
    return sources
  }

  join <Value> (props: {
    values: Value[]
  }): string {
    const strings = props.values.map(value => {
      return this.stringify({ value })
    })
    const joined = strings.join(' ')
    return joined
  }

  onStep (): void {
    for (const key in this.intervals) {
      const interval = this.intervals[key]
      if (interval.frame > interval.frames) {
        const { [key]: _, ...intervals } = this.intervals
        this.intervals = intervals
      } else {
        interval.frame += 1
        if (interval.frame === interval.frames) {
          interval.frame = 0
        }
      }
    }
  }

  stringify <Value> (props: {
    value: Value
  }): string {
    if (typeof props.value === 'string') {
      return props.value
    }

    try {
      const string = JSON.stringify(props.value)
      return string
    } catch (error) {
      const string = String(props.value)
      return string
    }
  }
}
