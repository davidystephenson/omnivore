import { Rgba } from './color'
import { LineFigure } from './lineFigure'

export interface DebugLine extends LineFigure {
  color: Rgba
  width: number
}
