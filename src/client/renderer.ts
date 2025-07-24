import { Vec2 } from 'planck'
import { ClientElement } from '../shared/element'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'
import { HALF_SIGHT_HEIGHT, HALF_SIGHT_SIZE } from '../shared/sight'
import { DebugLine } from '../shared/debugLine'
import { DebugCircle } from '../shared/debugCircle'
import { LIGHT_GREEN } from '../shared/color'
import { Input } from '../shared/input'
import { getBaseLog } from '../server/math'

export class Renderer {
  static BACKGROUND = 'rgba(50,50,50,0.9)'
  camera = {
    position: new Vec2(0, 0),
    zoom: 0
  }

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  debugLines: DebugLine[] = []
  debugCircles: DebugCircle[] = []
  elements = new Map<number, ClientElement>()
  frames = 0
  foodCount = 0
  fpsList: number[] = []
  id: number = 0
  input: Input
  lerp = 0.5
  ropes: Rope[] = []
  summary?: Summary

  constructor (props: {
    input: Input
  }) {
    this.input = props.input
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = this.canvas.getContext('2d')
    if (context == null) throw new Error('No Canvas')
    this.context = context
    this.render()
  }

  drawCircle (element: ClientElement): void {
    if (this.summary == null) {
      throw new Error('Missing summary')
    }
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
    this.context.fillStyle = `rgba(${element.r},${element.g},${element.b},1)`
    context.beginPath()
    context.arc(element.z, element.w, element.u, 0, 2 * Math.PI)
    context.fill()
    context.clip()
    this.context.fillStyle = Renderer.BACKGROUND
    const maximumInnerRadius = element.u - element.o
    const damage = 1 - element.h
    const innerRadius = maximumInnerRadius * damage
    const self = element.i === this.summary.id
    if (self) {
      console.log('maximumInnerRadius', maximumInnerRadius)
      console.log('damage', damage)
      console.log('innerRadius', innerRadius)
    }
    context.beginPath()
    context.arc(element.z, element.w, innerRadius, 0, 2 * Math.PI)
    context.fill()
    if (self) {
      if (this.summary.stamina == null) {
        throw new Error('Missing stamina')
      }
      if (this.summary.speed == null) {
        throw new Error('Missing speed')
      }
      const minimum = 0.14
      const maximumBonus = element.u - minimum
      const bonusLength = maximumBonus * this.summary.speed
      const length = minimum + bonusLength
      const bonusWidth = maximumBonus * this.summary.stamina
      const width = minimum + bonusWidth
      this.context.lineWidth = width
      this.context.strokeStyle = 'lime'
      const x = this.summary.increase ?? 1
      const ratio = 1 / (x + 0.5)
      const base = 1.007
      const logarithm = getBaseLog(base, ratio)
      const interval = logarithm + 70
      const remainder = this.frames % interval
      const highlighted = this.summary.increase != null && remainder <= 5
      this.indicate({
        control: this.input.controls.left,
        element,
        highlight: highlighted,
        length
      })
      this.indicate({
        control: this.input.controls.right,
        element,
        highlight: highlighted,
        length,
        positive: true
      })
      this.indicate({
        control: this.input.controls.up,
        element,
        highlight: highlighted,
        length,
        positive: true,
        vertical: true
      })
      this.indicate({
        control: this.input.controls.down,
        element,
        highlight: highlighted,
        length,
        vertical: true
      })
    } else {
      this.indicate({
        element,
        length
      })
      this.indicate({
        element,
        length,
        positive: true
      })
      this.indicate({
        element,
        length,
        positive: true,
        vertical: true
      })
      this.indicate({
        element,
        length,
        vertical: true
      })
    }
    context.restore()
  }

  drawElement (props: {
    element: ClientElement
  }): void {
    if (!props.element.visible) return
    this.followCamera()
    this.context.translate(props.element.x, props.element.y)
    this.context.rotate(props.element.n)
    if (props.element.z != null) {
      this.drawCircle(props.element)
    }
    if (props.element.v != null) {
      this.drawPolygon(props.element, props.element.v)
      if (props.element.d != null) {
        this.drawPolygon(props.element, props.element.d)
      }
    }
  }

  drawIndicator (props: {
    color: string
    element: ClientElement
    length: number
    positive?: boolean
    vertical?: boolean
  }): void {
    if (props.element.z == null) {
      throw new Error('Missing circle center x')
    }
    if (props.element.w == null) {
      throw new Error('Missing circle center y')
    }
    if (props.element.u == null) {
      throw new Error('Missing circle radius')
    }
    const vertical = props.vertical ?? false
    const positive = props.positive ?? false
    const directionCoordinate = vertical ? props.element.w : props.element.z
    const outer = positive
      ? directionCoordinate + props.element.u
      : directionCoordinate - props.element.u
    const inner = positive
      ? outer - props.length
      : outer + props.length
    this.context.strokeStyle = props.color
    this.context.beginPath()
    if (vertical) {
      this.context.moveTo(props.element.z, outer)
      this.context.lineTo(props.element.z, inner)
    } else {
      this.context.moveTo(outer, props.element.w)
      this.context.lineTo(inner, props.element.w)
    }
    this.context.stroke()
  }

