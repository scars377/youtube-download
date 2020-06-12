import { useCallback, useEffect } from 'react';

export default function useIPC(type) {
  const openVideos = useCallback(() => ipcRenderer.send('open-videos'), []);

  const loadClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    ipcRenderer.send('paste-clipboard', [text, type]);
  }, [type]);

  const clearCompleted = useCallback(
    () => ipcRenderer.send('clear-completed'),
    [],
  );

  const onKeyDown = useCallback(
    (e) => {
      switch (e.keyCode) {
        case 69: // E
          return loadClipboard();
        case 82: // R
          return window.location.reload();
        default:
          return null;
      }
    },
    [loadClipboard],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return {
    loadClipboard,
    openVideos,
    clearCompleted,
  };
}
