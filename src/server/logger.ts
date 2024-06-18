interface Pair {
  value: string | number | Array<string | number>
  key?: string
}
interface Frames { frames: number, seconds?: undefined }
interface Seconds { frames?: undefined, seconds: number }
interface Default { frames?: undefined, seconds?: undefined }
type Time = Frames | Seconds | Default
export type LogProps = Pair & Time

export class Logger {
  intervals: Record<string, number> = {}

  debug (props: LogProps): void {
    const caller = this.getCaller()
    const message = Array.isArray(props.value)
      ? props.value.join(' ')
      : props.value
    const interval = props.frames == null
      ? props.seconds == null
        ? 300
        : props.seconds * 60
      : props.frames

    const key = props.key ?? caller
    const debugInterval = this.intervals[key]
    if (debugInterval == null) {
      this.intervals[key] = 0
      this.debugLog({
        caller,
        message
      })
      return
    }
    const remainder = debugInterval % interval
    const debugging = remainder === 0
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
    const error = new Error()
    if (error.stack == null) {
      throw new Error('There is no stack')
    }
    const lines = error.stack?.split('\n')
    const line = lines.find(line => {
      const functionName = line.split(' ')[5]
      if (functionName == null) return false
      const functionMethod = functionName.split('.')[1]
      const debugMethods = ['debug', 'debugLog', 'log', 'getCallKey']
      const debugLine = debugMethods.includes(functionMethod)
      return !debugLine
    })
    if (line == null) {
      throw new Error('There is no line')
    }
    const fileName = line.split(' ')[4]
    const functionName = line.split(' ')[5]
    const functionParts = functionName.split('.')
    const lastFunctionIndex = functionParts.length - 1
    const methodName = functionParts[lastFunctionIndex]
    const lineNumber = line.split(':')[1]
    const key = `${fileName}:${methodName}:${lineNumber}`
    return key
  }
}
