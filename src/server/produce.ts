import fs, { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'
import readPromptbook from './readPromptbook'
import decompress from 'decompress'

const DOWNLOAD_PATH = './promptbooks/download'
const ZIP_PATH = `${DOWNLOAD_PATH}.zip`

async function main (): Promise<void> {
  console.info('Producing...')
  const zipExists = fs.existsSync(ZIP_PATH)
  if (zipExists) {
    await promises.rm(ZIP_PATH)
  }
  await promises.rm(DOWNLOAD_PATH, { recursive: true, force: true })
  await promises.mkdir(DOWNLOAD_PATH, { recursive: true })
  await downloadPromptbook()
  console.info('Decompressing...')
  await decompress('./promptbooks/download.zip', DOWNLOAD_PATH, { strip: 1 })
  console.info('Removing download...')
  await promises.rm('./promptbooks/download.zip')
  console.info('Reading promptbook...')
  const promptbook = readPromptbook({
    onBook: false,
    promptbookName: 'download'
  })
  perform({ promptbook, promptbookName: 'download' })
}
void main()
