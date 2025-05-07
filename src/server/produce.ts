import { LayoutData } from './layout'
import { Producer } from './producer'
import fs from 'fs'
import json from 'big-json'

const parseStream = json.createParseStream()

parseStream.on('data', function (pojo) {
  console.log('JSON parsed')
  void new Producer({
    layoutData: pojo as unknown as LayoutData
  })
})

console.log('Reading promptbook...')
const readStream = fs.createReadStream('promptbook.json')

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
