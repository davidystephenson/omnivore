import { Server } from './server'
import readPromptbook from './readPromptbook'
import { PrivatePerformance } from './stage/privatePerformance'
import { PublicPerformance } from './stage/publicPerformance'
import { SmallPerformance } from './stage/smallPerformance'
import { TestPerformance } from './stage/testPerformance'

export default function perform (props: {
  filename?: string
  onBook: boolean
  performance?: string
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
  const promptbook = readPromptbook({
    filename: props.filename,
    onBook: props.onBook,
    performance: props.performance
  })
  const playhouse = new Performance({ promptbook })
  void new Server({ playhouse })
}
