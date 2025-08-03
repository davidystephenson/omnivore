import fs from 'fs'
import { finished } from 'stream/promises'

export default async function downloadPromptbook (props: {
  url: string
  zipPath: string
}): Promise<void> {
  console.info(`Downloading from ${props.url} to ${props.zipPath}...`)
  const response = await fetch(props.url)
  console.info('Response received')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  if (response.body == null) {
    throw new Error('No body')
  }
  console.info('Saving...')
  const writer = fs.createWriteStream(props.zipPath)
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
