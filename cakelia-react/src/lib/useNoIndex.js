import { useEffect } from 'react'

/**
 * Adds <meta name="robots" content="noindex,nofollow"> while the component
 * is mounted and removes it on unmount. Use in auth and app pages that must
 * not appear in search results.
 */
export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    if (created) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    const prev = meta.content
    meta.content = 'noindex,nofollow'
    return () => {
      if (created) meta.remove()
      else meta.content = prev
    }
  }, [])
}
