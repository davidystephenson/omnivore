import fs from 'fs'
import { finished } from 'stream/promises'

const URL = 'https://firebasestorage.googleapis.com/v0/b/playomnivore.firebasestorage.app/o/100.zip?alt=media&token=1da4edc5-6d58-4b5f-9d58-a8dc29dbe507'
// https://drive.google.com/file/d/1e7QeIVHvBYspa_JQeu82SS1mIexB4Pey/view?usp=sharing
const DIRECTORY = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? './promptbooks'
const PATH = `${DIRECTORY}/download.zip`

export default async function downloadPromptbook (): Promise<void> {
  console.log('RAILWAY_VOLUME_MOUNT_PATH:', process.env.RAILWAY_VOLUME_MOUNT_PATH)
  console.info(`Downloading from ${URL} to ${PATH}...`)
  const response = await fetch(URL)
  console.info('Response received')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  if (response.body == null) {
    throw new Error('No body')
  }
  console.info('Saving...')
  const writer = fs.createWriteStream(PATH)
  const reader = response.body.getReader()
  let bytes = 0
  const total = 1894731371
  let factor = 1
  let progress = 0
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      bytes += result.value.length
      const percent = Math.floor((bytes / total) * 100)
      const remainder = percent % factor
      if (remainder === 0 && percent > progress) {
        progress = percent
        const timestamp = new Date().toLocaleString('sv-SE')
        console.info(timestamp, `Downloaded ${bytes} bytes (${percent}%)`)
      }
      const nextFactor = factor * 10
      if (percent >= nextFactor) {
        factor = nextFactor
      }
      writer.write(result.value)
    }
    writer.end()
    await finished(writer)
    console.info('File downloaded successfully:', bytes, 'bytes')
  } finally {
    reader.releaseLock()
  }
}
