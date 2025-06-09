import { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'

async function main (): Promise<void> {
  console.info('Directing...')
  await promises.mkdir('./promptbooks', { recursive: true })
  await downloadPromptbook()
  perform({ filename: 'download', onBook: false })
}
void main()
