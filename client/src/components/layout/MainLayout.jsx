import { useUI } from '../../hooks';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <div className="min-h-screen bg-dark-base text-slate-100">
      <Header />
      <Sidebar />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      <main
        className={`pt-16 transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
