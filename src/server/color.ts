export class Color {
  red = 255
  green = 255
  blue = 255
  alpha = 1

  constructor (props: {
    red?: number
    green?: number
    blue?: number
    alpha?: number
  }) {
    this.red = props.red ?? this.red
    this.green = props.red ?? this.green
    this.blue = props.red ?? this.red
    this.alpha = props.red ?? this.red
  }
}
