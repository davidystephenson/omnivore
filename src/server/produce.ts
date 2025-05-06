import { LayoutData } from './layout'
import { Producer } from './producer'
import fs from 'fs'
import json from 'big-json'

const readStream = fs.createReadStream('input.json')
const parseStream = json.createParseStream()

console.log('Parsing JSON...')
parseStream.on(
  'end',
  (x: unknown) => {
    console.log('JSON parsed')
    console.log('x', x)
  }
)
parseStream.on('data', function (pojo) {
  const keys = Object.keys(pojo)
  console.log('keys.length', keys.length)
  void new Producer({
    layoutData: pojo as unknown as LayoutData
  })
})

readStream.pipe(parseStream)
