import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
// import { Rehearsal } from './rehearsal'
import { Gene } from './gene'
import { Funhouse } from './funhouse'
import { GREEN } from '../shared/color'

const stage = new Funhouse()

io.on('connection', socket => {
  stage.log({
    value: ['connection:', socket.id]
  })
  socket.emit('connected')
  const gene = new Gene({
    radius: 0.9
  })
  stage.log({ value: ['gene:', gene] })
  const player = stage.addPlayer({
    color: GREEN,
    gene,
    position: Vec2(-20, 15)
  })
  socket.on('controls', (controls: Controls) => {
    player.controls = controls
    if (controls.select) {
      stage.runner.paused = true
    }
    if (controls.cancel) {
      stage.runner.paused = false
      player.membrane.health = 1
    }
    const summary = stage.runner.getSummary({ player })
    stage.log({ value: ['size', JSON.stringify(summary).length] })
    stage.log({ value: ['emit summary.elements.length', summary.elements.length] })
    socket.emit('serverUpdateClient', summary)
  })
  socket.on('disconnect', () => {
    stage.log({
      value: ['disconnect:', socket.id]
    })
    player.features.forEach(feature => {
      stage.world.destroyBody(feature.body)
    })
    stage.actors.delete(player.id)
  })
})