  drawPolygon (element: ClientElement, vertices: Vec2[]): void {
    const context = this.context
    context.save()
    this.context.fillStyle = `rgba(${element.r},${element.g},${element.b},${element.h})`
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
    const longestSide = vertices.reduce((max, vertex) => {
      const distance = Vec2.distance(vertex, vertices[0])
      return Math.max(max, distance)
    }, 0)
    const borderWidth = longestSide * element.h
    this.context.lineWidth = 2 * borderWidth
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

  followCamera (): void {
    this.context.resetTransform()
    this.context.translate(0.5 * this.canvas.width, 0.5 * this.canvas.height)
    const vmin = Math.min(this.canvas.width, this.canvas.height)
    this.context.scale(0.02 * vmin, -0.02 * vmin)
    const cameraScale = 22 / HALF_SIGHT_HEIGHT * Math.exp(0.03 * this.camera.zoom)
    this.context.scale(cameraScale, cameraScale)
    this.context.translate(-this.camera.position.x, -this.camera.position.y)
  }

  getPoints (): string {
    if (this.summary == null) {
      throw new Error('Missing summary')
    }
    if (this.summary.points == null) {
      throw new Error('Missing points in summary')
    }
    // if (this.summary.points > 1000000000) {
    //   const billions = Math.floor(this.summary.points / 1000000000)
    //   const billionsString = `${billions}b`
    //   const millions = Math.floor((this.summary.points % 1000000000) / 1000000)
    //   const millionsString = `${millions}m`
    //   const thousands = Math.floor((this.summary.points % 1000000) / 1000)
    //   const thousandsString = `${thousands}k`
    //   const string = `${billionsString} ${millionsString} ${thousandsString}`
    //   return string
    // }
    // if (this.summary.points >= 1000000) {
    //   const millions = Math.floor(this.summary.points / 1000000)
    //   const millionsString = `${millions}m`
    //   const thousands = Math.floor((this.summary.points % 1000000) / 1000)
    //   const thousandsString = `${thousands}k`
    //   return `${millionsString} ${thousandsString}`
    // }
    // if (this.summary.points >= 10000) {
    //   const thousands = Math.floor(this.summary.points / 1000)
    //   return `${thousands}k`
    // }
    const rounded = Math.floor(this.summary.points)
    return rounded.toLocaleString()
  }

  indicate (props: {
    control?: boolean
    element: ClientElement
    highlight?: boolean
    length: number
    positive?: boolean
    vertical?: boolean
  }): void {
    if (props.control !== true && props.element.h > 0.1) {
      return
    }
    const color = props.control === true
      ? props.highlight === true
        ? 'white'
        : 'lime'
      : Renderer.BACKGROUND
    this.drawIndicator({
      color,
      element: props.element,
      length: props.length,
      positive: props.positive,
      vertical: props.vertical
    })
  }

  render (): void {
    this.frames += 1
    window.requestAnimationFrame(t => this.render())
    this.context.resetTransform()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.summary == null) return
    this.followCamera()
    this.summary.curtains?.forEach(curtain => {
      this.drawElement({ element: curtain })
    })
    const eye = this.elements.get(this.id)
    if (eye == null) {
      return
    }
    this.context.translate(eye.x, eye.y)

    this.context.fillStyle = Renderer.BACKGROUND
    this.context.lineWidth = 0.4
    this.context.beginPath()
    this.context.moveTo(-HALF_SIGHT_SIZE.x, HALF_SIGHT_SIZE.y)
    this.context.lineTo(-HALF_SIGHT_SIZE.x, -HALF_SIGHT_SIZE.y)
    this.context.lineTo(HALF_SIGHT_SIZE.x, -HALF_SIGHT_SIZE.y)
    this.context.lineTo(HALF_SIGHT_SIZE.x, HALF_SIGHT_SIZE.y)
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
      this.drawElement({ element })
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
    this.context.resetTransform()
    this.context.fillStyle = 'white'
    this.context.font = '50px Arial'
    const age = String(this.summary.age)
    const points = this.getPoints()
    const message = `${points} (+${age})`
    this.context.fillText(message, 10, 60)
    if (this.summary.respawn != null && this.summary.respawn > -1) {
      const next = this.summary.respawn === 0
      const color = next ? 'lime' : 'white'
      this.context.fillStyle = color
      const message = `Respawning in ${this.summary.respawn}...`
      this.context.fillText(message, 10, this.canvas.height * 0.95)
    }
    const total = this.fpsList.reduce((a, b) => a + b, 0)
    const average = total / this.fpsList.length
    const floored = Math.floor(average)
    const capped = Math.min(floored, 30)
    this.context.fillStyle = capped < 25 ? 'red' : 'green'
    this.context.fillText(`${capped} fps`, this.canvas.width * 0.909, 60)
  }

  update (summary: Summary): void {
    this.summary = summary
    this.fpsList.push(summary.fps)
    if (this.fpsList.length > 100) {
      this.fpsList.shift()
    }
    this.elements.forEach(element => {
      element.visible = false
    })
    summary.features?.forEach(element => {
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
    if (summary.foodCount != null) {
      this.foodCount = summary.foodCount
    }
    if (summary.ropes != null) {
      this.ropes = summary.ropes
    }
    if (summary.debugLines != null) {
      this.debugLines = summary.debugLines
    }
    if (summary.debugCircles != null) {
      this.debugCircles = summary.debugCircles
    }
    if (summary.id != null) {
      this.id = summary.id
    }
  }
}
