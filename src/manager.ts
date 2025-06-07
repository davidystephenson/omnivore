import fs from 'fs'
import path from 'path'
import json from 'big-json'

/**
 * Represents a value that can be serialized to JSON.
 */
export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableObject
  | SerializableArray

export interface SerializableObject {
  [key: string]: SerializableValue
}

export type SerializableArray = SerializableValue[]

/**
 * Custom error class that includes path information for better debugging
 */
export class SerializationError extends Error {
  constructor (message: string, public path: string) {
    super(`${message} at path: ${path}`)
    this.name = 'SerializationError'
  }
}

/**
 * Type guard to check if a value is a SerializableObject
 */
export function isSerializableObject (value: unknown): value is SerializableObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Type guard to check if a value is a SerializableArray
 */
export function isSerializableArray (value: unknown): value is SerializableArray {
  return Array.isArray(value)
}

/**
 * Manager class for handling large data serialization and file operations
 */
export class Manager {
  private readonly outputPath: string
  private writeCounter: number = 0
  private readonly logFrequency: number

  /**
   * Creates a new Manager instance
   * @param outputPath Optional path to the output file. Defaults to 'output.json'
   * @param logFrequency How often to log progress (number of writes). Defaults to 10000.
   */
  constructor (outputPath = 'output.json', logFrequency = 100000) {
    this.outputPath = outputPath
    this.logFrequency = logFrequency
  }

  /**
   * Escapes special characters in a string for JSON
   *
   * @param str The string to escape
   * @returns The escaped string
   */
  private escapeJsonString (str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      // eslint-disable-next-line no-control-regex
      .replace(/[\0-\x1F]/g, (char) => {
        const code = char.charCodeAt(0)
        return `\\u${code.toString(16).padStart(4, '0')}`
      })
  }

  /**
   * Track write operations and log progress at specified intervals
   * @param fd File descriptor
   * @param data The string data to write
   */
  private trackWrite (fileDescriptor: number, data: string): void {
    fs.writeSync(fileDescriptor, data)
    this.writeCounter++

    if (this.writeCounter % this.logFrequency === 0) {
      console.info(`${this.writeCounter.toLocaleString()} writes`)
    }
  }

  read (props: {
    onData: (props: { data: unknown }) => void
  }): void {
    const parseStream = json.createParseStream()

    parseStream.on('data', function (data) {
      props.onData({ data })
    })

    const filename = process.argv[3] ?? 'output'
    const path = `promptbooks/${filename}.json`
    console.info(`Reading ${path}...`)
    const readStream = fs.createReadStream(path)

    readStream.on('open', () => {
      console.info('Promptbook opened')
    })

    readStream.on('close', () => {
      console.info('Promptbook closed')
    })

    let index = 0
    readStream.on('data', (chunk) => {
      if (index === 0 || index % 500 === 0) {
        console.info('Prompt', index, 'is', chunk.length, 'long')
      }
      index++
    })

    readStream.on('ready', () => {
      console.info('Promptbook ready')
    })

    readStream.on('end', () => {
      console.info('Promptbook read')
    })

    readStream.on('error', (error) => {
      console.error('Error reading promptbook', error)
    })

    readStream.pipe(parseStream)
  }

