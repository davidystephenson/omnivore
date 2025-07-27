import { Vec2 } from 'planck'

export interface Element {
  b?: number // blue
  d?: Vec2[] // seed
  g?: number // green
  h: number // health
  i: number // id
  n: number // angle
  s: number // scale
  r?: number // red
  u?: number // radius
  v?: Vec2[] // polygon
  w?: number // center y
  x: number // x
  y: number // y
  z?: number // center x
}

export interface CompleteElement extends Element {
  r: number
  g: number
  b: number
}

export interface ClientElement extends CompleteElement {
  visible: boolean
}
