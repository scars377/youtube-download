import { useState, useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';

export default function useLists() {
  const [lists, setLists] = useState([]);

  const updateList = useCallback(
    (evt, data) => {
      setLists(JSON.parse(data));
    },
    [setLists],
  );

  useEffect(() => {
    ipcRenderer.on('update-lists', updateList);
    return () => {
      ipcRenderer.removeListener('update-lists', updateList);
    };
  }, [updateList]);

  useEffect(() => {
    ipcRenderer.send('update-lists');
  }, []);

  return lists;
}
