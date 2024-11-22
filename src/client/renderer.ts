import { Vec2 } from 'planck'
import { ClientElement } from '../shared/element'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'
import { HALF_SIGHT } from '../shared/sight'
import { DebugLine } from '../shared/debugLine'
import { DebugCircle } from '../shared/debugCircle'

export class Renderer {
  lerp = 0.5
  elements = new Map<number, ClientElement>()
  foodCount = 0
  ropes: Rope[] = []
  debugLines: DebugLine[] = []
  debugCircles: DebugCircle[] = []
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
    const eye = this.elements.get(this.id)
    if (eye == null) {
      return
    }
    this.context.translate(eye.x, eye.y)
    this.context.fillStyle = 'rgba(50,50,50,1)'
    this.context.lineWidth = 0.4
    this.context.beginPath()
    this.context.moveTo(-HALF_SIGHT.x, HALF_SIGHT.y)
    this.context.lineTo(-HALF_SIGHT.x, -HALF_SIGHT.y)
    this.context.lineTo(HALF_SIGHT.x, -HALF_SIGHT.y)
    this.context.lineTo(HALF_SIGHT.x, HALF_SIGHT.y)
    this.context.closePath()
    this.context.fill()
    this.ropes.forEach(rope => {
      this.followCamera()
      this.context.lineWidth = 0.1
      this.context.strokeStyle = 'green'
      this.context.beginPath()
      this.context.moveTo(rope.a.x, rope.a.y)
      this.context.lineTo(rope.b.x, rope.b.y)
      this.context.stroke()
    })
    this.elements.forEach(element => {
      if (!element.visible) return
      this.followCamera()
      this.context.translate(element.x, element.y)
      this.context.rotate(element.n)
      if (element.z != null) {
        this.drawCircle(element)
      }
      if (element.v != null) {
        this.drawPolygon(element, element.v)
        if (element.d != null) {
          this.drawPolygon(element, element.d)
        }
      }
    })
    this.debugLines.forEach(debugLine => {
      this.followCamera()
      this.context.lineWidth = debugLine.width
      this.context.strokeStyle = `rgba(${debugLine.color.red}, ${debugLine.color.green}, ${debugLine.color.blue}, 1)`
      this.context.beginPath()
      this.context.moveTo(debugLine.a.x, debugLine.a.y)
      this.context.lineTo(debugLine.b.x, debugLine.b.y)
      this.context.stroke()
    })
    this.debugCircles.forEach(debugCircle => {
      this.followCamera()
      this.context.lineWidth = 0.05
      this.context.fillStyle = `rgba(${debugCircle.color.red}, ${debugCircle.color.green}, ${debugCircle.color.blue}, ${debugCircle.color.alpha})`
      this.context.beginPath()
      this.context.arc(debugCircle.position.x, debugCircle.position.y, debugCircle.radius, 0, 2 * Math.PI)
      this.context.fill()
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

  drawPolygon (element: ClientElement, vertices: Vec2[]): void {
    const context = this.context
    context.save()
    this.context.fillStyle = `rgba(${element.r},${element.g},${element.b},${element.a})`
    context.beginPath()
    vertices.forEach((vertex, i) => {
      const x = vertex.x
      const y = vertex.y
      if (i === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.clip()
    context.fill()
    this.context.strokeStyle = `rgba(${element.r},${element.g},${element.b},1)`
    this.context.lineWidth = 2 * element.o
    context.beginPath()
    vertices.forEach((vertex, i) => {
      const x = vertex.x
      const y = vertex.y
      if (i === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.stroke()
    context.restore()
  }

  drawCircle (element: ClientElement): void {
    if (element.z == null) {
      throw new Error('Missing circle center x')
    }
    if (element.w == null) {
      throw new Error('Missing circle center y')
    }
    if (element.u == null) {
      throw new Error('Missing circle radius')
    }
    const context = this.context
    context.save()
    this.context.fillStyle = `rgba(${element.r},${element.g},${element.b},${element.a})`
    context.beginPath()
    context.arc(element.z, element.w, element.u, 0, 2 * Math.PI)
    context.fill()
    context.clip()
    this.context.strokeStyle = `rgba(${element.r},${element.g},${element.b},1)`
    this.context.lineWidth = 5 * element.o
    context.beginPath()
    context.arc(element.z, element.w, element.u, 0, 2 * Math.PI)
    context.stroke()
    context.restore()
  }

  updateElements (summary: Summary): void {
    this.elements.forEach(element => {
      element.visible = false
    })
    summary.elements.forEach(element => {
      const oldElement = this.elements.get(element.i)
      if (oldElement != null) {
        const oldPosition = new Vec2(oldElement.x, oldElement.y)
        const newPosition = new Vec2(element.x, element.y)
        const distance = Vec2.distance(oldPosition, newPosition)
        if (distance < 1) {
          // const lerped = Vec2.add(Vec2.mul(oldPosition, this.lerp), Vec2.mul(newPosition, 1 - this.lerp))
          // element.x = lerped.x
          // element.y = lerped.y
        }
        const complete = { ...oldElement, ...element, visible: true }
        this.elements.set(element.i, complete)
      } else {
        if (element.r == null) {
          console.error(`missing element ${element.i} red`)
          return
        }
        if (element.g == null) {
          console.error(`missing element ${element.i} green`)
          return
        }
        if (element.b == null) {
          console.error(`missing element ${element.i} blue`)
          return
        }
        if (element.o == null) {
          console.error(`missing element ${element.i} borderWidth`)
          return
        }
        if (element.z == null && element.v == null) {
          console.error(`missing element ${element.i} center x and polygon`)
          return
        }
        const complete: ClientElement = {
          ...element,
          r: element.r,
          g: element.g,
          b: element.b,
          o: element.o,
          visible: true
        }
        this.elements.set(element.i, complete)
      }
      if (element.i === summary.id) {
        this.camera.position = new Vec2(element.x, element.y)
      }
    })
    this.foodCount = summary.foodCount
    this.ropes = summary.ropes
    this.debugLines = summary.debugLines
    this.debugCircles = summary.debugCircles
    this.id = summary.id
  }
}
