import { Monitor, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  const navItems = [
    {
      id: 'domain',
      label: 'TOOLS',
      icon: Monitor,
      description: 'Domain Analyzer'
    },
    {
      id: 'dorking',
      label: 'Google Dorking',
      icon: Search,
      description: 'Advanced Search Operators'
    }
  ];

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold cyber-glow animate-professional-pulse">
              CYBER SOC
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`navbar-item flex items-center space-x-2 ${
                    activeTab === item.id ? 'active' : ''
                  }`}
                >
                  <Icon size={18} />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;