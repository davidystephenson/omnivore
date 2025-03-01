import { Wall, WallDef } from './actor/wall'
import { NavArea, NavAreaDef } from './navArea'
import { Stage } from './stage/stage'
import { Waypoint } from './waypoint'

export class Layout {
  stage: Stage
  radii: number[]
  wallDefs: WallDef[]
  waypointMatrix: number[][]
  waypointDatas: WaypointData[]
  navAreaDefs: NavAreaDef[]
  halfHeight: number
  halfWidth: number

  constructor (stage?: Stage) {
    if (stage == null) throw new Error('Layout: stage is null')
    this.stage = stage
    this.wallDefs = stage.walls.map(wall => this.getWallDef(wall))
    const waypointArray = [...stage.navigation.waypoints.values()]
    this.waypointMatrix = this.getWaypointMatrix()
    this.halfWidth = stage.halfWidth
    this.halfHeight = stage.halfHeight
    this.waypointDatas = waypointArray.map(waypoint => this.getWaypointData(waypoint))
    this.navAreaDefs = stage.navigation.navAreas.map(navArea => this.getNavAreaDef(navArea))
    this.radii = stage.navigation.radii
  }

  getLayoutData (): LayoutData {
    return {
      wallDefs: this.wallDefs,
      waypointDatas: this.waypointDatas,
      waypointMatrix: this.waypointMatrix,
      navAreaDefs: this.navAreaDefs,
      halfHeight: this.halfHeight,
      halfWidth: this.halfWidth,
      radii: this.radii
    }
  }

  getWallDef (wall: Wall): WallDef {
    return {
      halfHeight: wall.halfHeight,
      halfWidth: wall.halfWidth,
      outer: wall.outer,
      position: { x: wall.position.x, y: wall.position.y }
    }
  }

  getWaypointData (waypoint: Waypoint): WaypointData {
    // ADD THE nextWaypoints variable for each waypoint
    const radii = [...waypoint.neighbors.keys()]
    const neighbors: Record<number, number[]> = {}
    radii.forEach(radius => {
      const waypointArray = waypoint.neighbors.get(radius)
      if (waypointArray == null) throw new Error(`Missing neighbors for radius ${radius}`)
      neighbors[radius] = waypointArray.map(waypoint => waypoint.id)
    })
    const pathDistances: Record<number, number[]> = {}
    radii.forEach(radius => {
      const distanceArray = waypoint.pathDistances.get(radius)
      if (distanceArray == null) throw new Error(`Missing pathDistances for radius ${radius}`)
      pathDistances[radius] = distanceArray
    })
    return {
      position: { x: waypoint.position.x, y: waypoint.position.y },
      id: waypoint.id,
      radius: waypoint.radius,
      category: waypoint.category,
      distances: waypoint.distances,
      radii,
      neighbors,
      pathDistances
    }
  }

  getWaypointMatrix (): number[][] {
    const is = [...this.stage.navigation.waypointMatrix.keys()]
    const js = [...this.stage.navigation.waypointMatrix[0].keys()]
    const waypointMatrix: number[][] = []
    for (const i of is) {
      waypointMatrix[i] = []
      for (const j of js) {
        const waypoint = this.stage.navigation.waypointMatrix[i][j]
        waypointMatrix[i][j] = waypoint.id
      }
    }
    return waypointMatrix
  }

  getNavAreaDef (navArea: NavArea): NavAreaDef {
    return {
      aabb: {
        upperBound: { x: navArea.aabb.upperBound.x, y: navArea.aabb.upperBound.y },
        lowerBound: { x: navArea.aabb.lowerBound.x, y: navArea.aabb.lowerBound.y }
      }
    }
  }
}

interface WaypointData {
  position: { x: number, y: number }
  id: number
  radius: number
  category: string
  radii: number[]
  distances: number[]
  neighbors: Record<number, number[]>
  pathDistances: Record<number, number[]>
}

export interface LayoutData {
  wallDefs: WallDef[]
  waypointDatas: WaypointData[]
  waypointMatrix: number[][]
  navAreaDefs: NavAreaDef[]
  halfHeight: number
  halfWidth: number
  radii: number[]
}
