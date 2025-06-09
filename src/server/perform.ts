import { Promptbook } from './types'
import { PublicPerformance } from './stage/publicPerformance'
import { PrivatePerformance } from './stage/privatePerformance'
import { TestPerformance } from './stage/testPerformance'
import { SmallPerformance } from './stage/smallPerformance'
import { Server } from './server'
import read from './read'

export default function perform (props: {
  filename?: string
  onData: (props: { data: unknown }) => Promptbook
  performance?: string
}): void {
  const name = props.performance ?? process.argv[2] ?? 'public'
  console.info(`Performing ${name}...`)
  const PERFORMANCES: Record<string, typeof PrivatePerformance> = {
    private: PrivatePerformance,
    public: PublicPerformance,
    small: SmallPerformance,
    test: TestPerformance
  }
  const Performance = PERFORMANCES[name]
  if (Performance == null) {
    throw new Error(`Unknown performance: ${name}`)
  }
  function onData (onDataProps: { data: unknown }): void {
    const promptbook = props.onData({ data: onDataProps.data })
    console.info('Waypoints.length:', promptbook.waypointDatas.length)
    console.info('Half size:', promptbook.halfWidth, 'x', promptbook.halfHeight)
    const playhouse = new Performance({ promptbook })
    void new Server({ playhouse })
  }
  const filename = props.filename ?? process.argv[3] ?? 'output'
  read({ filename, onData })
}
