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
let lastSummary: Summary
window.onmousedown = (event: MouseEvent) => {
  console.log('lastSummary', lastSummary)
}

const socket = io()
socket.on('connected', () => {
  console.log('connected!')
})
socket.on('serverUpdateClient', (summary: Summary) => {
  lastSummary = summary
  renderer.updateElements(summary)
})

function updateServer (): void {
  socket.emit('controls', input.controls)
}
setInterval(updateServer, 1 / 60)
