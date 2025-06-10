import { indexSchema, NestedNumberRecord, numberRecordSchema, Promptbook, wallDefSchema, WaypointData, waypointDataIndexSchema } from './types'
import { PublicPerformance } from './stage/publicPerformance'
import { PrivatePerformance } from './stage/privatePerformance'
import { TestPerformance } from './stage/testPerformance'
import { SmallPerformance } from './stage/smallPerformance'
import { Server } from './server'
import read from './read'
import readMany from './readMany'
import fs from 'fs'

export default function perform (props: {
  filename?: string
  onBook: boolean
  performance?: string
}): void {
  const performanceName = props.performance ?? process.argv[2] ?? 'public'
  console.info(`Performing ${performanceName}...`)
  const PERFORMANCES: Record<string, typeof PrivatePerformance> = {
    private: PrivatePerformance,
    public: PublicPerformance,
    small: SmallPerformance,
    test: TestPerformance
  }
  const Performance = PERFORMANCES[performanceName]
  if (Performance == null) {
    throw new Error(`Unknown performance: ${performanceName}`)
  }
  const promptbookName = props.filename ?? process.argv[3] ?? 'output'
  const indexPath = `promptbooks/${promptbookName}/index.json`
  const index = read({ path: indexPath, schema: indexSchema, safe: props.onBook })
  console.info('Half size:', index.halfWidth, 'x', index.halfHeight)
  const wallDefs = readMany({
    path: `promptbooks/${promptbookName}/wallDefs`,
    schema: wallDefSchema,
    safe: props.onBook
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
    const waypointIndex = read({
      path: `promptbooks/${promptbookName}/waypointDatas/${folder}/index.json`,
      schema: waypointDataIndexSchema,
      safe: props.onBook
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
  const playhouse = new Performance({ promptbook })
  void new Server({ playhouse })
}
