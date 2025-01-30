import { customAlphabet } from "nanoid";

const prefixes = {
  task: "tsk",
};

interface GenerateIdOptions {
  /**
   * The length of the generated ID.
   * @default 12
   * @example 12 => "abc123def456"
   * */
  length?: number;
  /**
   * The separator to use between the prefix and the generated ID.
   * @default "_"
   * @example "_" => "str_abc123"
   * */
  separator?: string;
}

/**
 * Generates a unique ID with optional prefix and configuration.
 * @param prefixOrOptions The prefix string or options object
 * @param inputOptions The options for generating the ID
 */
export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {},
) {
  const finalOptions =
    typeof prefixOrOptions === "object" ? prefixOrOptions : inputOptions;

  const prefix =
    typeof prefixOrOptions === "object" ? undefined : prefixOrOptions;

  const { length = 12, separator = "_" } = finalOptions;
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length,
  )();

  return prefix ? `${prefixes[prefix]}${separator}${id}` : id;
}
