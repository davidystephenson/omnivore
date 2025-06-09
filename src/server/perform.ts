import { indexSchema, navAreaDefSchema, Promptbook, wallDefSchema, waypointDataSchema } from './types'
import { PublicPerformance } from './stage/publicPerformance'
import { PrivatePerformance } from './stage/privatePerformance'
import { TestPerformance } from './stage/testPerformance'
import { SmallPerformance } from './stage/smallPerformance'
import { Server } from './server'
import read from './read'
import readMany from './readMany'

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
  const navAreaDefs = readMany({
    path: `promptbooks/${promptbookName}/navAreaDefs`,
    schema: navAreaDefSchema,
    safe: props.onBook
  })
  const wallDefs = readMany({
    path: `promptbooks/${promptbookName}/wallDefs`,
    schema: wallDefSchema,
    safe: props.onBook
  })
  const waypointDatas = readMany({
    path: `promptbooks/${promptbookName}/waypointDatas`,
    schema: waypointDataSchema,
    safe: props.onBook
  })
  const promptbook: Promptbook = {
    ...index,
    navAreaDefs,
    wallDefs,
    waypointDatas
  }
  const playhouse = new Performance({ promptbook })
  void new Server({ playhouse })
}
