import { createContext, useContext } from 'react'
import type { GraphicState } from './types'

// In its own file, not common.tsx: Fast Refresh only works reliably in
// files that exclusively export components, and useTemplateContext is a
// hook, not a component.
const TemplateContext = createContext<GraphicState | null>(null)

function useTemplateContext(): GraphicState {
  const context = useContext(TemplateContext)
  if (!context) throw new Error('useTemplateContext must be used within TemplateWrapper')
  return context
}

export { TemplateContext, useTemplateContext }
