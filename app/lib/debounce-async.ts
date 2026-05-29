/**
 * Create a debounced async function.
 *
 * @remarks
 * - Only the latest invocation within the debounce window runs.
 * - Earlier pending calls are rejected so your UI can ignore them safely.
 *
 * @example
 * const searchDebounced = debounceAsync(searchFn, 300);
 * await searchDebounced("octocat", "react");
 */
export function debounceAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  waitMs = 300,
): (...args: TArgs) => Promise<TResult> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastReject: ((reason?: unknown) => void) | null = null

  return (...args: TArgs) =>
    new Promise<TResult>((resolve, reject) => {
      if (timer)
        clearTimeout(timer)

      // reject any previous pending promise so UI can ignore it
      if (lastReject)
        lastReject(new Error('Debounced: superseded by a newer call'))

      lastReject = reject

      timer = setTimeout(async () => {
        timer = null
        lastReject = null

        try {
          const res = await fn(...args)
          resolve(res)
        }
        catch (err) {
          reject(err)
        }
      }, waitMs)
    })
}
