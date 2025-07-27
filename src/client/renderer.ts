import { Vec2 } from 'planck'
import { ClientElement } from '../shared/element'
import { Summary } from '../shared/summary'
import { Rope } from '../shared/rope'
import { HALF_SIGHT_HEIGHT, HALF_SIGHT_SIZE } from '../shared/sight'
import { DebugLine } from '../shared/debugLine'
import { DebugCircle } from '../shared/debugCircle'
import { Input } from '../shared/input'
import { getBaseLog } from '../server/math'
import { Rgb, WHITE } from '../shared/color'
import { Food } from '../server/actor/food'
import { BLEEDING_DAMAGE } from '../shared/damage'

export class Renderer {
  static BACKGROUND = 'rgba(50,50,50,1)'
  static MINIMUM_BORDER_WIDTH = 0.1
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
  joystick = false
  baseX = 0
  baseY = 0
  knobX = 0
  knobY = 0
  radius = 60
  knobRadius = 25
  maxDistance = 35
  up = false
  down = false
  left = false
  right = false
  joystickX = 0
  joystickY = 0

  constructor (props: {
    input: Input
  }) {
    this.input = props.input
    const element = document.getElementById('canvas')
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error('No canvas')
    }
    this.canvas = element

    const context = this.canvas.getContext('2d')
    if (context == null) throw new Error('No context')
    this.context = context
    this.canvas.addEventListener('mousedown', (event) => {
      this.startJoystick({ event })
    })
    this.canvas.addEventListener('mousemove', (event) => {
      this.moveJoystick({ event })
    })
    this.canvas.addEventListener('mouseup', (event) => {
      this.endJoystick({ event })
    })
    this.canvas.addEventListener('mouseleave', (event) => {
      this.endJoystick({ event })
    })
    this.canvas.addEventListener('touchstart', (event) => {
      this.startJoystick({ event })
    })
    this.canvas.addEventListener('touchmove', (event) => {
      this.moveJoystick({ event })
    })
    this.canvas.addEventListener('touchend', (event) => {
      this.endJoystick({ event })
    })
    this.canvas.addEventListener('touchcancel', (event) => {
      this.endJoystick({ event })
    })
    const body = document.querySelector('body')
    if (body == null) {
      throw new Error('No body')
    }
    body.requestFullscreen()
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
    const maximumInnerRadius = element.u - Renderer.MINIMUM_BORDER_WIDTH
    const damage = 1 - element.h
    const innerRadius = maximumInnerRadius * damage
    context.beginPath()
    context.arc(element.z, element.w, innerRadius, 0, 2 * Math.PI)
    context.fill()
    const self = element.i === this.summary.id
    if (self) {
      if (this.summary.stamina == null) {
        throw new Error('Missing stamina')
      }
      if (this.summary.speed == null) {
        throw new Error('Missing speed')
      }
      if (this.summary.highlight == null) {
        throw new Error('Missing highlight')
      }
      const minimumIndicator = 0.14
      const bleeding = element.h < BLEEDING_DAMAGE
      if (bleeding) {
        const length = (element.u * BLEEDING_DAMAGE) + minimumIndicator
        this.drawIndicator({
          color: Renderer.BACKGROUND,
          element,
          length,
          width: element.u
        })
        this.drawIndicator({
          color: Renderer.BACKGROUND,
          element,
          length,
          positive: true,
          width: element.u
        })
        this.drawIndicator({
          color: Renderer.BACKGROUND,
          element,
          length,
          positive: true,
          vertical: true,
          width: element.u
        })
        this.drawIndicator({
          color: Renderer.BACKGROUND,
          element,
          length,
          vertical: true,
          width: element.u
        })
      }
      const cap = 1 - Food.NUTRITION
      if (element.h > cap) {
        context.beginPath()
        context.arc(element.z, element.w, 0.1, 0, 2 * Math.PI)
        context.fillStyle = this.getColor({ rgb: this.summary.highlight })
        context.fill()
      }
      const maximumBonus = element.u - minimumIndicator
      const bonusLength = maximumBonus * this.summary.speed
      const length = minimumIndicator + bonusLength
      const bonusWidth = maximumBonus * this.summary.stamina
      const width = minimumIndicator + bonusWidth
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
        length,
        width
      })
      this.indicate({
        control: this.input.controls.right,
        element,
        highlight: highlighted,
        length,
        positive: true,
        width
      })
      this.indicate({
        control: this.input.controls.up,
        element,
        highlight: highlighted,
        length,
        positive: true,
        vertical: true,
        width
      })
      this.indicate({
        control: this.input.controls.down,
        element,
        highlight: highlighted,
        length,
        vertical: true,
        width
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
    width: number
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
    this.context.lineWidth = props.width
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
    // context.fill()
    this.context.strokeStyle = `rgba(${element.r},${element.g},${element.b},1)`
    const shortedSide = vertices.reduce((max, vertex, index) => {
      const nextIndex = (index + 1) % vertices.length
      const nextVertex = vertices[nextIndex]
      const distance = Vec2.distance(vertex, nextVertex)
      return Math.min(max, distance)
    }, Infinity)
    const borderWidth = (((shortedSide / 2) - Renderer.MINIMUM_BORDER_WIDTH) * element.h) + Renderer.MINIMUM_BORDER_WIDTH
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

  endJoystick (props: {
    event: MouseEvent | TouchEvent
  }): void {
    props.event.preventDefault()
    this.joystick = false

    // Reset input
    this.up = false
    this.down = false
    this.left = false
    this.right = false
    this.joystickX = 0
    this.joystickY = 0

    this.input.take({ key: 'ArrowUp', value: false })
    this.input.take({ key: 'ArrowDown', value: false })
    this.input.take({ key: 'ArrowLeft', value: false })
    this.input.take({ key: 'ArrowRight', value: false })
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

  getColor (props: {
    rgb: Rgb
  }): string {
    return `rgba(${props.rgb.red},${props.rgb.green},${props.rgb.blue},1)`
  }

  getPressPosition (props: {
    debug?: boolean
    event: MouseEvent | TouchEvent
  }): {
      x: number
      y: number
    } {
    if (props.debug === true) {
      console.info('getEventPosition', props.event)
    }
    if ('touches' in props.event && props.event.touches.length > 0) {
      console.log('touch', props.event.touches[0])
      const percentX = props.event.touches[0].clientX / window.innerWidth
      const percentY = props.event.touches[0].clientY / window.innerHeight
      const x = percentX * this.canvas.width
      const y = percentY * this.canvas.height
      return { x, y }
    }
    if (!(props.event instanceof MouseEvent)) {
      throw new Error('Expected MouseEvent')
    }
    const rect = this.canvas.getBoundingClientRect()
    // const canvasY = this.canvas.getBoundingClientRect().top
    const offsetX = props.event.clientX - rect.left
    console.log('offsetX', offsetX)
    const offsetY = props.event.clientY - rect.top
    const percentX = offsetX / rect.width
    console.info('percentX', percentX)
    const percentY = offsetY / rect.height
    console.info('percentY', percentY)
    const x = percentX * this.canvas.width
    console.info('x', x)
    const y = percentY * this.canvas.height
    console.info('y', y)
    return { x, y }
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
    width: number
  }): void {
    if (props.control !== true) {
      return
    }
    if (this.summary?.highlight == null) {
      throw new Error('Missing highlight')
    }
    const color = props.highlight === true
      ? WHITE.label
      : this.getColor({ rgb: this.summary.highlight })
    if (props.element.u == null) {
      throw new Error('Missing circle radius')
    }
    this.drawIndicator({
      color,
      element: props.element,
      length: props.length,
      positive: props.positive,
      vertical: props.vertical,
      width: props.width
    })
  }

  moveJoystick (props: {
    event: MouseEvent | TouchEvent
  }): void {
    if (!this.joystick) return
    props.event.preventDefault()

    const position = this.getPressPosition({ event: props.event })
    const dx = position.x - this.baseX
    const dy = position.y - this.baseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= this.maxDistance) {
      this.knobX = position.x
      this.knobY = position.y
    } else {
      const angle = Math.atan2(dy, dx)
      this.knobX = this.baseX + Math.cos(angle) * this.maxDistance
      this.knobY = this.baseY + Math.sin(angle) * this.maxDistance
    }

    this.updateInput()
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
    this.context.fillStyle = this.summary.extinct
      ? 'black'
      : 'rgba(50, 50, 50, 0.9)'
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
    if (this.summary.extinct) {
      this.context.fillStyle = 'red'
      this.context.font = 'bold 50px Arial'
      const measurement = this.context.measureText('EXTINCT')
      const height = measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent
      console.log('height', height)
      const halfHeight = height * 0.5
      console.log('halfHeight', halfHeight)
      const halfWidth = measurement.width * 0.5
      console.log('halfWidth', halfWidth)
      const x = (this.canvas.width * 0.5) - halfWidth
      const y = (this.canvas.height * 0.5) + halfHeight
      this.context.fillText('EXTINCT', x, y)
      return
    }
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

    if (this.joystick) {
      console.log('this.baseX', this.baseX)
      console.log('this.baseY', this.baseY)

      // Draw base circle
      this.context.beginPath()
      this.context.arc(this.baseX, this.baseY, this.radius, 0, 2 * Math.PI)
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)'
      this.context.fill()
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      this.context.lineWidth = 2
      this.context.stroke()

      // Draw inner boundary
      this.context.beginPath()
      this.context.arc(this.baseX, this.baseY, this.maxDistance, 0, 2 * Math.PI)
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      this.context.lineWidth = 1
      this.context.stroke()

      // Draw knob
      this.context.beginPath()
      this.context.arc(this.knobX, this.knobY, this.knobRadius, 0, 2 * Math.PI)
      this.context.fillStyle = 'rgba(255, 255, 255, 0.8)'
      this.context.fill()
      this.context.strokeStyle = 'rgba(255, 255, 255, 1)'
      this.context.lineWidth = 2
      this.context.stroke()

      // Draw connection line
      this.context.beginPath()
      this.context.moveTo(this.baseX, this.baseY)
      this.context.lineTo(this.knobX, this.knobY)
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      this.context.lineWidth = 2
      this.context.stroke()

      this.input.take({ key: 'ArrowUp', value: this.up })
      this.input.take({ key: 'ArrowDown', value: this.down })
      this.input.take({ key: 'ArrowLeft', value: this.left })
      this.input.take({ key: 'ArrowRight', value: this.right })
    }
  }

  startJoystick (props: {
    event: MouseEvent | TouchEvent
  }): void {
    props.event.preventDefault()
    const position = this.getPressPosition({ debug: true, event: props.event })

    this.joystick = true
    this.baseX = position.x
    this.baseY = position.y
    this.knobX = position.x
    this.knobY = position.y

    this.updateInput()
  }

  update (props: {
    summary: Summary
  }): void {
    this.summary = props.summary
    this.fpsList.push(props.summary.fps)
    if (this.fpsList.length > 100) {
      this.fpsList.shift()
    }
    this.elements.forEach(element => {
      element.visible = false
    })
    props.summary.features?.forEach(element => {
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
        if (element.z == null && element.v == null) {
          console.error(`missing element ${element.i} center x and polygon`)
          return
        }
        const complete: ClientElement = {
          ...element,
          r: element.r,
          g: element.g,
          b: element.b,
          visible: true
        }
        this.elements.set(element.i, complete)
      }
      if (element.i === props.summary.id) {
        this.camera.position = new Vec2(element.x, element.y)
      }
    })
    if (props.summary.foodCount != null) {
      this.foodCount = props.summary.foodCount
    }
    if (props.summary.ropes != null) {
      this.ropes = props.summary.ropes
    }
    if (props.summary.debugLines != null) {
      this.debugLines = props.summary.debugLines
    }
    if (props.summary.debugCircles != null) {
      this.debugCircles = props.summary.debugCircles
    }
    if (props.summary.id != null) {
      this.id = props.summary.id
    }
  }

  updateInput (): void {
    if (!this.joystick) return

    const dx = this.knobX - this.baseX
    const dy = this.knobY - this.baseY

    // Normalize to -1 to 1 range
    this.joystickX = Math.max(-1, Math.min(1, dx / this.maxDistance))
    this.joystickY = Math.max(-1, Math.min(1, dy / this.maxDistance))

    // Determine directional inputs with deadzone
    const deadzone = 0.3
    this.left = this.joystickX < -deadzone
    this.right = this.joystickX > deadzone
    this.up = this.joystickY < -deadzone
    this.down = this.joystickY > deadzone
  }
}
