import fs from 'fs'
import { finished } from 'stream/promises'

const URL = 'https://drive.usercontent.google.com/download?id=1e7QeIVHvBYspa_JQeu82SS1mIexB4Pey&export=download&authuser=0&confirm=t'
// https://drive.google.com/file/d/1e7QeIVHvBYspa_JQeu82SS1mIexB4Pey/view?usp=sharing
const PATH = './promptbooks/download.zip'

export default async function downloadPromptbook (): Promise<void> {
  console.info('Downloading...')
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
  let factor = 1000
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      bytes += result.value.length
      if (bytes > factor) {
        factor *= 10
        // local timezone with swedish format
        const timestamp = new Date().toLocaleString('sv-SE')
        console.info(timestamp, 'Downloaded', bytes, 'bytes')
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
