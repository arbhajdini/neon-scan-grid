import { useState } from 'react';
import Navbar from '@/components/Navbar';
import DomainAnalyzer from '@/components/DomainAnalyzer';
import GoogleDorking from '@/components/GoogleDorking';

const Index = () => {
  const [activeTab, setActiveTab] = useState('domain');

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
    <div className="min-h-screen professional-bg">
      {/* Horizontal Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
