import fs, { promises } from 'fs'
import downloadPromptbook from './downloadPromptbook'
import perform from './perform'
import readPromptbook from './readPromptbook'
import decompress from 'decompress'

const PROMPTBOOKS_DIRECTORY = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? './promptbooks'
const DOWNLOAD_DIRECTORY = `${PROMPTBOOKS_DIRECTORY}/download`
const ZIP_PATH = `${DOWNLOAD_DIRECTORY}.zip`
const URL = 'https://firebasestorage.googleapis.com/v0/b/playomnivore.firebasestorage.app/o/100.zip?alt=media&token=1da4edc5-6d58-4b5f-9d58-a8dc29dbe507'

async function main (): Promise<void> {
  console.info('Producing...')
  const zipExists = fs.existsSync(ZIP_PATH)
  if (zipExists) {
    await promises.rm(ZIP_PATH)
  }
  await promises.rm(DOWNLOAD_DIRECTORY, { recursive: true, force: true })
  await promises.mkdir(DOWNLOAD_DIRECTORY, { recursive: true })
  await downloadPromptbook({ url: URL, zipPath: ZIP_PATH })
  console.info('Decompressing...')
  await decompress('./promptbooks/download.zip', DOWNLOAD_DIRECTORY, { strip: 1 })
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
