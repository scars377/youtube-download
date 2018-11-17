import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';

import {
  Wrapper,
  VideoId,
  Thumbnail,
  Info,
  Duration,
  VideoLink,
} from './components';

class VideoItem extends Component {
  state = {
    progress: 0,

    title: '',
    videoId: '',
    thumbnail: '',
    lengthSeconds: 0,
  };

  componentDidMount() {
    this.getVideoId();
  }

  getVideoId = () => {
    const { url } = this.props;
    ipcRenderer.once(`getVideoId ${url}`, this.videIdGet);
    ipcRenderer.send('getVideoId', url);
  };

  videIdGet = (event, videoId) => {
    if (!videoId) {
      this.invalidate();
      return;
    }
    const { url, updateURL } = this.props;
    if (url !== videoId) {
      updateURL(url, videoId);
    } else {
      this.getInfo();
    }
  };

  getInfo = () => {
    const { url } = this.props;
    ipcRenderer.once(`getInfo ${url}`, this.infoGet);
    ipcRenderer.send('getInfo', url);
  };

  invalidate = () => {
    const { url, removeURL } = this.props;
    setTimeout(removeURL, 500, url);
  };

  infoGet = (event, info) => {
    if (!info) {
      this.invalidate();
      return;
    }
    const {
      title,
      videoId,
      thumbnail: {
        thumbnails: [{ url: thumbnail }],
      },
      lengthSeconds,
    } = info.player_response.videoDetails;
    this.setState({
      title,
      videoId,
      thumbnail,
      lengthSeconds,
    });
    this.download();
  };

  download = () => {
    const { url } = this.props;
    ipcRenderer.on(`download ${url}`, this.progress);
    ipcRenderer.send('download', url);
  };

  progress = (event, progress) => {
    this.setState({
      progress,
    });
    if (progress === 1) {
      ipcRenderer.removeListener(
        `download ${this.state.videoId}`,
        this.progress,
      );
    }
  };

  clearCompleted = () => {
    if (this.state.progress === 1) {
      const { url, removeURL } = this.props;
      removeURL(url);
    }
  };

  render() {
    const { url } = this.props;
    const { progress, thumbnail, videoId, title, lengthSeconds } = this.state;

    return (
      <Wrapper>
        <Thumbnail src={thumbnail} key={thumbnail} />
        <Info>
          <VideoId>{url}</VideoId>
          <br />
          <VideoLink videoId={videoId}>{title}</VideoLink>
          <br />
          <Duration time={lengthSeconds} />
          <span>{`${parseInt(progress * 100, 10)}%`}</span>
        </Info>
      </Wrapper>
    );
  }
}

VideoItem.propTypes = {
  url: PropTypes.string.isRequired,
  removeURL: PropTypes.func.isRequired,
  updateURL: PropTypes.func.isRequired,
};

export default VideoItem;
