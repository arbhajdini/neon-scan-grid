import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DomainAnalyzer from '@/components/DomainAnalyzer';
import GoogleDorking from '@/components/GoogleDorking';

const Index = () => {
  const [activeTab, setActiveTab] = useState('domain');
  const [isMobile, setIsMobile] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'domain':
        return <DomainAnalyzer />;
      case 'dorking':
        return <GoogleDorking />;
      default:
        return <DomainAnalyzer />;
    }
  };

  return (
    <div className="min-h-screen bg-background matrix-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-primary/20 p-4 sticky top-0 z-30">
          <div className="text-center md:text-left md:ml-0 ml-16">
            <h1 className="text-3xl font-bold cyber-glow animate-cyber-pulse">TOOLS</h1>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
      </div>

      {/* Matrix Rain Effect (Optional) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-primary text-xs animate-matrix-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              {Math.random().toString(36).substring(2, 8)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
