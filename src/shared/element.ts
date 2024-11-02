import { Vec2 } from 'planck'

export interface Element {
  i: number // id
  n: number // angle
  s: number // scale
  a: number // alpha
  x: number // x
  y: number // y
  z?: number // center x
  w?: number // center y
  o?: number // borderWidth
  u?: number // radius
  v?: Vec2[] // polygon
  d?: Vec2[] // seed
  r?: number // red
  g?: number // green
  b?: number // blue
}

export interface CompleteElement extends Element {
  o: number
  r: number
  g: number
  b: number
}

export interface ClientElement extends CompleteElement {
  visible: boolean
}
