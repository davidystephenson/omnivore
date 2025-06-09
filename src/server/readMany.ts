import { ZodSchema } from 'zod'
import skim from './skim'
import fs from 'fs'

export default function readMany <Data> (props: {
  path: string
  schema: ZodSchema<Data>
  safe: boolean
}): Data[] {
  const files = fs.readdirSync(props.path)
  console.info(`Reading ${files.length} files from ${props.path}...`)
  let factor = 100
  const data = files.map((file, index) => {
    if (index > 0 && index % factor === 0) {
      console.info(`Reading file ${index}...`)
    }
    if (index >= factor * 10) {
      factor *= 10
    }
    const skimmed = skim({ path: `${props.path}/${file}` })
    if (props.safe) {
      const data = props.schema.parse(skimmed)
      return data
    }
    const data = skimmed as Data
    return data
  })
  return data
}