  /**
   * Saves a complex object to a file by serializing it in chunks
   * This method writes directly to the file to avoid storing the entire
   * serialized object in memory
   *
   * @param data The object to save, could be any type but will be checked for serializability
   * @param filePath Optional path to the output file. Defaults to the constructor's outputPath
   */
  saveToFile (data: unknown, filePath?: string): void {
    // Reset write counter for this operation
    this.writeCounter = 0

    // First validate that data is a serializable object
    if (!isSerializableObject(data)) {
      throw new SerializationError('Data must be a serializable object', 'root')
    }

    // Validate the object structure before saving
    // Only validate critical errors, not conversion warnings
    this.validateObject(data)

    const targetPath = filePath ?? this.outputPath
    const dirPath = path.dirname(targetPath)

    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    let fileDescriptor: number | null = null

    try {
      // Create or truncate the file
      fileDescriptor = fs.openSync(targetPath, 'w')

      // Start the JSON object
      this.trackWrite(fileDescriptor, '{')

      const keys = Object.keys(data)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        // Add comma if not the first key
        if (i > 0) {
          this.trackWrite(fileDescriptor, ',')
        }

        // Write the key
        this.trackWrite(fileDescriptor, `"${this.escapeJsonString(key)}":`)

        // Process the value with path tracking
        this.writeValue(fileDescriptor, data[key], key)
      }

      // Close the JSON object
      this.trackWrite(fileDescriptor, '}')

      console.info(`Serialization complete: ${this.writeCounter.toLocaleString()} total write operations`)
      console.info(`Successfully saved data to ${targetPath}`)
    } catch (error) {
      if (error instanceof SerializationError) {
        console.error(`Serialization failed: ${error.message}`)
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error saving to file: ${errorMessage}`)
      }
      throw error // Re-throw to allow calling code to handle the error
    } finally {
      // Ensure file is closed even if an error occurs
      if (fileDescriptor !== null) {
        fs.closeSync(fileDescriptor)
      }
    }
  }

  /**
   * Writes an array to the file descriptor
   *
   * @param fd File descriptor
   * @param arr The array to write
   * @param path Current path in the object structure for error reporting
   */
  private writeArray (fd: number, arr: SerializableArray, path: string): void {
    this.trackWrite(fd, '[')

    for (let i = 0; i < arr.length; i++) {
      // Add comma if not the first element
      if (i > 0) {
        this.trackWrite(fd, ',')
      }

      // Write the array element with updated path
      this.writeValue(fd, arr[i], `${path}[${i}]`)
    }

    this.trackWrite(fd, ']')
  }

  /**
   * Writes an object to the file descriptor
   *
   * @param fd File descriptor
   * @param obj The object to write
   * @param path Current path in the object structure for error reporting
   */
  private writeObject (fd: number, obj: SerializableObject, path: string): void {
    this.trackWrite(fd, '{')

    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      // Add comma if not the first key
      if (i > 0) {
        this.trackWrite(fd, ',')
      }

      // Write the key
      this.trackWrite(fd, `"${this.escapeJsonString(key)}":`)

      // Write the value with updated path
      this.writeValue(fd, obj[key], `${path}.${key}`)
    }

    this.trackWrite(fd, '}')
  }

  /**
   * Performs a pre-validation of the object before full serialization
   * and returns a structured report of validation issues
   *
   * @param data The object to validate
   * @param path Current path in the object for error reporting
   * @param options Optional configuration for validation
   * @returns ValidationReport containing any issues found during validation
   */
  validateObject (
    data: unknown,
    path = 'root',
    options: ValidationOptions = { sampleSize: 1000, collectIssues: false }
  ): ValidationReport {
    const report: ValidationReport = { issues: [], valid: true }

    // Helper to add issues to the report
    const addIssue = (type: string, message: string): void => {
      if (options.collectIssues) {
        report.issues.push({ type, path, message })
        report.valid = false
      }
    }

    if (data === undefined) {
      // Will be converted to null
      addIssue('undefined', 'Undefined value will be converted to null')
    } else if (data === null) {
      // Null values are valid in JSON
    } else if (typeof data === 'string' || typeof data === 'boolean') {
      // String and boolean values are valid in JSON
    } else if (typeof data === 'number') {
      if (isNaN(data)) {
        addIssue('nan', 'NaN value will be converted to null')
      } else if (!isFinite(data)) {
        addIssue('infinity', 'Infinity value will be converted to null')
      }
    } else if (Array.isArray(data)) {
      // Validate a sample of array elements to prevent excessive memory usage
      const { sampleSize } = options
      const step = Math.max(1, Math.floor(data.length / sampleSize))

      for (let i = 0; i < data.length; i += step) {
        const elemReport = this.validateObject(
          data[i],
          `${path}[${i}]`,
          options
        )

        // Merge reports
        if (options.collectIssues && !elemReport.valid) {
          report.issues.push(...elemReport.issues)
          report.valid = false
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // Validate a sample of object properties to prevent excessive memory usage
      const keys = Object.keys(data)
      const { sampleSize } = options
      const step = Math.max(1, Math.floor(keys.length / sampleSize))

      for (let i = 0; i < keys.length; i += step) {
        const key = keys[i]
        const obj = data as Record<string, unknown>

        const propReport = this.validateObject(
          obj[key],
          `${path}.${key}`,
          options
        )

        // Merge reports
        if (options.collectIssues && !propReport.valid) {
          report.issues.push(...propReport.issues)
          report.valid = false
        }
      }
    } else {
      // Truly invalid types that cannot be converted
      addIssue('invalid_type', `Cannot serialize value of type ${typeof data}`)

      // Throw an error immediately for types that cannot be converted
      throw new SerializationError(`Cannot serialize value of type ${typeof data}`, path)
    }

    return report
  }

  /**
   * Writes a value to the file descriptor based on its type
   *
   * @param fd File descriptor
   * @param value The value to write
   * @param path Current path in the object structure for error reporting
   */
  private writeValue (fd: number, value: SerializableValue, path: string): void {
    if (value === undefined) {
      // Convert undefined to null
      this.trackWrite(fd, 'null')
    } else if (value === null) {
      this.trackWrite(fd, 'null')
    } else if (typeof value === 'string') {
      this.trackWrite(fd, `"${this.escapeJsonString(value)}"`)
    } else if (typeof value === 'number') {
      // Handle NaN and Infinity by converting to null
      if (isNaN(value) || !isFinite(value)) {
        this.trackWrite(fd, 'null')
      } else {
        this.trackWrite(fd, value.toString())
      }
    } else if (typeof value === 'boolean') {
      this.trackWrite(fd, value.toString())
    } else if (Array.isArray(value)) {
      this.writeArray(fd, value, path)
    } else if (typeof value === 'object') {
      this.writeObject(fd, value, path)
    } else {
      // Handle unexpected types - this should not happen with proper validation
      throw new SerializationError(`Cannot serialize value of type ${typeof value}`, path)
    }
  }
}

/**
 * Options for validation
 */
export interface ValidationOptions {
  /** Number of items to sample for arrays and objects */
  sampleSize: number
  /** Whether to collect issues in a report */
  collectIssues: boolean
}

/**
 * Report of validation issues
 */
export interface ValidationReport {
  /** Whether the validation passed without issues */
  valid: boolean
  /** List of validation issues */
  issues: ValidationIssue[]
}

/**
 * A validation issue found during validation
 */
export interface ValidationIssue {
  /** Type of issue */
  type: string
  /** Path to the problematic value */
  path: string
  /** Description of the issue */
  message: string
}
