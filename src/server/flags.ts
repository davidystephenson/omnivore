export class Flags {
  actors: boolean
  botChase: boolean
  botFlee: boolean
  botPath: boolean
  charge: boolean
  controlLines: boolean
  death: boolean
  hungerY: boolean
  maneuverLines: boolean
  meatY: boolean
  mutation: boolean
  navigation: boolean
  organisms: boolean
  performance: boolean
  players: boolean
  respawn: boolean
  starveBricksY: boolean
  summary: boolean
  vision: boolean
  visionRangeY: boolean
  visionGame: boolean
  waypoints: boolean
  waypointSpawnpointsY: boolean

  constructor (props: {
    actors?: boolean
    charge?: boolean
    botChase?: boolean
    botFlee?: boolean
    botPath?: boolean
    controlLines?: boolean
    death?: boolean
    hungerY?: boolean
    maneuverLines?: boolean
    meatY?: boolean
    mutation?: boolean
    navigation?: boolean
    organisms?: boolean
    performance?: boolean
    players?: boolean
    respawn?: boolean
    starveBricksY?: boolean
    summary?: boolean
    vision?: boolean
    visionRangeY?: boolean
    visionY?: boolean
    waypoints?: boolean
    waypointSpawnpointsY?: boolean
  }) {
    this.actors = props.actors ?? false
    this.botChase = props.botChase ?? false
    this.botFlee = props.botFlee ?? false
    this.botPath = props.botPath ?? false
    this.charge = props.charge ?? false
    this.controlLines = props.controlLines ?? false
    this.death = props.death ?? false
    this.hungerY = props.hungerY ?? true
    this.maneuverLines = props.maneuverLines ?? false
    this.meatY = props.meatY ?? true
    this.mutation = props.mutation ?? false
    this.navigation = props.navigation ?? false
    this.organisms = props.organisms ?? false
    this.performance = props.performance ?? true
    this.players = props.players ?? false
    this.respawn = props.respawn ?? false
    this.starveBricksY = props.starveBricksY ?? true
    this.summary = props.summary ?? false
    this.vision = props.vision ?? false
    this.visionRangeY = props.visionRangeY ?? true
    this.visionGame = props.visionY ?? true
    this.waypoints = props.waypoints ?? false
    this.waypointSpawnpointsY = props.waypointSpawnpointsY ?? true
  }
}
