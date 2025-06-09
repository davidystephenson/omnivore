import { z, ZodSchema } from 'zod'

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
  nextWaypoints: nestedNumberRecordSchema
})
export type WaypointData = z.infer<typeof waypointDataSchema>
export const numberMatrixSchema = z.number().array().array()
export type NumberMatrix = z.infer<typeof numberMatrixSchema>
export const indexSchema = z.object({
  halfHeight: z.number(),
  halfWidth: z.number(),
  radii: z.number().array(),
  waypointIdMatrix: numberMatrixSchema
})
export type Index = z.infer<typeof indexSchema>
export const tableOfContentsExtendSchema = z.object({
  navAreaDefs: z.unknown().array(),
  wallDefs: z.unknown().array(),
  waypointDatas: z.unknown().array()
})
export const tableOfContentsSchema = indexSchema.and(tableOfContentsExtendSchema)
export type TableOfContents = z.infer<typeof tableOfContentsSchema>
export const promptbookExtendSchema = z.object({
  navAreaDefs: navAreaDefSchema.array(),
  wallDefs: wallDefSchema.array(),
  waypointDatas: waypointDataSchema.array()
})
export const promptbookSchema = indexSchema.and(promptbookExtendSchema)
export type Promptbook = z.infer<typeof promptbookSchema>
const promptbookTestSchema: z.ZodType<Promptbook> = promptbookSchema
void promptbookTestSchema
