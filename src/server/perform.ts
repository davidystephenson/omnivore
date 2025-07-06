import { Server } from './server'
import { PrivatePerformance } from './stage/privatePerformance'
import { PublicPerformance } from './stage/publicPerformance'
import { SmallPerformance } from './stage/smallPerformance'
import { TestPerformance } from './stage/testPerformance'
import { Promptbook } from './types'

export default function perform (props: {
  performance?: string
  promptbook: Promptbook
  promptbookName: string
}): void {
  const performanceName = props.performance ?? process.argv[2] ?? 'public'
  console.info(`Performing ${performanceName}...`)
  const PERFORMANCES: Record<string, typeof PrivatePerformance> = {
    private: PrivatePerformance,
    public: PublicPerformance,
    small: SmallPerformance,
    test: TestPerformance
  }
  const Performance = PERFORMANCES[performanceName]
  if (Performance == null) {
    throw new Error(`Unknown performance: ${performanceName}`)
  }
  const playhouse = new Performance({
    promptbook: props.promptbook,
    promptbookName: props.promptbookName
  })
  void new Server({ playhouse })
}
