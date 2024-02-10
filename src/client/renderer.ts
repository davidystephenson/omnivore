import { Vec2 } from 'planck'
import { Element } from '../shared/element'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'

export class Renderer {
  lerp = 0.5
  elements = new Map<number, Element>()
  ropes: Rope[] = []
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  id: number = 0
  camera = {
    position: new Vec2(0, 0),
    zoom: 0
  }

  constructor () {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = this.canvas.getContext('2d')
    if (context == null) throw new Error('No Canvas')
    this.context = context
    this.render()
  }

  render (): void {
    window.requestAnimationFrame(t => this.render())
    this.context.resetTransform()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.followCamera()
    this.elements.forEach(element => {
      this.followCamera()
      if (element.id === this.id) {
        this.context.translate(element.position.x, element.position.y)
        this.context.fillStyle = 'rgba(50,50,50,1)'
        this.context.lineWidth = 0.4
        this.context.beginPath()
        if (element.circle != null) {
          const x = element.circle.center.x
          const y = element.circle.center.y
          const halfHeight = 13
          const halfWidth = halfHeight * 16 / 9
          this.context.moveTo(x - halfWidth, y + halfHeight)
          this.context.lineTo(x - halfWidth, y - halfHeight)
          this.context.lineTo(x + halfWidth, y - halfHeight)
          this.context.lineTo(x + halfWidth, y + halfHeight)
          this.context.closePath()
          this.context.fill()
        }
      }
    })
    this.ropes.forEach(rope => {
      this.context.lineWidth = 0.1
      this.context.strokeStyle = 'green'
      this.context.beginPath()
      this.context.moveTo(rope.positionA.x, rope.positionA.y)
      this.context.lineTo(rope.positionB.x, rope.positionB.y)
      this.context.stroke()
    })
    this.elements.forEach(element => {
      this.followCamera()
      this.context.translate(element.position.x, element.position.y)
      this.context.rotate(element.angle)
      this.drawCircle(element)
      this.drawPolygon(element)
    })
  }

  followCamera (): void {
    this.context.resetTransform()
    this.context.translate(0.5 * this.canvas.width, 0.5 * this.canvas.height)
    const vmin = Math.min(this.canvas.width, this.canvas.height)
    this.context.scale(0.03 * vmin, -0.03 * vmin)
    const cameraScale = Math.exp(0.1 * this.camera.zoom)
    this.context.scale(cameraScale, cameraScale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
  }

  drawPolygon (element: Element): void {
    if (element.polygon != null) {
      const context = this.context
      context.save()
      const color = element.color
      this.context.fillStyle = `rgba(${color.red},${color.green},${color.blue},${color.alpha})`
      context.beginPath()
      element.polygon.vertices.forEach((vertex, i) => {
        const x = vertex.x
        const y = vertex.y
        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      })
      context.closePath()
      context.clip()
      context.fill()
      const borderColor = element.borderColor
      this.context.strokeStyle = `rgba(${borderColor.red},${borderColor.green},${borderColor.blue},${borderColor.alpha})`
      this.context.lineWidth = 2 * element.borderWidth
      context.beginPath()
      element.polygon.vertices.forEach((vertex, i) => {
        const x = vertex.x
        const y = vertex.y
        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      })
      context.closePath()
      context.stroke()
      context.restore()
    }
  }

  drawCircle (element: Element): void {
    if (element.circle != null) {
      const context = this.context
      context.save()
      const color = element.color
      this.context.fillStyle = `rgba(${color.red},${color.green},${color.blue},${color.alpha})`
      context.beginPath()
      context.arc(element.circle.center.x, element.circle.center.y, element.circle.radius, 0, 2 * Math.PI)
      context.fill()
      context.clip()
      const borderColor = element.borderColor
      this.context.strokeStyle = `rgba(${borderColor.red},${borderColor.green},${borderColor.blue},${borderColor.alpha})`
      this.context.lineWidth = 2 * element.borderWidth
      context.beginPath()
      context.arc(element.circle.center.x, element.circle.center.y, element.circle.radius, 0, 2 * Math.PI)
      context.stroke()
      context.restore()
    }
  }

  updateElements (summary: Summary): void {
    const newElements = new Map<number, Element>()
    summary.elements.forEach(element => {
      const oldElement = this.elements.get(element.id)
      if (oldElement != null) {
        const oldPosition = oldElement.position
        const newPosition = element.position
        element.position = Vec2.add(Vec2.mul(oldPosition, this.lerp), Vec2.mul(newPosition, 1 - this.lerp))
      }
      newElements.set(element.id, element)
      if (element.id === summary.id) this.camera.position = element.position
    })
    this.elements = newElements
    this.ropes = summary.ropes
    this.id = summary.id
  }
}
