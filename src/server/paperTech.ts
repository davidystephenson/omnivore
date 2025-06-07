import { ZodSchema } from 'zod'
import {
  matrixSchema,
  navAreaDefSchema,
  Promptbook,
  tableOfContentsSchema,
  wallDefSchema,
  WaypointData,
  waypointDataSchema
} from './types'

function parse<Value> (props: {
  label: string
  value: unknown
  schema: ZodSchema<Value>
}): Value {
  const result = props.schema.safeParse(props.value)
  if (result.success) {
    return result.data
  }
  const label = `Invalid ${props.label}`
  console.info(label)
  console.info(result.error.issues[0])
  throw new Error()
}

function validateMany<Value> (props: {
  label: string
  schema: ZodSchema<Value>
  value: unknown[]
}): Value[] {
  const message = `Validating ${props.value.length} ${props.label}...`
  console.info(message)
  return props.value.map((element, index) => {
    const label = `${props.label}[${index}]`
    const parsed: Value = parse({
      label,
      value: element,
      schema: props.schema
    })
    if (index !== 0 && index % 100 === 0) {
      console.info(`Validated ${index}/${props.value.length} ${props.label}`)
    }
    return parsed
  })
}

export default function paperTech (props: {
  data: unknown
}): Promptbook {
  console.info('Validating promptbook...')

  const table = tableOfContentsSchema.parse(props.data)
  console.info('Validated half height:', table.halfHeight)
  console.info('Validated half width:', table.halfWidth)
  console.info('Validated radii:', table.radii)

  const navAreaDefs = validateMany({
    label: 'navAreaDefs',
    schema: navAreaDefSchema,
    value: table.navAreaDefs
  })

  const wallDefs = validateMany({
    label: 'wallDefs',
    schema: wallDefSchema,
    value: table.wallDefs
  })

  const waypointDatas: WaypointData[] = validateMany({
    label: 'waypointDatas',
    schema: waypointDataSchema,
    value: table.waypointDatas
  })

  const waypointMatrix = matrixSchema.parse(table.waypointMatrix)

  const promptbook: Promptbook = {
    ...table,
    navAreaDefs,
    wallDefs,
    waypointDatas,
    waypointMatrix
  }
  console.info('Promptbook validated ')
  return promptbook
}
