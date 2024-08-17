export class Gene {
  angle: number
  radius: number
  branches: Gene[]

  constructor (props: {
    angle?: number
    radius: number
    branches?: Gene[]
  }) {
    this.angle = props.angle ?? 0
    this.radius = props.radius
    this.branches = props.branches ?? []
  }
}
