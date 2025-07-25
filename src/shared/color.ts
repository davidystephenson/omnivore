export interface Rgb {
  blue: number
  green: number
  label: string
  red: number
}
export interface Rgba extends Rgb {
  alpha: number
}
export const BROWN: Rgb = { red: 111, green: 78, label: 'brown', blue: 55 } // debug
export const BLACK: Rgb = { red: 0, green: 0, label: 'black', blue: 0 } // background
export const BLUE: Rgb = { red: 25, green: 25, label: 'blue', blue: 255 } // neutral
export const CYAN: Rgb = { red: 0, green: 255, label: 'cyan', blue: 255 } // debris
export const DARK_BLUE: Rgb = { red: 0, green: 0, label: 'dark blue', blue: 255 }
export const GRAY: Rgb = { red: 128, green: 128, label: 'gray', blue: 128 } // whale
export const GREEN: Rgb = { red: 0, green: 128, label: 'green', blue: 0 } // player
export const LIGHT_GRAY: Rgb = { red: 192, green: 192, label: 'light gray', blue: 192 }
export const LIGHT_GREEN: Rgb = { red: 0, green: 145, label: 'light green', blue: 0 }
export const LIGHT_LIME: Rgb = { red: 128, green: 255, label: 'light lime', blue: 128 }
export const LIGHT_MAGENTA: Rgb = { red: 255, green: 128, label: 'light magenta', blue: 255 }
export const LIGHT_ORANGE: Rgb = { red: 255, green: 192, label: 'light orange', blue: 128 }
export const LIGHT_PINK: Rgb = { red: 255, green: 224, label: 'light pink', blue: 255 }
export const LIGHT_PURPLE: Rgb = { red: 192, green: 128, label: 'light purple', blue: 192 }
export const LIGHT_RED: Rgb = { red: 255, green: 128, label: 'light red', blue: 128 }
export const LIGHT_YELLOW: Rgb = { red: 255, green: 255, label: 'light yellow', blue: 128 }
export const LIME: Rgb = { red: 0, green: 255, label: 'lime', blue: 0 } // player
export const MAGENTA: Rgb = { red: 255, green: 0, label: 'magenta', blue: 255 } // player
export const ORANGE: Rgb = { red: 255, green: 165, label: 'orange', blue: 0 } // crow
export const PINK: Rgb = { red: 255, green: 192, label: 'pink', blue: 203 } // tardigrade
export const PURPLE: Rgb = { red: 128, green: 0, label: 'purple', blue: 128 } // boa
export const RED: Rgb = { red: 255, green: 0, label: 'red', blue: 0 } // tiger
export const WHITE: Rgb = { red: 255, green: 255, label: 'white', blue: 255 } // debug
export const YELLOW: Rgb = { red: 255, green: 255, label: 'yellow', blue: 0 } // fly
export const COLOR = {
  BLACK,
  BLUE,
  BROWN,
  DARK_BLUE,
  CYAN,
  LIME,
  GRAY,
  WHITE,
  LIGHT_GRAY,
  LIGHT_GREEN,
  LIGHT_MAGENTA,
  LIGHT_ORANGE,
  LIGHT_PURPLE,
  LIGHT_RED,
  LIGHT_YELLOW,
  GREEN,
  MAGENTA,
  ORANGE,
  PURPLE,
  PINK,
  RED,
  YELLOW
}
