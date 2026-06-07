import { useEffect, useMemo, useState } from 'react'

export function useMarkdownScrollSpy(
  markdownContainer: HTMLElement | null,
  selectedHeadingIds: string[],
  options: IntersectionObserverInit = {},
) {
  const ids = selectedHeadingIds
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')
  const intersectionObserverInit = useMemo(() => options, [])

  useEffect(() => {
    if (!markdownContainer || ids.length === 0)
      return

    const elements = ids
      .map(id => markdownContainer.querySelector(`#${CSS.escape(id)}`))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0)
      return
    const elToId = new Map(elements.map(el => [el, el.id]))

    let raf = 0
    const observer = new IntersectionObserver(
      (entries) => {
        // Batch updates so multiple intersections in one frame don't cause flicker
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          let $activeId: string | undefined

          const visible = entries
            .filter(e => e.isIntersecting)
            .map(e => e.target as HTMLElement)

          if (visible.length) {
            // Choose the heading closest to the top of the viewport
            visible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
            $activeId = elToId.get(visible[0])
          }

          if ($activeId) {
            setActiveId($activeId)
          }
        })
      },
      intersectionObserverInit,
    )

    elements.forEach(el => observer.observe(el))

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [ids, markdownContainer, intersectionObserverInit])

  return activeId
}
