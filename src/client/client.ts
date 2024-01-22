import { Vec2 } from 'planck'
import { io } from 'socket.io-client'
import { Input } from './input'
import { Summary } from '../shared/summary'
import { Renderer } from './renderer'

const input = new Input()
const renderer = new Renderer()

const socket = io()
socket.on('connected', () => {
  console.log('connected')
})
socket.on('serverUpdateClient', (summary: Summary) => {
  renderer.updateComponents(summary.components)
  renderer.camera.position = summary.position
})

setInterval(updateServer, 1 / 60)

function updateServer (): void {
  let x = 0
  let y = 0
  if (input.isKeyDown('w') || input.isKeyDown('ArrowUp')) y += 1
  if (input.isKeyDown('s') || input.isKeyDown('ArrowDown')) y -= 1
  if (input.isKeyDown('a') || input.isKeyDown('ArrowLeft')) x -= 1
  if (input.isKeyDown('d') || input.isKeyDown('ArrowRight')) x += 1
  const force = Vec2(x, y)
  force.normalize()
  socket.emit('force', force)
}