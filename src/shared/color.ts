export interface Rgb {
  blue: number
  green: number
  red: number
}

export interface Rgba extends Rgb {
  alpha: number
}

export const BLACK: Rgb = { red: 0, green: 0, blue: 0 }
export const BLUE: Rgb = { red: 0, green: 0, blue: 255 }
export const CYAN: Rgb = { red: 0, green: 255, blue: 255 }
export const GREEN: Rgb = { red: 0, green: 128, blue: 0 }
export const LIME: Rgb = { red: 0, green: 255, blue: 0 }
export const MAGENTA: Rgb = { red: 255, green: 0, blue: 255 }
export const RED: Rgb = { red: 255, green: 0, blue: 0 }
export const YELLOW: Rgb = { red: 255, green: 255, blue: 0 }
export const WHITE: Rgb = { red: 255, green: 255, blue: 255 }
