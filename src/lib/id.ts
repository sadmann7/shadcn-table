import { customAlphabet } from "nanoid"

const prefixes = {
  task: "tsk",
}

interface GenerateIdOptions {
  /**
   * The length of the generated ID.
   * @default 12
   * @example 12 => "abc123def456"
   * */
  length?: number
  /**
   * The separator to use between the prefix and the generated ID.
   * @default "_"
   * @example "_" => "str_abc123"
   * */
  separator?: string
}

/**
 * Generates a unique ID with optional prefix and configuration.
 * @param prefixOrOptions The prefix string or options object
 * @param options The options for generating the ID
 */
export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  options: GenerateIdOptions = {}
) {
  if (typeof prefixOrOptions === "object") {
    options = prefixOrOptions
    prefixOrOptions = undefined
  }

  const { length = 12, separator = "_" } = options
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length
  )()

  return prefixOrOptions ? `${prefixes[prefixOrOptions]}${separator}${id}` : id
}
