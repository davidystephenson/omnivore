export interface Timings {
  vision?: number
  movement?: number
  explore?: number
  isVisible?: number
  isPointInRange?: number
  sort?: number
  target?: number
  maneuver?: number
  sortNearest?: number
  maneuverElse?: number
  flee?: number
  maneuverLoop?: number
  maneuverStep?: number
  afterManeuverLoop?: number
  reachable?: number
  postReachable?: number
  navigate?: number
  charge?: number
  chase?: number
  wander?: number
  isOpen?: number
  afterIsOpen?: number
  distances?: number
  startToNeighbor?: number
  neighborToEnd?: number
  afterDistances?: number
}
