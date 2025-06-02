export interface Timings {
  afterDistances?: number
  movement?: number
  explore?: number
  '> exploreVisible'?: number
  '> > isVisible'?: number
  '> > extra'?: number
  isPointInRange?: number
  sort?: number
  target?: number
  maneuver?: number
  '> maneuver memory'?: number
  '> maneuver targets'?: number
  sortNearest?: number
  maneuverStep?: number
  '> > charge'?: number
  '> > flee'?: number
  '> > judge'?: number
  postReachable?: number
  navigate?: number
  chase?: number
  wander?: number
  afterIsOpen?: number
  distances?: number
  summary?: number
  startToNeighbor?: number
  neighborToEnd?: number
  vision?: number
}
