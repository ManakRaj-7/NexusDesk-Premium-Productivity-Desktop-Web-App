export const initKeyboardShortcuts = (handlers) => {
  const handleKeyDown = (e) => {
    // Ctrl+K or Cmd+K for command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      handlers.onCommandPalette?.();
    }

    // Ctrl+\ for sidebar toggle
    if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
      e.preventDefault();
      handlers.onToggleSidebar?.();
    }

    // Ctrl+Shift+L for theme toggle
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'l') {
      e.preventDefault();
      handlers.onToggleTheme?.();
    }

    // Ctrl+Shift+N for new note
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'n') {
      e.preventDefault();
      handlers.onNewNote?.();
    }

    // Ctrl+Shift+T for new task
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 't') {
      e.preventDefault();
      handlers.onNewTask?.();
    }

    // Escape for closing dialogs
    if (e.key === 'Escape') {
      handlers.onEscape?.();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};
