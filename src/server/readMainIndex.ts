import read from './read'
import { MainIndex, mainIndexSchema } from './types'

export default function readMainIndex (props: {
  promptbookName: string
  onBook: boolean
}): MainIndex {
  const indexPath = `promptbooks/${props.promptbookName}/index.json`
  console.info(`Reading main index from ${indexPath}...`)
  const index = read({ path: indexPath, schema: mainIndexSchema, safe: props.onBook })
  console.info(`Main index from ${indexPath} read: ${index.halfWidth}x${index.halfHeight}`)
  return index
}
