import React from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import useIPC from '../hooks/useIPC';
import useLists from '../hooks/useLists';
import useType from '../hooks/useType';
import GlobalStyle from './GlobalStyle';
import List from './List';
import { Menu, MenuItem } from './Menu';
import TypeSelect from './TypeSelect';
import VideoItem from './VideoItem';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

const App = () => {
  const lists = useLists();
  const { type, setType, types } = useType();
  const { loadClipboard, openVideos, clearCompleted } = useIPC(type);

  let list = [];
  Object.keys(lists).forEach((t) => {
    const items = lists[t];
    list = list.concat(items.map((item) => ({ ...item, type: t })));
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
        {list.map((item) => (
          <VideoItem item={item} key={`${item.type}-${item.id}`} />
        ))}
      </List>
    </Wrapper>
  );
};

export default hot(module)(App);
