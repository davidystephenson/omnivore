import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
import { Gene } from './gene'
// import { Funhouse } from './funhouse'
import { GREEN } from '../shared/color'
// import { GrandRehearsal } from './stage/grandRehearsal'
// import { Rehearsal } from './stage/rehearsal'
// import { Mission } from './stage/mission'
import { GrandRehearsal } from './stage/grandRehearsal'

const stage = new GrandRehearsal()

io.on('connection', socket => {
  stage.debug({ vs: ['connection:', socket.id] })
  socket.emit('connected')
  const gene = new Gene({
    speed: 0.33,
    stage,
    stamina: 0,
    strength: 0.67
  })
  const player = stage.addPlayer({
    color: GREEN,
    id: socket.id,
    gene,
    position: Vec2(0, 0)
  })
  if (player.organism == null) {
    throw new Error('player.organism is undefined')
  }
  player.organism.membrane.hungerDamage = 0.5
  // player.organism.membrane.combatDamage = 0.9
  socket.on('controls', (controls: Controls) => {
    if (player.organism == null) {
      return
    }
    player.organism.controls = controls
    if (controls.select) {
      stage.runner.paused = true
    }
    if (controls.cancel) {
      stage.runner.paused = false
      player.organism.membrane.combatDamage = 0
      player.organism.membrane.hungerDamage = 0
    }
    const summary = stage.runner.getSummary({ player })
    socket.emit('serverUpdateClient', summary)
  })
  socket.on('disconnect', () => {
    stage.debug({ vs: ['disconnect:', socket.id] })
    player.organism?.destroy()
  })
})
