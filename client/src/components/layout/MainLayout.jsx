import { useUI } from '../../hooks';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }) => {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-dark-base text-slate-100">
      <Header />
      <Sidebar />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
