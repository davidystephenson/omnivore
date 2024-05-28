const keysToControl = {
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ' ': 'select'
} as const

type ControlKey = keyof typeof keysToControl

type Control = typeof keysToControl[ControlKey]
export type Controls = Record<Control, boolean>
const unsafeKeys: Partial<Record<string, Control>> = keysToControl

export class Input {
  controls: Controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    select: false
  }

  take (props: {
    key: string
    value: boolean
  }): void {
    const control = unsafeKeys[props.key]
    if (control == null) {
      console.warn('Uncontrolled key:', props.key)
    } else {
      this.controls[control] = props.value
    }
  }
}

const X = Input
const x = new X()
console.log(x.controls)
