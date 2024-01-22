import { Stage } from './stage'
import { io } from './server'
import { Vec2 } from 'planck'

const stage = new Stage()

io.on('connection', socket => {
  console.log('connection:', socket.id)
  socket.emit('connected')
  const ball = stage.addPlayer({ position: Vec2(0, 0) })
  socket.on('force', (force: Vec2) => {
    ball.force = force
    const message = stage.runner.getSummary({ actor: ball })
    socket.emit('serverUpdateClient', message)
  })
  socket.on('disconnect', () => {
    console.log('disconnect:', socket.id)
    stage.world.destroyBody(ball.body)
  })
})
