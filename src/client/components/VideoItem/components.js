import { shell } from 'electron';
import styled, { keyframes } from 'styled-components';

const show = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Wrapper = styled.div`
  border-bottom: 1px solid #333;
  padding: 0.5em 1em;
  display: flex;
  animation: ${show} 0.3s forwards;
`;

export const VideoId = styled.span`
  font-family: monospace;
  font-size: 12px;
  line-height: 0.8em;
  color: #ccc;
`;

const HEIGHT = 4;
export const Thumbnail = styled.div.attrs({
  style: (props) => ({
    backgroundImage: `url('${props.src}')`,
  }),
})`
  flex: 0 0 ${HEIGHT * 1.78}em;
  height: ${HEIGHT}em;
  background: center center no-repeat;
  background-size: cover;
  animation: ${show} 0.3s forwards;
`;

export const Info = styled.div`
  flex: 1 1;
  padding: 0 1em;
  line-height: 1.33em;
`;

const formatTime = (seconds) => {
  let t = parseInt(seconds, 10);
  const s = t % 60;
  t = parseInt(t / 60, 10);
  const m = t % 60;
  t = parseInt(t / 60, 10);
  const h = t;

  const ss = `${s}`.padStart(2, '0');
  const mm = `${m}`.padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
};

export const Duration = styled.span.attrs({
  children: (props) => formatTime(props.time),
})`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1em 0.4em;
  border-radius: 3px;
  margin-right: 1em;
`;

export const VideoLink = styled.span.attrs({
  onClick: (props) => () =>
    shell.openExternal(`https://www.youtube.com/watch?v=${props.videoId}`),
})`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
