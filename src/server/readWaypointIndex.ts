import fs from 'fs'
import { waypointDataIndexSchema, WaypointDataIndex } from './types'
import read from './read'

export default function readWaypointIndex (props: {
  onBook: boolean
  promptbookName: string
  folder: string
}): WaypointDataIndex {
  const waypointFolders = fs.readdirSync(`promptbooks/${props.promptbookName}/waypointDatas`)
  console.info(`Reading ${waypointFolders.length} waypoint folders...`)
  const waypointIndex = read({
    path: `promptbooks/${props.promptbookName}/waypointDatas/${props.folder}/index.json`,
    schema: waypointDataIndexSchema,
    safe: props.onBook
  })
  return waypointIndex
}
