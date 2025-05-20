import { Actor } from './actor'

export class Debris extends Actor {
  getArea (): number {
    throw new Error('getArea is not implemented')
  }
}
