import {
  createParser,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  parseAsTimestamp,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive
import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from "@/lib/delimiters";
import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";

export const parseAsSort = createParser({
  parse(queryValue) {
    const [id, desc] = queryValue.split(".");
    if (!id && !desc) return null;
    return { id, desc: desc === "desc" };
  },
  serialize(value) {
    return `${value.id}.${value.desc ? "desc" : "asc"}`;
  },
});

export const searchParamsParser = {
  // FILTERS
  url: parseAsString,
  p95: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
  public: parseAsArrayOf(parseAsBoolean, ARRAY_DELIMITER),
  active: parseAsArrayOf(parseAsBoolean, ARRAY_DELIMITER),
  regions: parseAsArrayOf(parseAsStringLiteral(REGIONS), ARRAY_DELIMITER),
  tags: parseAsArrayOf(parseAsStringLiteral(TAGS), ARRAY_DELIMITER),
  date: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParser);
