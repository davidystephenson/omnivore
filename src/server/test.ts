import fs from 'fs'

class Data {
  x: number

  constructor (x: number) {
    this.x = x
  }
}

const file = fs.readFileSync('./test.json', 'utf-8')
console.info('file', file)

const data: unknown = JSON.parse(file)
if (!(data instanceof Data)) {
  throw new Error('not data')
}
console.info('data', data)
