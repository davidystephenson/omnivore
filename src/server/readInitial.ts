import readMainIndex from './readMainIndex'
import readWalls from './readWalls'
import readWaypointIndex from './readWaypointIndex'
import { Initial } from './types'
import fs from 'fs'

export default function readInitial (props: {
  promptbookName: string
  onBook: boolean
}): Initial | undefined {
  const exists = fs.existsSync(`promptbooks/${props.promptbookName}`)
  console.info(`Directory exists: ${exists ? 'Yes' : 'No'}`)
  if (!exists) {
    return undefined
  }
  const wallDefs = readWalls(props)
  const mainIndex = readMainIndex(props)
  const waypointFolders = fs.readdirSync(`promptbooks/${props.promptbookName}/waypointDatas`)
  console.info(`Reading ${waypointFolders.length} waypoint folders...`)
  let factor = 100
  const waypointIndexes = waypointFolders.map((folder, index) => {
    if (index % factor === 0) {
      console.info(`Reading waypoint folder ${index} of ${waypointFolders.length}...`)
    }
    if (index >= factor * 10) {
      factor *= 10
    }
    const waypointIndex = readWaypointIndex({
      onBook: props.onBook,
      promptbookName: props.promptbookName,
      folder
    })
    return waypointIndex
  })
  const index: Initial = {
    ...mainIndex,
    wallDefs,
    waypointIndexes
  }
  return index
}
