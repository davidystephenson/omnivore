import { z, ZodSchema } from 'zod'
import { Flags } from './flags'
import { Performance } from './stage/performance'

export const vec2Schema = z.object({
  x: z.number(),
  y: z.number()
})
export const wallDefSchema = z.object({
  halfHeight: z.number(),
  halfWidth: z.number(),
  outer: z.boolean(),
  position: vec2Schema
})
export type WallDef = z.infer<typeof wallDefSchema>
export const numberishSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      const parsed = Number(val)
      if (isNaN(parsed)) {
        throw new Error(`Invalid number: ${val}`)
      }
      return parsed
    }
    return val
  },
  z.number()
) as z.ZodType<number, z.ZodTypeDef, number>
export type Numberish = z.infer<typeof numberishSchema>
export const testSchema: ZodSchema<Numberish> = numberishSchema
export const testValue: Numberish = 1
export const numberullishSchema = numberishSchema

export const numberRecordSchema = z.record(numberishSchema, numberullishSchema)
  .or(numberullishSchema.array())
export const nestedNumberRecordSchema = z.record(numberishSchema, numberRecordSchema)
export const navAreaDefSchema = z.object({
  aabb: z.object({
    upperBound: vec2Schema,
    lowerBound: vec2Schema
  })
})
export type NavAreaDef = z.infer<typeof navAreaDefSchema>
export const waypointDataSchema = z.object({
  position: vec2Schema,
  id: z.number(),
  radius: z.number(),
  category: z.string(),
  // radii: z.number().array(),
  // distances: z.number().nullable().array(),
  // neighbors: nestedNumberRecordSchema,
  nextWaypoints: nestedNumberRecordSchema
  // pathDistances: nestedNumberRecordSchema
})
export type WaypointData = z.infer<typeof waypointDataSchema>
export const matrixSchema = z.array(z.array(z.number()))
export type Matrix = z.infer<typeof matrixSchema>
export const promptbookSchema = z.object({
  wallDefs: wallDefSchema.array(),
  waypointDatas: waypointDataSchema.array(),
  waypointMatrix: matrixSchema,
  navAreaDefs: navAreaDefSchema.array(),
  halfHeight: z.number(),
  halfWidth: z.number(),
  radii: z.number().array()
})
export type Promptbook = z.infer<typeof promptbookSchema>
// export const testSchema: z.ZodType<Promptbook> = promptbookSchema

export const tableOfContentsSchema = z.object({
  wallDefs: z.unknown().array(),
  waypointDatas: z.unknown().array(),
  waypointMatrix: z.unknown(),
  navAreaDefs: z.unknown().array(),
  halfHeight: z.number(),
  halfWidth: z.number(),
  radii: z.number().array()
})
export const performanceNameSchema = z.literal('public').or(z.literal('private')).or(z.literal('test'))
export type PerformanceName = z.infer<typeof performanceNameSchema>
export type PerformanceConstructor = new (props: { flags: Flags, promptbook: Promptbook }) => Performance
