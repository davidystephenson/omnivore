import { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'
import readPromptbook from './readPromptbook'
import decompress from 'decompress'

const DOWNLOAD_PATH = './promptbooks/download'

async function main (): Promise<void> {
  console.info('Producing...')
  await promises.rm(DOWNLOAD_PATH, { recursive: true, force: true })
  await promises.mkdir(DOWNLOAD_PATH, { recursive: true })
  await downloadPromptbook()
  console.info('Decompressing...')
  await decompress('./promptbooks/download.zip', DOWNLOAD_PATH, { strip: 1 })
  console.info('Reading promptbook...')
  const promptbook = readPromptbook({
    onBook: false,
    promptbookName: 'download'
  })
  perform({ promptbook, promptbookName: 'download' })
}
void main()
