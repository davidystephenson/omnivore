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
function isControlKey (key: string): key is ControlKey {
  return key in keysToControl
}

type Control = typeof keysToControl[ControlKey]
export type Controls = Record<Control, boolean>

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
    if (isControlKey(props.key)) {
      const control = keysToControl[props.key]
      this.controls[control] = props.value
    } else {
      console.warn('Uncontrolled key:', props.key)
    }
  }
}
