export class Color {
  alpha: number
  blue: number
  green: number
  red: number

  static BLACK = new Color({ red: 0, green: 0, blue: 0 })
  static BLUE = new Color({ red: 0, green: 0, blue: 255 })
  static CYAN = new Color({ red: 0, green: 255, blue: 255 })
  static GREEN = new Color({ red: 0, green: 128, blue: 0 })
  static LIME = new Color({ red: 0, green: 255, blue: 0 })
  static MAGENTA = new Color({ red: 255, green: 0, blue: 255 })
  static RED = new Color({ red: 255, green: 0, blue: 0 })
  static YELLOW = new Color({ red: 255, green: 255, blue: 0 })
  static WHITE = new Color({ red: 255, green: 255, blue: 255 })

  constructor (props: {
    alpha?: number
    blue: number
    green: number
    red: number
  }) {
    this.alpha = props.alpha ?? 1
    this.blue = props.blue
    this.green = props.green
    this.red = props.red
  }
}
