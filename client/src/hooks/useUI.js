import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, toggleTheme, toggleCommandPalette, setActiveSection } from '../store/slices/uiSlice';

export const useUI = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, theme, commandPaletteOpen, activeSection } = useSelector(
    (state) => state.ui
  );

  return {
    sidebarOpen,
    theme,
    commandPaletteOpen,
    activeSection,
    toggleSidebar: () => dispatch(toggleSidebar()),
    toggleTheme: () => dispatch(toggleTheme()),
    toggleCommandPalette: () => dispatch(toggleCommandPalette()),
    setActiveSection: (section) => dispatch(setActiveSection(section)),
  };
};
