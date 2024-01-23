import { Vec2 } from 'planck'
import { Component } from '../shared/component'
import { Summary } from '../shared/summary'

export class Renderer {
  lerp = 0.5
  componentMap = new Map<number, Component>()
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
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
    window.onmousedown = (event: MouseEvent) => {
      this.componentMap.forEach(component => {
        console.log(component.position)
      })
    }
  }

  render (): void {
    window.requestAnimationFrame(t => this.render())
    this.context.resetTransform()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.componentMap.forEach(component => {
      this.followCamera()
      this.context.translate(component.position.x, component.position.y)
      this.context.rotate(component.angle)
      component.elements.forEach(element => {
        const color = element.color
        this.context.fillStyle = `rgba(${color.red},${color.green},${color.blue},${color.alpha})`
        if (element.circle != null) {
          this.drawCircle(element.circle.center, element.circle.radius)
        }
        if (element.polygon != null) {
          this.drawPolygon(element.polygon.vertices)
        }
      })
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

  drawPolygon (vertices: Vec2[]): void {
    const context = this.context
    context.beginPath()
    vertices.forEach((vertex, i) => {
      const x = vertex.x
      const y = vertex.y
      if (i === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.fill()
  }

  drawCircle (center: Vec2, radius: number): void {
    const context = this.context
    context.beginPath()
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI)
    context.fill()
  }

  updateComponents (summary: Summary): void {
    const newComponentMap = new Map<number, Component>()
    const components = summary.components
    components.forEach(component => {
      const oldComponent = this.componentMap.get(component.id)
      if (oldComponent != null) {
        const oldPosition = oldComponent.position
        const newPosition = component.position
        component.position = Vec2.add(Vec2.mul(oldPosition, this.lerp), Vec2.mul(newPosition, 1 - this.lerp))
      }
      newComponentMap.set(component.id, component)
      if (component.id === summary.id) this.camera.position = component.position
    })
    this.componentMap = newComponentMap
  }
}
