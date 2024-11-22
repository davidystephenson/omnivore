export class DebugFlags {
  botChase: boolean
  botFlee: boolean
  botPath: boolean
  death: boolean
  navigation: boolean
  respawn: boolean
  summary: boolean
  vision: boolean
  waypoints: boolean

  constructor (props: {
    botChase?: boolean
    botFlee?: boolean
    botPath?: boolean
    death?: boolean
    navigation?: boolean
    respawn?: boolean
    summary?: boolean
    vision?: boolean
    waypoints?: boolean
  }) {
    this.botChase = props.botChase ?? false
    this.botFlee = props.botFlee ?? false
    this.botPath = props.botPath ?? false
    this.death = props.death ?? false
    this.navigation = props.navigation ?? false
    this.respawn = props.respawn ?? false
    this.summary = props.summary ?? false
    this.vision = props.vision ?? false
    this.waypoints = props.waypoints ?? false
  }
}
