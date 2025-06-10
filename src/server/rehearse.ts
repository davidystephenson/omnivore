import { Server } from './server'
import { DressRehearsal } from './stage/dressRehearsal'
import { GrandRehearsal } from './stage/grandRehearsal'
import { Maze } from './stage/maze'
import { Mission } from './stage/mission'
import { Rehearsal } from './stage/rehearsal'

const name = process.argv[2] ?? ''
console.info(`Rehearsing ${name}...`)
const REHEARSALS: Record<string, typeof Mission> = {
  '': Rehearsal,
  dress: DressRehearsal,
  grand: GrandRehearsal,
  maze: Maze,
  mission: Mission
}
const Playhouse = REHEARSALS[name]
if (Playhouse == null) {
  throw new Error(`Unknown rehearsal: ${name}`)
}
const playhouse = new Playhouse()
void new Server({ playhouse })
