export interface Rgb {
  blue: number
  green: number
  label: string
  red: number
}

export interface Rgba extends Rgb {
  alpha: number
}

export const BLACK: Rgb = { red: 0, green: 0, label: 'black', blue: 0 }
export const BLUE: Rgb = { red: 25, green: 25, label: 'blue', blue: 255 }
export const CYAN: Rgb = { red: 0, green: 255, label: 'cyan', blue: 255 }
export const DARK_BLUE: Rgb = { red: 0, green: 0, label: 'dark blue', blue: 255 }
export const LIME: Rgb = { red: 0, green: 255, label: 'lime', blue: 0 }
export const GRAY: Rgb = { red: 128, green: 128, label: 'gray', blue: 128 }
export const GREY: Rgb = { red: 128, green: 128, label: 'grey', blue: 128 }
export const WHITE: Rgb = { red: 255, green: 255, label: 'white', blue: 255 }
export const LIGHT_GREEN: Rgb = { red: 0, green: 145, label: 'light green', blue: 0 }

export const GREEN: Rgb = { red: 0, green: 128, label: 'green', blue: 0 }
export const MAGENTA: Rgb = { red: 255, green: 0, label: 'magenta', blue: 255 }
export const RED: Rgb = { red: 255, green: 0, label: 'red', blue: 0 }
export const YELLOW: Rgb = { red: 255, green: 255, label: 'yellow', blue: 0 }
export const ORANGE: Rgb = { red: 255, green: 165, label: 'orange', blue: 0 }
export const PURPLE: Rgb = { red: 128, green: 0, label: 'purple', blue: 128 }
export const PINK: Rgb = { red: 255, green: 192, label: 'pink', blue: 203 }
export const BROWN: Rgb = { red: 111, green: 78, label: 'brown', blue: 55 }

export const COLOR = {
  BLACK,
  BLUE,
  DARK_BLUE,
  CYAN,
  LIME,
  GRAY,
  GREY,
  WHITE,
  LIGHT_GREEN,
  GREEN,
  MAGENTA,
  RED,
  YELLOW,
  ORANGE,
  PURPLE,
  PINK,
  BROWN
}
