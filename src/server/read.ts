import { ZodSchema } from 'zod'
import skim from './skim'

export default function read <Data> (props: {
  path: string
  schema: ZodSchema<Data>
  safe: boolean
}): Data {
  const skimmed = skim({ path: props.path })
  if (props.safe) {
    const data = props.schema.parse(skimmed)
    return data
  }
  const data = skimmed as Data
  return data
}
