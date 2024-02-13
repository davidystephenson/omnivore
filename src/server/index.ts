import { Stage } from './stage'
import { io } from './server'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'

const stage = new Stage()

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
    if (controls.right) x += 1
    if (controls.select) {
      player.eye.body.setPosition(Vec2(0, 0))
    }
    const direction = Vec2(x, y)
    direction.normalize()
    const force = Vec2.mul(direction, 20)
    player.mouths.forEach(mouth => { mouth.force = force })
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
