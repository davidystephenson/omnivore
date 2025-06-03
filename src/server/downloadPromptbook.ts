import fs from 'fs'
import { finished } from 'stream/promises'

const URL = 'https://drive.usercontent.google.com/download?id=16zGxYMm6GRJcC9H8x4wksOtYS_RsksIN&export=download&authuser=0&confirm=t'
const PATH = './promptbooks/download.json'

export default async function downloadPromptbook (): Promise<void> {
  console.log('Downloading...')
  const response = await fetch(URL)
  console.log('Response received')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  if (response.body == null) {
    throw new Error('No body')
  }
  console.log('Saving...')
  const writer = fs.createWriteStream(PATH)
  const reader = response.body.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      writer.write(value)
    }
    writer.end()
    await finished(writer)
    console.log('File downloaded successfully')
  } finally {
    reader.releaseLock()
  }
}
