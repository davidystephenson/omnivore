import { Performer } from './performer'
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
  console.info(label)
  console.info(result.error.issues[0])
  throw new Error()
}

function validateMany <Value> (props: {
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

parseStream.on('data', function (pojo) {
  console.info('JSON parsed')
  console.info('Waypoints.length:', pojo.waypointDatas.length)
  // console.info('Validating promptbook...')

  // const table = tableOfContentsSchema.parse(pojo)
  // console.info('Validated half height:', table.halfHeight)
  // console.info('Validated half width:', table.halfWidth)
  // console.info('Validated radii:', table.radii)

  // const navAreaDefs = validateMany({
  //   label: 'navAreaDefs',
  //   schema: navAreaDefSchema,
  //   value: table.navAreaDefs
  // })

  // const wallDefs = validateMany({
  //   label: 'wallDefs',
  //   schema: wallDefSchema,
  //   value: table.wallDefs
  // })

  // const waypointDatas: WaypointData[] = validateMany({
  //   label: 'waypointDatas',
  //   schema: waypointDataSchema,
  //   value: table.waypointDatas
  // })

  // const waypointMatrix = matrixSchema.parse(table.waypointMatrix)

  // const promptbook: Promptbook = {
  //   ...table,
  //   navAreaDefs,
  //   wallDefs,
  //   waypointDatas,
  //   waypointMatrix
  // }
  // console.info('Promptbook validated ')

  void new Performer({
    promptbook: pojo
  })
})

console.info('Reading promptbook...')
const readStream = fs.createReadStream('input.json')

readStream.on('open', () => {
  console.info('Promptbook opened')
})

readStream.on('close', () => {
  console.info('Promptbook closed')
})

let index = 0
readStream.on('data', (chunk) => {
  if (index === 0 || index % 100 === 0) {
    console.info('Prompt', index, 'is', chunk.length, 'long')
  }
  index++
})

readStream.on('ready', () => {
  console.info('Promptbook ready')
})

readStream.on('end', () => {
  console.info('Promptbook read')
})

readStream.on('error', (error) => {
  console.error('Error reading promptbook', error)
})

readStream.pipe(parseStream)
