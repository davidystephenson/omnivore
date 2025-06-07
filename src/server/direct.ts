import { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import trust from './trust'
import perform from './perform'

async function main (): Promise<void> {
  console.info('Directing...')
  await promises.mkdir('./promptbooks', { recursive: true })
  await downloadPromptbook()
  perform({ filename: 'download', onData: trust })
}
void main()
