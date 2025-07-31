export class Flags {
  actors: boolean
  botChase: boolean
  botFlee: boolean
  botPath: boolean
  charge: boolean
  controlLines: boolean
  curtains: boolean
  damage: boolean
  death: boolean
  extinctGame: boolean
  families: boolean
  growGame: boolean
  hungerGame: boolean
  indigenous: boolean
  isOpen: boolean
  killing: boolean
  killingGame: boolean
  maneuverLines: boolean
  meatGame: boolean
  mutation: boolean
  navigation: boolean
  pebbleGame: boolean
  organisms: boolean
  organismsCount: boolean
  performance: boolean
  playerControl: boolean
  playerDeath: boolean
  playerNavigation: boolean
  playerNearest: boolean
  players: boolean
  procedural: boolean
  reproduceGame: boolean
  respawn: boolean
  singleGame: boolean
  spawn: boolean
  spawnpoints: boolean
  starveBricksGame: boolean
  stats: boolean
  summary: boolean
  tree: boolean
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
    curtains?: boolean
    death?: boolean
    extinctGame?: boolean
    families?: boolean
    growGame?: boolean
    hungerGame?: boolean
    indigenous?: boolean
    isOpen?: boolean
    killing?: boolean
    killingGame?: boolean
    maneuverLines?: boolean
    meatGame?: boolean
    mutation?: boolean
    navigation?: boolean
    organisms?: boolean
    organismsCount?: boolean
    pebbleGame?: boolean
    performance?: boolean
    playerControl?: boolean
    playerDeath?: boolean
    playerNavigation?: boolean
    playerNearest?: boolean
    players?: boolean
    procedural?: boolean
    reproduceGame?: boolean
    respawn?: boolean
    singleGame?: boolean
    spawn?: boolean
    spawnpoints?: boolean
    starveBricksGame?: boolean
    stats?: boolean
    summary?: boolean
    timings?: boolean
    tree?: boolean
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
    this.curtains = props.curtains ?? false
    this.damage = props.damage ?? false
    this.death = props.death ?? false
    this.families = props.families ?? false
    this.growGame = props.growGame ?? true
    this.hungerGame = props.hungerGame ?? true
    this.indigenous = props.indigenous ?? false
    this.killing = props.killing ?? false
    this.killingGame = props.killingGame ?? true
    this.isOpen = props.isOpen ?? false
    this.maneuverLines = props.maneuverLines ?? false
    this.meatGame = props.meatGame ?? true
    this.mutation = props.mutation ?? false
    this.navigation = props.navigation ?? false
    this.organisms = props.organisms ?? false
    this.organismsCount = props.organismsCount ?? false
    this.pebbleGame = props.pebbleGame ?? false
    this.performance = props.performance ?? false
    this.playerControl = props.playerControl ?? false
    this.playerNavigation = props.playerNavigation ?? true
    this.playerNearest = props.playerNearest ?? false
    this.playerDeath = props.playerDeath ?? false
    this.players = props.players ?? false
    this.procedural = props.procedural ?? false
    this.reproduceGame = props.reproduceGame ?? true
    this.respawn = props.respawn ?? false
    this.extinctGame = props.extinctGame ?? false
    this.singleGame = props.singleGame ?? false
    this.spawn = props.spawn ?? false
    this.spawnpoints = props.spawnpoints ?? false
    this.starveBricksGame = props.starveBricksGame ?? true
    this.stats = props.stats ?? false
    this.summary = props.summary ?? false
    this.timings = props.timings ?? false
    this.tree = props.tree ?? false
    this.vision = props.vision ?? false
    this.visionRangeGame = props.visionRangeGame ?? true
    this.visionGame = props.visionGame ?? false
    this.waypoints = props.waypoints ?? false
    this.waypointSpawnpointsGame = props.waypointSpawnpointsGame ?? true
  }
}
