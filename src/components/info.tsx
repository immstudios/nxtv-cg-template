import { useRef, type CSSProperties } from 'react'
import { CSSTransition } from 'react-transition-group'

const FADE_DURATION = 300
const FADE_OFFSET = 200

interface InfoProps {
  visible: boolean
  lines: string[]
}

const Info = ({ visible, lines }: InfoProps) => {
  // nodeRef, not CSSTransition's default findDOMNode: React 19 removed
  // findDOMNode entirely.
  const nodeRef = useRef<HTMLUListElement>(null)
  const content = lines || []
  const timeout = content.length * FADE_DURATION

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={visible}
      timeout={timeout}
      classNames="fade"
      unmountOnExit
    >
      <ul ref={nodeRef} className="nxtv-info">
        {content.map((line, i) => (
          <li
            key={i}
            style={{
              '--delay': visible
                ? `${i * FADE_OFFSET}ms`
                : `${(content.length - i - 1) * FADE_OFFSET}ms`,
            } as CSSProperties}
          >
            {line}
          </li>
        ))}
      </ul>
    </CSSTransition>
  )
}

export default Info
