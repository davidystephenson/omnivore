export class Input {
  keyboard = new Map<string, boolean>()

  constructor () {
    window.onkeydown = (event: KeyboardEvent) => this.onkeydown(event)
    window.onkeyup = (event: KeyboardEvent) => this.onkeyup(event)
  }

  onkeydown (event: KeyboardEvent): void {
    this.keyboard.set(event.key, true)
  }

  onkeyup (event: KeyboardEvent): void {
    this.keyboard.set(event.key, false)
  }

  isKeyDown (key: string): boolean {
    return this.keyboard.get(key) ?? false
  }
}
