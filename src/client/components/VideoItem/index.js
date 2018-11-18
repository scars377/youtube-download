import React from 'react';
import PropTypes from 'prop-types';

import {
  Wrapper,
  VideoId,
  Thumbnail,
  Info,
  Duration,
  VideoLink,
} from './components';

const VideoItem = ({ item }) => {
  const {
    id,
    title = '',
    thumbnail = '',
    lengthSeconds = '',
    status = '',
    // webmPath = '',
    // mp3Path = '',
    // webmSizeTotal = 0,
    // webmSize = 0,
    // mp3Size = 0,
    progress = 0,
  } = item;
  return (
    <Wrapper>
      <Thumbnail src={thumbnail} key={thumbnail} />
      <Info>
        <VideoId>{id}</VideoId>
        <br />
        <VideoLink videoId={id}>{title}</VideoLink>
        <br />
        <Duration time={lengthSeconds} />
        <span>{`${status}: ${progress}%`}</span>
      </Info>
    </Wrapper>
  );
};

VideoItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    thumbnail: PropTypes.string,
    lengthSeconds: PropTypes.number,
    webmSizeTotal: PropTypes.number,
    status: PropTypes.string,
    // webmPath: PropTypes.string,
    // mp3Path: PropTypes.string,
    // webmSize: PropTypes.number,
    // mp3Size: PropTypes.number,
    progress: PropTypes.number,
  }),
};

export default VideoItem;
