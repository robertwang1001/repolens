type CompactDisplay = 'short' | 'long'

export interface FormatCompactNumberOptions {
  locale?: string | string[]
  compactDisplay?: CompactDisplay
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

const compactNumberFormatterCache = new Map<string, Intl.NumberFormat>()

/**
 * Returns a memoized Intl.NumberFormat instance for compact number formatting.
 */
function getCompactNumberFormatter(options: Required<FormatCompactNumberOptions>): Intl.NumberFormat {
  const { locale, compactDisplay, maximumFractionDigits, minimumFractionDigits } = options

  const localeKey = Array.isArray(locale) ? locale.join(',') : locale

  const cacheKey = JSON.stringify({
    locale: localeKey,
    compactDisplay,
    maximumFractionDigits,
    minimumFractionDigits,
  })

  const cached = compactNumberFormatterCache.get(cacheKey)
  if (cached)
    return cached

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay,
    maximumFractionDigits,
    minimumFractionDigits,
  })

  compactNumberFormatterCache.set(cacheKey, formatter)
  return formatter
}

/**
 * Formats a number using Intl.NumberFormat compact notation (e.g., "950", "1.2K", "2.5M").
 * Uses memoized Intl.NumberFormat instances for better performance in hot paths (tables/charts).
 *
 * @example
 * formatCompactNumber(950) // "950"
 * formatCompactNumber(1200) // "1.2K"
 * formatCompactNumber(2500000) // "2.5M"
 * formatCompactNumber(15000, { maximumFractionDigits: 0 }) // "15K"
 *
 * @param value - The number to format.
 * @param options - Formatting options (locale, compactDisplay, fraction digits).
 * @param options.locale - Locale(s) for formatting (default: "en").
 * @param options.compactDisplay - "short" => "1.2K", "long" => "1.2 thousand" (default: "short").
 * @param options.maximumFractionDigits - Maximum number of digits after the decimal point (default: 1).
 * @param options.minimumFractionDigits - Minimum number of digits after the decimal point (default: 0).
 * @returns The formatted, human-readable compact string. If `value` is not finite, returns `String(value)`.
 */
export function formatCompactNumber(
  value: number,
  options: FormatCompactNumberOptions = {},
): string {
  if (!Number.isFinite(value))
    return String(value)

  const normalized: Required<FormatCompactNumberOptions> = {
    locale: options.locale ?? 'en',
    compactDisplay: options.compactDisplay ?? 'short',
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }

  return getCompactNumberFormatter(normalized).format(value)
}
