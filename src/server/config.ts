import fs from 'fs-extra'
import path from 'path'

export class Config {
  extinct?: boolean
  cooperative?: false
  port = 3001
  secure = false

  constructor () {
    const dirname = path.dirname(__filename)
    const configPath = path.join(dirname, '../../config.json')
    const fileExists: boolean = fs.existsSync(configPath)
    if (fileExists) {
      const json = fs.readJSONSync(configPath)
      if (typeof json.port === 'number') this.port = json.port
      if (typeof json.secure === 'boolean') this.secure = json.secure
      if (typeof json.extinct === 'boolean') this.extinct = json.extinct
      if (typeof json.cooperative === 'boolean') this.cooperative = json.cooperative
    }
    console.info('port:', this.port)
    console.info('secure:', this.secure)
  }
}
