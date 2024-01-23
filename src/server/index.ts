import { Stage } from './stage'
import { io } from './server'
import { Vec2 } from 'planck'

const stage = new Stage()

io.on('connection', socket => {
  console.log('connection:', socket.id)
  socket.emit('connected')
  const player = stage.addPlayer({ position: Vec2(0, 0) })
  socket.on('force', (force: Vec2) => {
    player.force = force
    const summary = stage.runner.getSummary({ actor: player })
    socket.emit('serverUpdateClient', summary)
  })
  socket.on('disconnect', () => {
    console.log('disconnect:', socket.id)
    stage.world.destroyBody(player.body)
  })
})
