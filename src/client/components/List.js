import React, { Component } from 'react';
import styled from 'styled-components';

import VideoItem from './VideoItem';

import local from '../local';

const Wrapper = styled.div`
  flex: 1;
`;

class List extends Component {
  state = {
    urls: local.get('urls'),
  };

  itemRefs = {};

  componentDidUpdate() {
    local.set('urls', this.state.urls);
  }

  addURLs = (urls) => {
    this.setState((state) => ({
      urls: [...new Set([...urls, ...state.urls])],
    }));
  };

  removeURL = (url) => {
    this.setState((state) => ({
      urls: state.urls.filter((u) => u !== url),
    }));
  };

  updateURL = (oldURL, url) => {
    this.setState((state) => ({
      urls: [...new Set(state.urls.map((u) => (u === oldURL ? url : u)))],
    }));
  };

  clearCompleted = () => {
    this.state.urls.forEach((url) => {
      this.itemRefs[url].clearCompleted();
    });
  };

  render() {
    const { urls } = this.state;
    return (
      <Wrapper>
        {urls.map((url) => (
          <VideoItem
            url={url}
            key={url}
            ref={(r) => {
              this.itemRefs[url] = r;
            }}
            removeURL={this.removeURL}
            updateURL={this.updateURL}
          />
        ))}
      </Wrapper>
    );
  }
}

export default List;
