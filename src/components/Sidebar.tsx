import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Globe, Menu } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'domain', label: 'Domain Analyzer', icon: Globe },
    { id: 'dorking', label: 'Google Dorking', icon: Search },
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 cyber-button p-2"
        >
          <Menu size={20} />
        </button>
      )}

      <div className={`sidebar transition-all duration-300 ${
        isMobile 
          ? `${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 z-50` 
          : `${isCollapsed ? 'w-16' : 'w-64'} z-10`
      } h-screen fixed left-0 top-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-primary/20">
            <button
              onClick={toggleSidebar}
              className="cyber-button p-2 w-full flex items-center justify-center"
            >
              {isMobile ? <ChevronLeft size={20} /> : (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`sidebar-item w-full flex items-center space-x-3 ${
                    activeTab === item.id ? 'active' : ''
                  }`}
                >
                  <item.icon size={20} />
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-primary/20">
            <div className={`text-xs text-primary/60 ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
              {isCollapsed && !isMobile ? 'OSINT' : 'OSINT Toolbox v1.0'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;