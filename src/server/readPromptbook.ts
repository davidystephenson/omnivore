import { NestedNumberRecord, numberRecordSchema, Promptbook, WaypointData } from './types'
import read from './read'
import fs from 'fs'
import readWalls from './readWalls'
import readMainIndex from './readMainIndex'
import readWaypointIndex from './readWaypointIndex'

export default function readPromptbook (props: {
  filename?: string
  onBook: boolean
  performance?: string
}): Promptbook {
  const promptbookName = props.filename ?? process.argv[3] ?? 'output'
  const index = readMainIndex({ promptbookName, onBook: props.onBook })
  const wallDefs = readWalls({
    promptbookName,
    onBook: props.onBook
  })
  const waypointFolders = fs.readdirSync(`promptbooks/${promptbookName}/waypointDatas`)
  console.info(`Reading ${waypointFolders.length} waypoint folders...`)
  let factor = 100
  const waypointDatas = waypointFolders.map((folder, index) => {
    if (index % factor === 0) {
      console.info(`Reading waypoint folder ${index} of ${waypointFolders.length}...`)
    }
    if (index >= factor * 10) {
      factor *= 10
    }
    const waypointIndex = readWaypointIndex({
      onBook: props.onBook,
      promptbookName,
      folder
    })
    const files = fs.readdirSync(`promptbooks/${promptbookName}/waypointDatas/${folder}`)
    const radiusFiles = files.filter(file => !file.endsWith('index.json'))
    const nextWaypoints: NestedNumberRecord = {}
    radiusFiles.forEach(radiusFile => {
      const numberRecord = read({
        path: `promptbooks/${promptbookName}/waypointDatas/${folder}/${radiusFile}`,
        schema: numberRecordSchema,
        safe: props.onBook
      })
      const radiusString = radiusFile.replace('.json', '')
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
