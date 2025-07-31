import { useState, useEffect } from 'react';
import { Search, Copy, ExternalLink, Zap, Settings } from 'lucide-react';

interface DorkTemplate {
  category: string;
  dorks: string[];
}

const GoogleDorking = () => {
  const [manualDork, setManualDork] = useState({
    site: '',
    intitle: '',
    inurl: '',
    filetype: '',
    intext: '',
    exclude: ''
  });
  
  const [livePreview, setLivePreview] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [generatedDorks, setGeneratedDorks] = useState<string[]>([]);

  const dorkCategories: DorkTemplate[] = [
    {
      category: 'Admin Panels',
      dorks: [
        'site:{target} inurl:admin',
        'site:{target} inurl:administrator',
        'site:{target} inurl:login',
        'site:{target} intitle:"admin panel"',
        'site:{target} intitle:"administrator login"',
        'site:{target} inurl:wp-admin',
        'site:{target} inurl:cpanel',
        'site:{target} inurl:phpmyadmin'
      ]
    },
    {
      category: 'Open Directories',
      dorks: [
        'site:{target} intitle:"index of"',
        'site:{target} intitle:"directory listing"',
        'site:{target} intitle:"parent directory"',
        'site:{target} "index of /" inurl:ftp',
        'site:{target} intitle:"Apache/2.4.1" "Index of"',
        'site:{target} intitle:"listing generated"'
      ]
    },
    {
      category: 'Exposed Configs / Secrets',
      dorks: [
        'site:{target} filetype:env',
        'site:{target} filetype:config',
        'site:{target} filetype:ini',
        'site:{target} filetype:log',
        'site:{target} intext:"api_key"',
        'site:{target} intext:"password" filetype:txt',
        'site:{target} filetype:sql',
        'site:{target} intext:"database_password"'
      ]
    },
    {
      category: 'Backup Files',
      dorks: [
        'site:{target} filetype:bak',
        'site:{target} filetype:backup',
        'site:{target} filetype:old',
        'site:{target} filetype:orig',
        'site:{target} inurl:backup',
        'site:{target} intitle:"backup"',
        'site:{target} filetype:zip',
        'site:{target} filetype:tar.gz'
      ]
    },
    {
      category: 'Leaked Credentials',
      dorks: [
        'site:{target} intext:"username" intext:"password"',
        'site:{target} filetype:txt intext:"password"',
        'site:{target} intext:"admin" intext:"password"',
        'site:{target} filetype:log intext:"login"',
        'site:{target} intext:"user" intext:"pass"',
        'site:{target} filetype:csv intext:"password"'
      ]
    },
    {
      category: 'PDF / Books / Research',
      dorks: [
        'site:{target} filetype:pdf',
        'site:{target} filetype:doc',
        'site:{target} filetype:docx',
        'site:{target} filetype:ppt',
        'site:{target} filetype:xls',
        'site:{target} intitle:"research" filetype:pdf',
        'site:{target} intext:"confidential" filetype:pdf'
      ]
    },
    {
      category: 'Logs & Error Pages',
      dorks: [
        'site:{target} filetype:log',
        'site:{target} intitle:"error"',
        'site:{target} intext:"warning"',
        'site:{target} intext:"fatal error"',
        'site:{target} intitle:"404 not found"',
        'site:{target} intext:"stack trace"',
        'site:{target} intext:"mysql error"'
      ]
    }
  ];

  // Update live preview when manual dork changes
  useEffect(() => {
    const parts = [];
    if (manualDork.site) parts.push(`site:${manualDork.site}`);
    if (manualDork.intitle) parts.push(`intitle:"${manualDork.intitle}"`);
    if (manualDork.inurl) parts.push(`inurl:${manualDork.inurl}`);
    if (manualDork.filetype) parts.push(`filetype:${manualDork.filetype}`);
    if (manualDork.intext) parts.push(`intext:"${manualDork.intext}"`);
    if (manualDork.exclude) parts.push(`-${manualDork.exclude}`);
    
    setLivePreview(parts.join(' '));
  }, [manualDork]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const searchOnGoogle = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const generateDorks = () => {
    if (!selectedCategory || !targetInput.trim()) return;
    
    const category = dorkCategories.find(cat => cat.category === selectedCategory);
    if (!category) return;

    const generated = category.dorks.map(dork => 
      dork.replace(/{target}/g, targetInput.trim())
    );
    
    setGeneratedDorks(generated);
  };

  const resetManualDork = () => {
    setManualDork({
      site: '',
      intitle: '',
      inurl: '',
      filetype: '',
      intext: '',
      exclude: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold cyber-glow mb-2">GOOGLE DORKING</h1>
        <p className="text-muted-foreground">Advanced search operators for OSINT reconnaissance</p>
      </div>

      {/* Manual Dork Builder - Top Half */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold cyber-glow flex items-center">
            <Settings className="mr-2" size={24} />
            Manual Dork Builder
          </h2>
          <button
            onClick={resetManualDork}
            className="cyber-button text-sm"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site:</label>
            <input
              type="text"
              value={manualDork.site}
              onChange={(e) => setManualDork({...manualDork, site: e.target.value})}
              placeholder="example.com"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">In Title:</label>
            <input
              type="text"
              value={manualDork.intitle}
              onChange={(e) => setManualDork({...manualDork, intitle: e.target.value})}
              placeholder="admin login"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">In URL:</label>
            <input
              type="text"
              value={manualDork.inurl}
              onChange={(e) => setManualDork({...manualDork, inurl: e.target.value})}
              placeholder="admin"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File Type:</label>
            <input
              type="text"
              value={manualDork.filetype}
              onChange={(e) => setManualDork({...manualDork, filetype: e.target.value})}
              placeholder="pdf"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">In Text:</label>
            <input
              type="text"
              value={manualDork.intext}
              onChange={(e) => setManualDork({...manualDork, intext: e.target.value})}
              placeholder="password"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exclude:</label>
            <input
              type="text"
              value={manualDork.exclude}
              onChange={(e) => setManualDork({...manualDork, exclude: e.target.value})}
              placeholder="site:example.com"
              className="cyber-input"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium mb-2 accent-glow">Live Preview:</label>
          <div className="cyber-input bg-muted font-mono text-sm min-h-[60px] p-4 mb-4">
            {livePreview || 'Your dork will appear here...'}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => copyToClipboard(livePreview)}
              disabled={!livePreview}
              className="cyber-button flex items-center space-x-2 flex-1"
            >
              <Copy size={16} />
              <span>Copy</span>
            </button>
            <button
              onClick={() => searchOnGoogle(livePreview)}
              disabled={!livePreview}
              className="cyber-button flex items-center space-x-2 flex-1"
            >
              <ExternalLink size={16} />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Automatic Dork Generator - Bottom Half */}
      <div className="cyber-card">
        <h2 className="text-2xl font-bold cyber-glow mb-6 flex items-center">
          <Zap className="mr-2" size={24} />
          Automatic Dork Generator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target (Domain or Keyword):</label>
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="example.com or keyword"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dork Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="cyber-input"
            >
              <option value="">Select a category...</option>
              {dorkCategories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generateDorks}
          disabled={!selectedCategory || !targetInput.trim()}
          className="cyber-button w-full flex items-center justify-center space-x-2 mb-6"
        >
          <Search size={16} />
          <span>Generate Dorks</span>
        </button>

        {/* Generated Dorks - Horizontal Cards */}
        {generatedDorks.length > 0 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold mb-4 accent-glow">Generated Dorks:</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {generatedDorks.map((dork, index) => (
                <div key={index} className="cyber-card bg-muted/50 p-4 animate-slide-in">
                  <div className="font-mono text-sm mb-3 break-all text-foreground">{dork}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(dork)}
                      className="cyber-button text-xs flex items-center space-x-1 flex-1"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => searchOnGoogle(dork)}
                      className="cyber-button text-xs flex items-center space-x-1 flex-1"
                    >
                      <ExternalLink size={12} />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="cyber-card">
        <h3 className="text-lg font-bold mb-4 purple-glow">Google Dork Operators Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-bold text-primary">site:</div>
            <div className="text-muted-foreground">Restrict to specific site</div>
          </div>
          <div>
            <div className="font-bold text-primary">intitle:</div>
            <div className="text-muted-foreground">Search in page title</div>
          </div>
          <div>
            <div className="font-bold text-primary">inurl:</div>
            <div className="text-muted-foreground">Search in URL</div>
          </div>
          <div>
            <div className="font-bold text-primary">filetype:</div>
            <div className="text-muted-foreground">Specific file types</div>
          </div>
          <div>
            <div className="font-bold text-primary">intext:</div>
            <div className="text-muted-foreground">Search in page content</div>
          </div>
          <div>
            <div className="font-bold text-primary">-term</div>
            <div className="text-muted-foreground">Exclude term</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDorking;