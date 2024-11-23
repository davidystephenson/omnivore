export class Flags {
  botChase: boolean
  botFlee: boolean
  botPath: boolean
  charge: boolean
  death: boolean
  hungerY: boolean
  navigation: boolean
  performance: boolean
  respawn: boolean
  summary: boolean
  vision: boolean
  visionY: boolean
  waypoints: boolean
  waypointSpawnpointsY: boolean

  constructor (props: {
    charge?: boolean
    botChase?: boolean
    botFlee?: boolean
    botPath?: boolean
    death?: boolean
    hungerY?: boolean
    navigation?: boolean
    performance?: boolean
    respawn?: boolean
    summary?: boolean
    vision?: boolean
    visionY?: boolean
    waypoints?: boolean
    waypointSpawnpointsY?: boolean
  }) {
    this.botChase = props.botChase ?? false
    this.botFlee = props.botFlee ?? false
    this.botPath = props.botPath ?? false
    this.charge = props.charge ?? false
    this.death = props.death ?? false
    this.hungerY = props.hungerY ?? true
    this.navigation = props.navigation ?? false
    this.performance = props.performance ?? true
    this.respawn = props.respawn ?? false
    this.summary = props.summary ?? false
    this.vision = props.vision ?? false
    this.visionY = props.visionY ?? true
    this.waypoints = props.waypoints ?? false
    this.waypointSpawnpointsY = props.waypointSpawnpointsY ?? true
  }
}
