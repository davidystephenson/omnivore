export class Color {
  red: number
  green: number
  blue: number
  alpha = 1

  constructor (props: {
    red: number
    green: number
    blue: number
    alpha?: number
  }) {
    this.red = props.red
    this.green = props.red
    this.blue = props.red
    this.alpha = props.red ?? this.red
  }
}
