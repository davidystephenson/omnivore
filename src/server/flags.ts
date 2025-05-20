export class Flags {
  actors: boolean
  botChase: boolean
  botFlee: boolean
  botPath: boolean
  charge: boolean
  controlLines: boolean
  damage: boolean
  death: boolean
  hungerGame: boolean
  isOpen: boolean
  killing: boolean
  killingGame: boolean
  maneuverLines: boolean
  meatGame: boolean
  mutation: boolean
  navigation: boolean
  navAreas: boolean
  organisms: boolean
  organismsCount: boolean
  performance: boolean
  playerNavigation: boolean
  players: boolean
  procedural: boolean
  reproduceGame: boolean
  spawn: boolean
  spawnpoints: boolean
  starveBricksGame: boolean
  summary: boolean
  timings: boolean
  vision: boolean
  visionRangeGame: boolean
  visionGame: boolean
  waypoints: boolean
  waypointSpawnpointsGame: boolean

  constructor (props: {
    actors?: boolean
    charge?: boolean
    damage?: boolean
    botChase?: boolean
    botFlee?: boolean
    botPath?: boolean
    controlLines?: boolean
    death?: boolean
    hungerGame?: boolean
    isOpen?: boolean
    killing?: boolean
    killingGame?: boolean
    maneuverLines?: boolean
    meatGame?: boolean
    mutation?: boolean
    navAreas?: boolean
    navigation?: boolean
    organisms?: boolean
    organismsCount?: boolean
    performance?: boolean
    playerNavigation?: boolean
    players?: boolean
    procedural?: boolean
    reproduceGame?: boolean
    spawn?: boolean
    spawnpoints?: boolean
    starveBricksGame?: boolean
    summary?: boolean
    timings?: boolean
    vision?: boolean
    visionRangeGame?: boolean
    visionGame?: boolean
    waypoints?: boolean
    waypointSpawnpointsGame?: boolean
  }) {
    this.actors = props.actors ?? false
    this.botChase = props.botChase ?? false
    this.botFlee = props.botFlee ?? false
    this.botPath = props.botPath ?? false
    this.charge = props.charge ?? false
    this.controlLines = props.controlLines ?? false
    this.damage = props.damage ?? false
    this.death = props.death ?? false
    this.hungerGame = props.hungerGame ?? true
    this.killing = props.killing ?? false
    this.killingGame = props.killingGame ?? true
    this.isOpen = props.isOpen ?? false
    this.maneuverLines = props.maneuverLines ?? false
    this.meatGame = props.meatGame ?? true
    this.mutation = props.mutation ?? false
    this.navAreas = props.navAreas ?? false
    this.navigation = props.navigation ?? false
    this.organisms = props.organisms ?? false
    this.organismsCount = props.organismsCount ?? false
    this.performance = props.performance ?? true
    this.playerNavigation = props.playerNavigation ?? true
    this.players = props.players ?? false
    this.procedural = props.procedural ?? false
    this.reproduceGame = props.reproduceGame ?? true
    this.spawn = props.spawn ?? false
    this.spawnpoints = props.spawnpoints ?? false
    this.starveBricksGame = props.starveBricksGame ?? true
    this.summary = props.summary ?? false
    this.timings = props.timings ?? false
    this.vision = props.vision ?? false
    this.visionRangeGame = props.visionRangeGame ?? true
    this.visionGame = props.visionGame ?? false
    this.waypoints = props.waypoints ?? false
    this.waypointSpawnpointsGame = props.waypointSpawnpointsGame ?? true
  }
}
