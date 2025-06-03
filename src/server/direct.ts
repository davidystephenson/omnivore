import { Performer } from './performer'
import { PerformanceConstructor, PerformanceName, performanceNameSchema } from './types'
import fs from 'fs'
import json from 'big-json'
import { PublicProduction } from './stage/publicProduction'
import { PrivateProduction } from './stage/privateProduction'
import { TestProduction } from './stage/testProduction'
import { SmallProduction } from './stage/smallProduction'
import downloadPromptbook from './downloadPromptbook'

const performances: Record<PerformanceName, PerformanceConstructor> = {
  private: PrivateProduction,
  public: PublicProduction,
  small: SmallProduction,
  test: TestProduction
}

const performanceName = performanceNameSchema.parse(process.argv[2])

console.info(`Directing ${performanceName}...`)

const performance = performances[performanceName]

async function main (): Promise<void> {
  await downloadPromptbook()
  const parseStream = json.createParseStream()

  parseStream.on('data', function (pojo) {
    console.info('JSON parsed')
    console.info('Waypoints.length:', pojo.waypointDatas.length)
    void new Performer({
      promptbook: pojo,
      Performance: performance
    })
  })

  const path = 'promptbooks/download.json'
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
void main()
