// The graphic's own data shape (matches manifest.ograf.json's schema and
// public/nxtv.html's DEFAULT_CONTEXT-equivalent). Not related to
// OGraf-mandated fields (renderType, renderCharacteristics, etc.) below.
export interface TemplateData {
  showLogo: boolean
  showClock: boolean
  showInfo: boolean
  info: string[]
}

export interface GraphicState extends TemplateData {
  isPlaying: boolean
}

// Loosely typed to what the OGraf spec defines and what this template
// actually reads (`data`) — see GraphicController. Unused fields
// (renderCharacteristics, goto/delta, skipAnimation, ...) are accepted
// but ignored; this graphic has no per-step or scheduling behavior.
export interface LoadParams {
  data?: Partial<TemplateData>
  renderType?: 'realtime' | 'non-realtime'
  renderCharacteristics?: Record<string, unknown>
}

export interface PlayActionParams {
  goto?: number
  delta?: number
  skipAnimation?: boolean
}

export interface StopActionParams {
  skipAnimation?: boolean
}

export interface UpdateActionParams {
  data?: Partial<TemplateData>
  skipAnimation?: boolean
}
