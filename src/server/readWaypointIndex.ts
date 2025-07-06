import { waypointDefSchema, WaypointDef } from './types'
import read from './read'

export default function readWaypointIndex (props: {
  onBook: boolean
  promptbookName: string
  folder: string
}): WaypointDef {
  const waypointIndex = read({
    path: `promptbooks/${props.promptbookName}/waypointDatas/${props.folder}/index.json`,
    schema: waypointDefSchema,
    safe: props.onBook
  })
  return waypointIndex
}
