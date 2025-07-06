import { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'
import readPromptbook from './readPromptbook'

async function main (): Promise<void> {
  console.info('Directing...')
  await promises.mkdir('./promptbooks', { recursive: true })
  await downloadPromptbook()
  const promptbook = readPromptbook({
    onBook: false,
    promptbookName: 'download'
  })
  perform({ promptbook, promptbookName: 'download' })
}
void main()
