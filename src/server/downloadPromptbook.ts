import fs from 'fs'
import { finished } from 'stream/promises'

const URL = 'https://drive.usercontent.google.com/download?id=16zGxYMm6GRJcC9H8x4wksOtYS_RsksIN&export=download&authuser=0&confirm=t'
const PATH = './promptbooks/download.json'

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

  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      writer.write(result.value)
    }
    writer.end()
    await finished(writer)
    console.info('File downloaded successfully')
  } finally {
    reader.releaseLock()
  }
}
