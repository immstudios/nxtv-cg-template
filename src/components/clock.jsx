import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';

const ClockContainer = styled.div`
  &.fade-enter {
    opacity: 0;
    transform: rotate3d(0, 1, 0, -90deg);
  }

  &.fade-enter-active {
    opacity: 1;
    transform: rotate3d(0, 0, 0, 0);
    transition: all 0.5s ease-in-out;
  }

  &.fade-exit {
    opacity: 1;
    transform: rotate3d(0, 0, 0, 0);
  }

  &.fade-exit-active {
    opacity: 0;
    transform: rotate3d(0, 1, 0, 90deg);
    transition: all 0.5s ease-in-out;
  }
`

const Timestamp = styled.div`
  padding: 10px 16px;
  font-size: 36px;
  font-family: 'Kode Mono';
  color: var(--color-text);
  background-color: var(--color-night-02);
  border-left: 8px solid var(--color-aurora-01);
  text-align: center;
`

const ClockBody = ({ fps = 25 }) => {
  const [timecode, setTimecode] = useState('');

  const updateTimecode = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const frames = Math.floor((now.getMilliseconds() * fps) / 1000).toString().padStart(2, '0');
    setTimecode(`${hours}:${minutes}:${seconds}:${frames}`);
  };

  useEffect(() => {
    const intervalId = setInterval(updateTimecode, 1000 / fps);
    return () => clearInterval(intervalId);
  }, [fps]);

  return <Timestamp>{timecode}</Timestamp>;
}

const Clock = ({ visible }) => {
  return (
      <CSSTransition in={visible} timeout={510} classNames="fade" unmountOnExit>
        <ClockContainer>
          <ClockBody />
        </ClockContainer>
      </CSSTransition>
  )
}

export default Clock
