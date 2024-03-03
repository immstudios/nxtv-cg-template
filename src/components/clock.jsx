import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Timestamp = styled.div`
  padding: 10px 20px;
  font-size: 42px;
  font-family: 'Kode Mono';
  color: var(--color-text);
  background-color: var(--color-night-02);
  border-left: 8px solid var(--color-aurora-01);
  text-align: left;

  ${ props => props.$show ? `
    opacity: 1;
    transform: rotate3d(0, 0, 0, 0);
    transition: all 0.5s ease-in-out;
  ` : `
    opacity: 0;
    transform: rotate3d(0, 1, 0, -90deg);
    transition: all 0.5s ease-in-out;
  `}
`

const Clock = ({ fps = 25, visible }) => {
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

  return <Timestamp $show={visible}>{timecode}</Timestamp>;
}

export default Clock
