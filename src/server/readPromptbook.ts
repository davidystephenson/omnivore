import { NestedNumberRecord, numberRecordSchema, Promptbook, WaypointData } from './types'
import read from './read'
import fs from 'fs'
import readWalls from './readWalls'
import readMainIndex from './readMainIndex'
import readWaypointIndex from './readWaypointIndex'

export default function readPromptbook (props: {
  filename?: string
  onBook: boolean
  promptbookName: string
}): Promptbook {
  const index = readMainIndex({ promptbookName: props.promptbookName, onBook: props.onBook })
  const wallDefs = readWalls({
    promptbookName: props.promptbookName,
    onBook: props.onBook
  })
  const waypointFolders = fs.readdirSync(`promptbooks/${props.promptbookName}/waypointDatas`)
  console.info(`Reading ${waypointFolders.length} waypoint folders...`)
  let factor = 100
  const waypointDatas = waypointFolders.map((id, index) => {
    if (index % factor === 0) {
      console.info(`Reading waypoint folder ${id} of ${waypointFolders.length}...`)
    }
    if (index >= factor * 10) {
      factor *= 10
    }
    const waypointIndex = readWaypointIndex({
      onBook: props.onBook,
      promptbookName: props.promptbookName,
      folder: id
    })
    const nextFiles = fs.readdirSync(`promptbooks/${props.promptbookName}/waypointDatas/${id}/next`)
    const nextWaypoints: NestedNumberRecord = {}
    nextFiles.forEach(nextWaypointsForRadiusFile => {
      const numberRecord = read({
        path: `promptbooks/${props.promptbookName}/waypointDatas/${id}/next/${nextWaypointsForRadiusFile}`,
        schema: numberRecordSchema,
        safe: props.onBook
      })
      const radiusString = nextWaypointsForRadiusFile.replace('.json', '')
      const radius = Number(radiusString)
      nextWaypoints[radius] = numberRecord
    })
    const waypointData: WaypointData = {
      ...waypointIndex,
      nextWaypoints
    }
    return waypointData
  })
  const promptbook: Promptbook = {
    ...index,
    wallDefs,
    waypointDatas
  }
  return promptbook
}
