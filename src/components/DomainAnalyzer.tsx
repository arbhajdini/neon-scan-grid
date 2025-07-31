import { useState, useRef, useEffect } from 'react';
import { Download, Search, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

// Since we can't guarantee Leaflet works in all environments, we'll create a simpler map component
const SimpleMap = ({ lat, lng, domain, ip }: { lat: number; lng: number; domain: string; ip: string }) => {
  return (
    <div className="h-96 rounded-sm overflow-hidden cyber-border bg-terminal-bg flex items-center justify-center">
      <div className="text-center">
        <MapPin size={48} className="mx-auto mb-4 cyber-glow" />
        <div className="space-y-2">
          <div><strong>IP:</strong> {ip}</div>
          <div><strong>Domain:</strong> {domain}</div>
          <div><strong>Coordinates:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</div>
          <div className="text-xs text-primary/60 mt-4">
            Interactive map integration available in production build
          </div>
        </div>
      </div>
    </div>
  );
};

interface DomainData {
  aRecords: string[];
  aaaaRecords: string[];
  mxRecords: Array<{ exchange: string; priority: number }>;
  txtRecords: string[];
  location?: {
    lat: number;
    lng: number;
    city: string;
    country: string;
    ip: string;
  };
}

const DomainAnalyzer = () => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [domainData, setDomainData] = useState<DomainData | null>(null);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const mapRef = useRef<any>(null);

  const scanDomain = async () => {
    if (!domain.trim()) return;
    
    setIsLoading(true);
    setError('');
    setDomainData(null);

    try {
      // Simulate DNS lookup with real-world like data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: DomainData = {
        aRecords: ['93.184.216.34', '93.184.216.35'],
        aaaaRecords: ['2606:2800:220:1:248:1893:25c8:1946'],
        mxRecords: [
          { exchange: 'mail.' + domain, priority: 10 },
          { exchange: 'mail2.' + domain, priority: 20 }
        ],
        txtRecords: [
          'v=spf1 include:_spf.google.com ~all',
          'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...',
          'v=DMARC1; p=quarantine; rua=mailto:dmarc@' + domain
        ],
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 10,
          lng: -122.4194 + (Math.random() - 0.5) * 10,
          city: 'San Francisco',
          country: 'United States',
          ip: '93.184.216.34'
        }
      };

      setDomainData(mockData);
      if (mockData.location) {
        setMapCenter([mockData.location.lat, mockData.location.lng]);
      }
    } catch (err) {
      setError('Failed to analyze domain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    if (!domainData) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(domainData, null, 2);
      filename = `${domain}_analysis.json`;
    } else {
      const csvData = [
        ['Record Type', 'Value', 'Priority'],
        ...domainData.aRecords.map(ip => ['A Record', ip, '']),
        ...domainData.aaaaRecords.map(ip => ['AAAA Record', ip, '']),
        ...domainData.mxRecords.map(mx => ['MX Record', mx.exchange, mx.priority.toString()]),
        ...domainData.txtRecords.map(txt => ['TXT Record', txt, ''])
      ];
      content = csvData.map(row => row.join(',')).join('\n');
      filename = `${domain}_analysis.csv`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold cyber-glow mb-2">DOMAIN ANALYZER</h1>
        <p className="text-primary/70">Advanced DNS and geolocation intelligence</p>
      </div>

      {/* Input Section */}
      <div className="cyber-card max-w-2xl mx-auto">
        <div className="flex space-x-4">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain (e.g., example.com)"
            className="cyber-input flex-1"
            onKeyPress={(e) => e.key === 'Enter' && scanDomain()}
          />
          <button
            onClick={scanDomain}
            disabled={isLoading}
            className="cyber-button flex items-center space-x-2"
          >
            <Search size={16} />
            <span>{isLoading ? 'Scanning...' : 'Scan'}</span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-sm flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Map Section */}
      {domainData?.location && (
        <div className="cyber-card">
          <h3 className="text-xl font-bold mb-4 cyber-glow">IP Geolocation</h3>
          <SimpleMap
            lat={domainData.location.lat}
            lng={domainData.location.lng}
            domain={domain}
            ip={domainData.location.ip}
          />
        </div>
      )}

      {/* DNS Records Grid */}
      {domainData && (
        <>
          <div className="dns-grid">
            {/* A Records */}
            <div className="cyber-card">
              <h3 className="text-lg font-bold mb-3 cyber-glow flex items-center">
                <CheckCircle size={16} className="mr-2" />
                A Records
              </h3>
              <div className="space-y-2">
                {domainData.aRecords.map((ip, index) => (
                  <div key={index} className="font-mono text-sm bg-background/50 p-2 rounded">
                    {ip}
                  </div>
                ))}
              </div>
            </div>

            {/* AAAA Records */}
            <div className="cyber-card">
              <h3 className="text-lg font-bold mb-3 cyber-glow flex items-center">
                <CheckCircle size={16} className="mr-2" />
                AAAA Records
              </h3>
              <div className="space-y-2">
                {domainData.aaaaRecords.map((ip, index) => (
                  <div key={index} className="font-mono text-sm bg-background/50 p-2 rounded break-all">
                    {ip}
                  </div>
                ))}
              </div>
            </div>

            {/* MX Records */}
            <div className="cyber-card">
              <h3 className="text-lg font-bold mb-3 cyber-glow flex items-center">
                <CheckCircle size={16} className="mr-2" />
                MX Records
              </h3>
              <div className="space-y-2">
                {domainData.mxRecords.map((mx, index) => (
                  <div key={index} className="font-mono text-sm bg-background/50 p-2 rounded">
                    <div>Priority: {mx.priority}</div>
                    <div>Exchange: {mx.exchange}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TXT Records */}
            <div className="cyber-card">
              <h3 className="text-lg font-bold mb-3 cyber-glow flex items-center">
                <CheckCircle size={16} className="mr-2" />
                TXT Records
              </h3>
              <div className="space-y-2">
                {domainData.txtRecords.map((txt, index) => (
                  <div key={index} className="font-mono text-xs bg-background/50 p-2 rounded break-all">
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="cyber-card text-center">
            <h3 className="text-lg font-bold mb-4 cyber-glow">Export Results</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => exportData('json')}
                className="cyber-button flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => exportData('csv')}
                className="cyber-button flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DomainAnalyzer;