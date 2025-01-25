import { Wall, WallDef } from './actor/wall'
import { NavArea, NavAreaDef } from './navArea'
import { Stage } from './stage/stage'
import { Waypoint } from './waypoint'

export class Layout {
  stage: Stage
  radii: number[]
  wallDefs: WallDef[]
  waypointDatas: WaypointData[]
  navAreaDefs: NavAreaDef[]
  halfHeight: number
  halfWidth: number

  constructor (stage?: Stage) {
    if (stage == null) throw new Error('Layout: stage is null')
    this.stage = stage
    this.wallDefs = stage.walls.map(wall => this.getWallDef(wall))
    const waypointArray = [...stage.navigation.waypoints.values()]
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
      position: { x: wall.position.x, y: wall.position.y }
    }
  }

  getWaypointData (waypoint: Waypoint): WaypointData {
    const radii = [...waypoint.neighbors.keys()]
    this.stage.log({ k: 'radii', v: radii })
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
    // SOME OF THE PATH DISTANCES SEEM TO BE INFINITE. WHy?
    return {
      position: { x: waypoint.position.x, y: waypoint.position.y },
      id: waypoint.id,
      radius: waypoint.radius,
      category: waypoint.category,
      radii,
      neighbors,
      pathDistances
    }
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
  neighbors: Record<number, number[]>
  pathDistances: Record<number, number[]>
}

export interface LayoutData {
  wallDefs: WallDef[]
  waypointDatas: WaypointData[]
  navAreaDefs: NavAreaDef[]
  halfHeight: number
  halfWidth: number
  radii: number[]
}
