import { io } from 'socket.io-client'
import { Input } from '../shared/input'
import { Summary } from '../shared/summary'
import { Renderer } from './renderer'

const input = new Input()
const renderer = new Renderer()

window.onkeydown = function (event: KeyboardEvent) {
  input.take({
    key: event.key,
    value: true
  })
}
window.onkeyup = function (event: KeyboardEvent) {
  input.take({
    key: event.key,
    value: false
  })
}
window.onwheel = function (event: WheelEvent) {
  renderer.camera.zoom -= 0.005 * event.deltaY
  console.info('renderer.camera.zoom', renderer.camera.zoom)
}
let lastSummary: Summary
window.onmousedown = (event: MouseEvent) => {
  console.info('lastSummary', lastSummary)
}

const socket = io()
socket.on('connected', () => {
  console.info('connected!')
})
socket.on('serverUpdateClient', (summary: Summary) => {
  lastSummary = summary
  console.log('summary', summary)
  renderer.updateElements(summary)
})

function updateServer (): void {
  socket.emit('controls', input.controls)
}
setInterval(updateServer, 1 / 60)
