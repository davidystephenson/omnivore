import { Vec2 } from 'planck'

export interface Element {
  b?: number // blue
  d?: Vec2[] // seed
  c: number // scale
  e?: number // speed
  g?: number // green
  h: number // health
  i: number // id
  l?: boolean // left
  m?: number // stamina
  n: number // angle
  o?: boolean // down
  r?: number // red
  u?: number // radius
  p?: boolean // up
  s?: number // strength
  t?: boolean // right
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
