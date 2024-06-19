interface Pair <Value> {
  value: Value
  key?: string
}
interface Frames { frames: number, seconds?: undefined }
interface Seconds { frames?: undefined, seconds: number }
interface Default { frames?: undefined, seconds?: undefined }
type Time = Frames | Seconds | Default
export type LogProps<Value> = Pair<Value> & Time
interface Interval {
  frame: number
  frames: number
}

export class Logger {
  intervals: Record<string, Interval> = {}

  stringify <Value> (props: {
    value: Value
  }): string {
    if (typeof props.value === 'string') {
      return props.value
    }
    if (Array.isArray(props.value)) {
      const strings = props.value.map(value => {
        return this.stringify({ value })
      })
      const joined = strings.join(' ')
      return joined
    }
    try {
      const string = JSON.stringify(props.value)
      return string
    } catch (error) {
      const string = String(props.value)
      return string
    }
  }

  debug <Value> (props: LogProps<Value>): void {
    const caller = this.getCaller()
    const message = this.stringify({ value: props.value })
    const frames = props.frames == null
      ? props.seconds == null
        ? 300
        : props.seconds * 60
      : props.frames

    const key = props.key ?? caller
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
    console.debug(props.message, caller)
  }

  getCaller (): string {
    const line = this.getLine()
    const slashParts = line.split('/')
    const lastSlashIndex = slashParts.length - 1
    const lastSlashPart = slashParts[lastSlashIndex]
    const slashColonParts = lastSlashPart.split(':')
    const file = slashColonParts[0]
    const method = this.getMethod({ line })
    const colonParts = line.split(':')
    const number = colonParts[1]
    const key = `${file}:${method}:${number}`

    return key
  }

  getLine (): string {
    const error = new Error()
    if (error.stack == null) {
      throw new Error('There is no stack')
    }
    const lines = error.stack?.split('\n')
    const sources = lines.filter(line => {
      const sourced = line.includes('omnivore/src')
      return sourced
    })
    if (sources.length === 0) {
      return lines[0]
    }
    const internals = ['log', 'debug', 'getCaller', 'getLine']
    const externals = sources.filter(line => {
      const name = this.getMethod({ line })
      const internal = internals.includes(name)
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

  getMethod (props: {
    line: string
  }): string {
    const spaceParts = props.line.split(' ')
    const name = spaceParts[5]
    const periodPars = name.split('.')
    const lastPart = periodPars[periodPars.length - 1]
    return lastPart
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
}
