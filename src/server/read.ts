import bigJson from 'big-json'
import fs from 'fs'

export default function read (props: {
  onData: (props: { data: unknown }) => void
  filename: string
}): void {
  const parseStream = bigJson.createParseStream()

  parseStream.on('data', function (data: unknown) {
    console.info('JSON parsed')
    props.onData({ data })
  })

  const path = `promptbooks/${props.filename}.json`
  console.info(`Reading ${path}...`)
  const readStream = fs.createReadStream(path)

  readStream.on('open', () => {
    console.info('Promptbook opened')
  })

  readStream.on('close', () => {
    console.info('Promptbook closed')
  })

  let index = 0
  readStream.on('data', (chunk) => {
    if (index === 0 || index % 500 === 0) {
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
}
