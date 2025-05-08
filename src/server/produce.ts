import { Producer } from './producer'
import { matrixSchema, navAreaDefSchema, Promptbook, tableOfContentsSchema, wallDefSchema, WaypointData, waypointDataSchema } from './types'
import fs from 'fs'
import json from 'big-json'
import { ZodSchema } from 'zod'

const parseStream = json.createParseStream()

function parse <Value> (props: {
  label: string
  value: unknown
  schema: ZodSchema<Value>
}): Value {
  const result = props.schema.safeParse(props.value)
  if (result.success) {
    return result.data
  }
  const label = `Invalid ${props.label}`
  console.log(label)
  console.log(result.error.issues[0])
  throw new Error()
}

function parseMany <Value> (props: {
  label: string
  schema: ZodSchema<Value>
  value: unknown[]
}): Value[] {
  return props.value.map((element, index) => {
    const label = `${props.label}[${index}]`
    const parsed: Value = parse({
      label,
      value: element,
      schema: props.schema
    })
    if (index !== 0 && index % 100 === 0) {
      console.log(`Validated ${props.label} (${index}/${props.value.length})`)
    }
    return parsed
  })
}

parseStream.on('data', function (pojo: unknown) {
  console.log('JSON parsed')
  console.log('Validating promptbook...')

  const table = tableOfContentsSchema.parse(pojo)

  console.log('Validating navAreaDefs...')
  const navAreaDefs = parseMany({
    label: 'navAreaDefs',
    schema: navAreaDefSchema,
    value: table.navAreaDefs
  })

  console.log('Validating wallDefs...')
  const wallDefs = parseMany({
    label: 'wallDefs',
    schema: wallDefSchema,
    value: table.wallDefs
  })

  console.log('Validating waypointDatas...')
  const waypointDatas: WaypointData[] = parseMany({
    label: 'waypointDatas',
    schema: waypointDataSchema,
    value: table.waypointDatas
  })

  console.log('Validating waypointMatrix...')
  const waypointMatrix = matrixSchema.parse(table.waypointMatrix)

  const promptbook: Promptbook = {
    ...table,
    navAreaDefs,
    wallDefs,
    waypointDatas,
    waypointMatrix
  }
  console.log('Promptbook validated')

  void new Producer({
    promptbook
  })
})

console.log('Reading promptbook...')
const readStream = fs.createReadStream('input.json')

readStream.on('open', () => {
  console.log('Promptbook opened')
})

readStream.on('close', () => {
  console.log('Promptbook closed')
})

let index = 0
readStream.on('data', (chunk) => {
  if (index === 0 || index % 100 === 0) {
    console.log('Prompt', index, 'is', chunk.length, 'long')
  }
  index++
})

readStream.on('ready', () => {
  console.log('Promptbook ready')
})

readStream.on('end', () => {
  console.log('Promptbook read')
})

readStream.on('error', (error) => {
  console.error('Error reading promptbook', error)
})

readStream.pipe(parseStream)
