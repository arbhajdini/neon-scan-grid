import { useState, useRef, useEffect } from 'react';
import { Download, Search, AlertCircle, Globe, Server, Mail, FileText } from 'lucide-react';

// Real map component using Leaflet
const GeolocationMap = ({ lat, lng, domain, ip }: { lat: number; lng: number; domain: string; ip: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    // Dynamic import of Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Clear any existing map
      mapRef.current!.innerHTML = '';
      
      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add dark tile layer for cyber aesthetic
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles'
      }).addTo(map);

      // Add marker with custom styling
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div class="font-mono text-sm">
          <strong>Domain:</strong> ${domain}<br>
          <strong>IP:</strong> ${ip}<br>
          <strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
      `).openPopup();

      // Smooth zoom animation
      setTimeout(() => {
        map.flyTo([lat, lng], 12, {
          animate: true,
          duration: 1.5
        });
      }, 500);
    });
  }, [lat, lng, domain, ip]);

  return (
    <div className="h-96 rounded-lg overflow-hidden cyber-border bg-muted">
      <div ref={mapRef} className="w-full h-full" />
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

  const scanDomain = async () => {
    if (!domain.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Fetch real DNS data from Google DNS API
      const dnsPromises = [
        fetch(`https://dns.google/resolve?name=${domain}&type=A`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=AAAA`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=MX`).then(r => r.json()),
        fetch(`https://dns.google/resolve?name=${domain}&type=TXT`).then(r => r.json())
      ];

      const [aResponse, aaaaResponse, mxResponse, txtResponse] = await Promise.all(dnsPromises);
      
      // Parse DNS responses
      const aRecords = aResponse.Answer?.filter((a: any) => a.type === 1).map((a: any) => a.data) || [];
      const aaaaRecords = aaaaResponse.Answer?.filter((a: any) => a.type === 28).map((a: any) => a.data) || [];
      const mxRecords = mxResponse.Answer?.filter((a: any) => a.type === 15).map((a: any) => {
        const [priority, exchange] = a.data.split(' ');
        return { priority: parseInt(priority), exchange: exchange.replace(/\.$/, '') };
      }) || [];
      const txtRecords = txtResponse.Answer?.filter((a: any) => a.type === 16).map((a: any) => a.data.replace(/"/g, '')) || [];

      // Get IP geolocation if we have A records
      let location = null;
      if (aRecords.length > 0) {
        try {
          const geoResponse = await fetch(`https://ipapi.co/${aRecords[0]}/json/`);
          const geoData = await geoResponse.json();
          if (geoData.latitude && geoData.longitude) {
            location = {
              lat: parseFloat(geoData.latitude),
              lng: parseFloat(geoData.longitude),
              city: geoData.city || 'Unknown',
              country: geoData.country_name || 'Unknown',
              ip: aRecords[0]
            };
          }
        } catch (geoErr) {
          console.warn('Geolocation failed:', geoErr);
        }
      }

      const domainResults: DomainData = {
        aRecords,
        aaaaRecords,
        mxRecords,
        txtRecords,
        location
      };

      setDomainData(domainResults);
    } catch (err) {
      setError('Failed to analyze domain. Please check the domain name and try again.');
      console.error('DNS lookup error:', err);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold cyber-glow mb-2">DOMAIN ANALYZER</h1>
        <p className="text-muted-foreground">Advanced DNS and geolocation intelligence</p>
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
          <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-md flex items-center space-x-2 animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Full-width Map Section */}
      {domainData?.location ? (
        <div className="cyber-card animate-fade-in">
          <h3 className="text-xl font-bold mb-4 cyber-glow flex items-center">
            <Globe size={20} className="mr-2" />
            IP Geolocation
          </h3>
          <GeolocationMap
            lat={domainData.location.lat}
            lng={domainData.location.lng}
            domain={domain}
            ip={domainData.location.ip}
          />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">IP Address:</span>
              <div className="font-mono text-primary">{domainData.location.ip}</div>
            </div>
            <div>
              <span className="text-muted-foreground">City:</span>
              <div className="font-medium">{domainData.location.city}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Country:</span>
              <div className="font-medium">{domainData.location.country}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Coordinates:</span>
              <div className="font-mono text-xs">{domainData.location.lat.toFixed(4)}, {domainData.location.lng.toFixed(4)}</div>
            </div>
          </div>
        </div>
      ) : domain && !isLoading && (
        <div className="empty-state">
          <Globe size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p>No geolocation data available</p>
          <p className="text-sm text-muted-foreground">Scan a domain to see its geographic location</p>
        </div>
      )}

      {/* DNS Records Grid - Always visible */}
      <div className="dns-grid">
        {/* A Records */}
        <div className={`cyber-card ${domainData ? 'animate-fade-in' : ''}`}>
          <h3 className="text-lg font-bold mb-4 accent-glow flex items-center">
            <Server size={18} className="mr-2" />
            A Records
          </h3>
          {domainData?.aRecords?.length ? (
            <div className="space-y-2">
              {domainData.aRecords.map((ip, index) => (
                <div key={index} className="font-mono text-sm bg-muted/50 p-3 rounded-md border border-border/50">
                  {ip}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Server size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">No A records found</p>
            </div>
          )}
        </div>

        {/* AAAA Records */}
        <div className={`cyber-card ${domainData ? 'animate-fade-in' : ''}`}>
          <h3 className="text-lg font-bold mb-4 purple-glow flex items-center">
            <Server size={18} className="mr-2" />
            AAAA Records
          </h3>
          {domainData?.aaaaRecords?.length ? (
            <div className="space-y-2">
              {domainData.aaaaRecords.map((ip, index) => (
                <div key={index} className="font-mono text-sm bg-muted/50 p-3 rounded-md border border-border/50 break-all">
                  {ip}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Server size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">No AAAA records found</p>
            </div>
          )}
        </div>

        {/* MX Records */}
        <div className={`cyber-card ${domainData ? 'animate-fade-in' : ''}`}>
          <h3 className="text-lg font-bold mb-4 cyber-glow flex items-center">
            <Mail size={18} className="mr-2" />
            MX Records
          </h3>
          {domainData?.mxRecords?.length ? (
            <div className="space-y-2">
              {domainData.mxRecords.map((mx, index) => (
                <div key={index} className="font-mono text-sm bg-muted/50 p-3 rounded-md border border-border/50">
                  <div className="text-xs text-muted-foreground">Priority: {mx.priority}</div>
                  <div>{mx.exchange}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Mail size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">No MX records found</p>
            </div>
          )}
        </div>

        {/* TXT Records */}
        <div className={`cyber-card ${domainData ? 'animate-fade-in' : ''}`}>
          <h3 className="text-lg font-bold mb-4 accent-glow flex items-center">
            <FileText size={18} className="mr-2" />
            TXT Records
          </h3>
          {domainData?.txtRecords?.length ? (
            <div className="space-y-2">
              {domainData.txtRecords.map((txt, index) => (
                <div key={index} className="font-mono text-xs bg-muted/50 p-3 rounded-md border border-border/50 break-all">
                  {txt}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">No TXT records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Section - Only show when data is available */}
      {domainData && (
        <div className="cyber-card text-center animate-fade-in">
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
      )}
    </div>
  );
};

export default DomainAnalyzer;