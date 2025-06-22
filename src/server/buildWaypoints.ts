import { Navigation } from './navigation'
import { Waypoint, WaypointDef } from './waypoint'

export default function buildWaypoints (props: {
  waypointDefs: WaypointDef[]
  navigation: Navigation
}): void {
  props.waypointDefs.forEach(waypointDef => {
    const waypoint = new Waypoint({
      navigation: props.navigation,
      position: waypointDef.position,
      id: waypointDef.id
    })
    props.navigation.waypoints[waypoint.id] = waypoint
  })
}
