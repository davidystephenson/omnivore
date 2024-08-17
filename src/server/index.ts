import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
// import { Rehearsal } from './rehearsal'
import { Gene } from './gene'
import { Funhouse } from './funhouse'

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
  const organism = stage.addPlayer({
    position: Vec2(-20, 15),
    gene
  })
  socket.on('controls', (controls: Controls) => {
    organism.controls = controls
    if (controls.select) {
      stage.runner.paused = true
    }
    if (controls.cancel) {
      stage.runner.paused = false
      organism.membrane.health = 1
    }
    const summary = stage.runner.getSummary({ player: organism })
    socket.emit('serverUpdateClient', summary)
  })
  socket.on('disconnect', () => {
    stage.log({
      value: ['disconnect:', socket.id]
    })
    organism.features.forEach(feature => {
      stage.world.destroyBody(feature.body)
    })
    stage.actors.delete(organism.id)
  })
})
