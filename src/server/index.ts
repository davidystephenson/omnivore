import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
import { Rehearsal } from './rehearsal'

const stage = new Rehearsal()

const FORCE_SCALE = 5

io.on('connection', socket => {
  stage.log({
    value: ['connection:', socket.id]
  })
  socket.emit('connected')
  const organism = stage.addOrganism({
    playing: true,
    position: Vec2(0, 0)
  })
  socket.on('controls', (controls: Controls) => {
    let x = 0
    let y = 0
    if (controls.up) y += 1
    if (controls.down) y -= 1
    if (controls.left) x -= 1
    if (controls.right) {
      x += 1
    }
    if (controls.select) {
      stage.runner.paused = true
    }
    if (controls.cancel) {
      stage.runner.paused = false
      organism.membrane.health = 1
    }
    const direction = Vec2(x, y)
    direction.normalize()
    const force = Vec2.mul(direction, FORCE_SCALE)
    if (organism.membranes.length === 0) {
      organism.membrane.force = Vec2.mul(force, organism.membrane.body.getMass())
    }
    organism.membranes.forEach(membrane => {
      membrane.force = Vec2.mul(force, membrane.body.getMass())
    })
    const summary = stage.runner.getSummary({ organism })
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
