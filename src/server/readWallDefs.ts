import { range } from './math'
import read from './read'
import { WallDef, wallDefSchema } from './types'

export default function readWallDefs (props: {
  promptbookName: string
  onBook: boolean
  wallCount: number
}): WallDef[] {
  console.info(`Reading ${props.wallCount} wall defs...`)
  const indexes = range(0, props.wallCount)
  const wallDefs = indexes.map(index => {
    const wallDefPath = `promptbooks/${props.promptbookName}/wallDefs/${index}.json`
    const wallDef = read({ path: wallDefPath, schema: wallDefSchema, safe: props.onBook })
    return wallDef
  })
  return wallDefs
}
