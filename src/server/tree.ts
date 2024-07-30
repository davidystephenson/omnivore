export class Tree {
  angle: number
  radius: number
  branches: Tree[]

  constructor (props: {
    angle?: number
    radius: number
    branches?: Tree[]
  }) {
    this.angle = props.angle ?? 0
    this.radius = props.radius
    this.branches = props.branches ?? []
  }
}
