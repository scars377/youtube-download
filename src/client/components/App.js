import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import { ipcRenderer } from 'electron';

import GlobalStyle from './GlobalStyle';
import { Menu, MenuItem } from './Menu';
import List from './List';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

class App extends Component {
  list = createRef();

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e) => {
    switch (e.keyCode) {
      case 69: // E
        return this.loadClipboard();
      case 82: // R
        return window.location.reload();
      default:
    }
  };

  loadClipboard = async () => {
    const text = await navigator.clipboard.readText();
    const lines = text
      .split(/[\r\n]+/)
      .map(s => s.trim())
      .filter(s => s);
    this.list.current.addURLs(lines);
  };

  openVideos = () => {
    ipcRenderer.send('openVideos');
  };

  clearCompleted = () => {
    this.list.current.clearCompleted();
  };

  render() {
    return (
      <Wrapper>
        <GlobalStyle />
        <Menu>
          <MenuItem onClick={this.loadClipboard}>Load Clipboard</MenuItem>
          <MenuItem onClick={this.openVideos}>Open Videos</MenuItem>
          <MenuItem onClick={this.clearCompleted}>Clear Completed</MenuItem>
        </Menu>
        <List ref={this.list} />
      </Wrapper>
    );
  }
}

export default hot(module)(App);
