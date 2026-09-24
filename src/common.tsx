import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { GraphicController } from './controller'
import { TemplateContext } from './templateContext'

// Must match [data-nxtv] main's fixed size in common.css.
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

interface TemplateWrapperProps {
  controller: GraphicController
  children: ReactNode
}

const TemplateWrapper = ({ controller, children }: TemplateWrapperProps) => {
  const [context, setContext] = useState(controller.state)
  const [scale, setScale] = useState(1)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const unsubscribe = controller.subscribe(setContext)
    return () => { unsubscribe() }
  }, [controller])

  // Fits the fixed 1920x1080 design canvas (main, below) into whatever
  // box the host actually provides — a host isn't guaranteed to render
  // at exactly 1920x1080.
  useEffect(() => {
    const container = mainRef.current?.parentElement
    if (!container || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT))
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <TemplateContext.Provider value={context}>
      <main ref={mainRef} style={{ transform: `scale(${scale})` }}>
        {children}
      </main>
    </TemplateContext.Provider>
  )
}

export { TemplateWrapper }
