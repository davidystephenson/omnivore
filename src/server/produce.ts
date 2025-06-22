import fs from 'fs'
import readMainIndex from './readMainIndex'
import { DressRehearsal } from './stage/dressRehearsal'

export default function produce (props: {
  promptbookName: string
  onBook: boolean
}): void {
  fs.mkdirSync('./promptbooks', { recursive: true })
  fs.mkdirSync(`./promptbooks/${props.promptbookName}`, { recursive: true })
  const mainExists = fs.existsSync(`./promptbooks/${props.promptbookName}/index.json`)
  if (!mainExists) {
    void new DressRehearsal()
  }
  const main = readMainIndex({
    promptbookName: props.promptbookName,
    onBook: props.onBook
  })
  const waypointsExist = main.waypointIds.every(id => {
    return fs.existsSync(`./promptbooks/${props.promptbookName}/waypointDatas/${id}.json`)
  })
  if (!waypointsExist) {
    void new DressRehearsal({
      main,
      promptbookName: props.promptbookName,
      onBook: props.onBook
    })
  }
}
