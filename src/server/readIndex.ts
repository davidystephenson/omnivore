import readMainIndex from './readMainIndex'
import readWalls from './readWalls'
import readWaypointIndex from './readWaypointIndex'
import { Index } from './types'
import fs from 'fs'

export default function readIndex (props: {
  promptbookName: string
  onBook: boolean
}): Index {
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
  const index: Index = {
    mainIndex,
    wallDefs,
    waypointIndexes
  }
  return index
}
