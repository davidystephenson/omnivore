import getPromptbookName from './getPromptbookName'
import readInitial from './readInitial'
import { Server } from './server'
import { DressRehearsal } from './stage/dressRehearsal'
import { GrandRehearsal } from './stage/grandRehearsal'
import { Maze } from './stage/maze'
import { Mission } from './stage/mission'
import { SmallRehearsal } from './stage/smallRehearsal'

const name = process.argv[2] ?? 'small'
console.info(`Rehearsing ${name}...`)
const STAGES: Record<string, typeof Mission> = {
  dress: DressRehearsal,
  grand: GrandRehearsal,
  maze: Maze,
  mission: Mission,
  small: SmallRehearsal
}
const Stage = STAGES[name]
if (Stage == null) {
  throw new Error(`Unknown rehearsal: ${name}`)
}
const promptbookName = getPromptbookName()
const initial = readInitial({ promptbookName, onBook: false })
const stage = new Stage({
  initial,
  onBook: false,
  promptbookName
})
void new Server({ stage: stage })
