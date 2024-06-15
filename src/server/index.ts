import { Stage } from './stage'
import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'

const stage = new Stage()

const FORCE_SCALE = 5

io.on('connection', socket => {
  console.log('connection:', socket.id)
  socket.emit('connected')
  const player = stage.addPlayer({ position: Vec2(0, 0) })
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
      // player.membrane.body.setPosition(Vec2(0, 0))
      stage.runner.paused = true
    }
    if (controls.cancel) {
      stage.runner.paused = false
      player.membrane.health = 1
    }
    const direction = Vec2(x, y)
    direction.normalize()
    const force = Vec2.mul(direction, FORCE_SCALE)
    if (player.membranes.length === 0) {
      player.membrane.force = Vec2.mul(force, player.membrane.body.getMass())
    }
    player.membranes.forEach(membrane => {
      membrane.force = Vec2.mul(force, membrane.body.getMass())
    })
    const summary = stage.runner.getSummary({ player })
    socket.emit('serverUpdateClient', summary)
  })
  socket.on('disconnect', () => {
    console.log('disconnect:', socket.id)
    player.features.forEach(feature => {
      stage.world.destroyBody(feature.body)
    })
    stage.actors.delete(player.id)
  })
})
