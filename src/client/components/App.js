import React, { Component } from 'react';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import { ipcRenderer } from 'electron';

import GlobalStyle from './GlobalStyle';
import { Menu, MenuItem } from './Menu';
import List from './List';
import VideoItem from './VideoItem';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

class App extends Component {
  state = { list: [] };

  componentDidMount() {
    ipcRenderer.on('update-list', this.updateList);
    ipcRenderer.send('update-list');
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  updateList = (event, list) => {
    this.setState({
      list: JSON.parse(list),
    });
  };

  onKeyDown = (e) => {
    switch (e.keyCode) {
      case 69: // E
        return this.loadClipboard();
      case 82: // R
        return window.location.reload();
      default:
        return null;
    }
  };

  loadClipboard = async () => {
    const text = await navigator.clipboard.readText();
    ipcRenderer.send('paste-clipboard', text);
  };

  openVideos = () => {
    ipcRenderer.send('open-videos');
  };

  clearCompleted = () => {
    ipcRenderer.send('clear-completed');
  };

  render() {
    const { list } = this.state;
    return (
      <Wrapper>
        <GlobalStyle />
        <Menu>
          <MenuItem onClick={this.loadClipboard}>Load Clipboard</MenuItem>
          <MenuItem onClick={this.openVideos}>Open Videos</MenuItem>
          <MenuItem onClick={this.clearCompleted}>Clear Completed</MenuItem>
        </Menu>
        <List>
          {list.map((item) => (
            <VideoItem item={item} key={item.id} />
          ))}
        </List>
      </Wrapper>
    );
  }
}

export default hot(module)(App);
