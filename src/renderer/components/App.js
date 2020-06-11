import React from 'react';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';

import GlobalStyle from './GlobalStyle';
import { Menu, MenuItem } from './Menu';
import List from './List';
import VideoItem from './VideoItem';
import TypeSelect from './TypeSelect';

import useLists from '../hooks/useLists';
import useType from '../hooks/useType';
import useIPC from '../hooks/useIPC';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

const App = () => {
  const lists = useLists();
  const { type, setType, types } = useType();
  const { loadClipboard, openVideos, clearCompleted } = useIPC(type);

  let list = [];
  Object.keys(lists).forEach(t => {
    const items = lists[t];
    list = list.concat(items.map(item => ({ ...item, type: t })));
  });

  return (
    <Wrapper>
      <GlobalStyle />
      <Menu>
        <TypeSelect type={type} setType={setType} types={types} />
        <MenuItem onClick={loadClipboard}>Load Clipboard</MenuItem>
        <MenuItem onClick={openVideos}>Open Videos</MenuItem>
        <MenuItem onClick={clearCompleted}>Clear Completed</MenuItem>
      </Menu>
      <List>
        {list.map(item => (
          <VideoItem item={item} key={`${item.type}-${item.id}`} />
        ))}
      </List>
    </Wrapper>
  );
};

export default hot(module)(App);
