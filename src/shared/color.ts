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
    this.green = props.green
    this.blue = props.blue
    this.alpha = props.alpha ?? this.alpha
  }
}
