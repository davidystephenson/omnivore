import readMany from './readMany'
import { WallDef, wallDefSchema } from './types'

export default function readWalls (props: {
  promptbookName: string
  onBook: boolean
}): WallDef[] {
  const wallDefs = readMany({
    path: `promptbooks/${props.promptbookName}/wallDefs`,
    schema: wallDefSchema,
    safe: props.onBook
  })
  return wallDefs
}
