import { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'
import readPromptbook from './readPromptbook'
import decompress from 'decompress'

async function main (): Promise<void> {
  console.info('Producing...')
  await promises.mkdir('./promptbooks/download', { recursive: true })
  await downloadPromptbook()
  console.info('Decompressing...')
  await decompress('./promptbooks/download.zip', './promptbooks/download')
  console.info('Decompressed!')
  console.info('Reading promptbook...')
  const promptbook = readPromptbook({
    onBook: false,
    promptbookName: 'download'
  })
  perform({ promptbook, promptbookName: 'download' })
}
void main()
