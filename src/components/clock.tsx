import { useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

const ClockBody = ({ fps = 25 }: { fps?: number }) => {
  const [timecode, setTimecode] = useState('')

  useEffect(() => {
    const updateTimecode = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      const frames = Math.floor((now.getMilliseconds() * fps) / 1000).toString().padStart(2, '0')
      setTimecode(`${hours}:${minutes}:${seconds}:${frames}`)
    }

    const intervalId = setInterval(updateTimecode, 1000 / fps)
    return () => clearInterval(intervalId)
  }, [fps])

  return <div className="nxtv-clock">{timecode}</div>
}

const Clock = ({ visible }: { visible: boolean }) => {
  // nodeRef, not CSSTransition's default findDOMNode: React 19 removed
  // findDOMNode entirely.
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <CSSTransition nodeRef={nodeRef} in={visible} timeout={510} classNames="fade" unmountOnExit>
      <div ref={nodeRef} className="nxtv-clock-transition">
        <ClockBody />
      </div>
    </CSSTransition>
  )
}

export default Clock
