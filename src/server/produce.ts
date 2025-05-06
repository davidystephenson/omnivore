import { LayoutData } from './layout'
import { Producer } from './producer'
import fs from 'fs'
import json from 'big-json'

const readStream = fs.createReadStream('input.json')
const parseStream = json.createParseStream()

parseStream.on('data', function (pojo) {
  const keys = Object.keys(pojo)
  console.log('keys.length', keys.length)
  void new Producer({
    layoutData: pojo as unknown as LayoutData
  })
})

readStream.pipe(parseStream)
