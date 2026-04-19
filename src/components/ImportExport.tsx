import { useState, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import type { Grade } from '../types';
import { ALL_GRADES, GRADE_SHORT } from '../types';

export function ImportExport() {
  const store = useStore();
  const [importText, setImportText] = useState('');
  const [exportGrade, setExportGrade] = useState<Grade | 'all'>('all');
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!importText.trim()) return;
    const result = store.importCards(importText);
    setImportResult(result);
    if (result.imported > 0 && result.errors.length === 0) {
      setImportText('');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportText = store.exportCards(exportGrade);

  const handleExportDownload = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frenchmaster_${exportGrade}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText);
  };

  const previewLines = importText.split('\n').filter(l => l.trim() && !l.startsWith('#'));

  return (
    <div className="p-7 lg:p-10 max-w-4xl mx-auto space-y-7">
      <div className="fade-up fade-up-1">
        <h2 className="font-serif text-2xl lg:text-3xl font-light text-creme-100">📁 Import / Export</h2>
        <p className="text-creme-400 text-sm mt-1">
          Anki-compatible tab-separated format • Manage your vocabulary decks
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 fade-up fade-up-2">
        <button
          onClick={() => setActiveTab('import')}
          className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400"
          style={
            activeTab === 'import'
              ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)', color: '#e8e3d8' }
              : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
          }
        >📥 Import</button>
        <button
          onClick={() => setActiveTab('export')}
          className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-400"
          style={
            activeTab === 'export'
              ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)', color: '#e8e3d8' }
              : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
          }
        >📤 Export</button>
      </div>

      {activeTab === 'import' ? (
        <div className="space-y-6" style={{ animation: 'crossfadeIn 350ms ease both' }}>
          {/* Format Guide */}
          <div className="noir-card p-7 fade-up fade-up-3">
            <h3 className="font-serif text-lg text-creme-100 mb-3 font-light">📋 Import Format (Anki-compatible)</h3>
            <p className="text-[13px] text-creme-400 mb-4 leading-relaxed">
              Use tab-separated values. Lines starting with <code className="text-encre-light px-1.5 py-0.5 rounded" style={{ background: 'rgba(58, 61, 92, 0.15)' }}>#</code> are treated as comments/metadata.
            </p>
            <div className="rounded-lg p-4 font-mono text-[12px] overflow-x-auto" style={{ background: 'rgba(18, 17, 15, 0.5)' }}>
              <p className="text-creme-500"># Optional metadata comments</p>
              <p className="text-creme-500">#separator:tab</p>
              <p className="text-creme-500">#columns:french	english	example	grade	tags</p>
              <p className="text-creme-200 mt-2">bonjour	hello	Bonjour, ça va ?	G10S1	greetings basic</p>
              <p className="text-creme-200">merci	thank you	Merci beaucoup !	G10S1	greetings polite</p>
              <p className="text-creme-200">la maison	the house	Ma maison est grande.	G10S2	housing places</p>
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-[11px] text-creme-500 font-medium uppercase tracking-widest">Fields (tab-separated):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="flex gap-2"><span className="text-encre-light font-medium shrink-0">1. french</span><span className="text-creme-500">— Required. The French word/phrase</span></div>
                <div className="flex gap-2"><span className="text-encre-light font-medium shrink-0">2. english</span><span className="text-creme-500">— Required. The English translation</span></div>
                <div className="flex gap-2"><span className="text-encre-light font-medium shrink-0">3. example</span><span className="text-creme-500">— Optional. Example sentence in French</span></div>
                <div className="flex gap-2"><span className="text-encre-light font-medium shrink-0">4. grade</span><span className="text-creme-500">— Optional. G10S1, G10S2, G11S1, G11S2, or G12</span></div>
                <div className="flex gap-2"><span className="text-encre-light font-medium shrink-0">5. tags</span><span className="text-creme-500">— Optional. Space-separated tags</span></div>
              </div>
            </div>
          </div>

          {/* Import Area */}
          <div className="noir-card p-7 space-y-5 fade-up fade-up-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-creme-100 font-light">Paste or Upload</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-creme-300 transition-all duration-400"
                  style={{ background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
                >
                  📄 Upload .txt
                </button>
                <input ref={fileInputRef} type="file" accept=".txt,.tsv,.csv" className="hidden" onChange={handleFileImport} />
              </div>
            </div>

            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportResult(null); }}
              placeholder={"Paste your tab-separated cards here...\n\nbonjour\thello\tBonjour, ça va ?\tG10S1\tgreetings"}
              rows={10}
              className="noir-input w-full px-4 py-3 rounded-lg font-mono text-[12px] resize-y"
            />

            {/* Preview */}
            {previewLines.length > 0 && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(18, 17, 15, 0.4)' }}>
                <p className="text-[11px] text-creme-500 mb-2">Preview ({previewLines.length} cards detected):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {previewLines.slice(0, 10).map((line, i) => {
                    const [fr, en] = line.split('\t');
                    return (
                      <div key={i} className="flex gap-3 text-[12px]">
                        <span className="text-encre-light font-medium">{fr}</span>
                        <span className="text-creme-500">→</span>
                        <span className="text-creme-300">{en}</span>
                      </div>
                    );
                  })}
                  {previewLines.length > 10 && (
                    <p className="text-[11px] text-creme-500">... and {previewLines.length - 10} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div
                className="rounded-lg p-4"
                style={{
                  background: importResult.errors.length === 0 ? 'rgba(122, 139, 109, 0.06)' : 'rgba(184, 148, 63, 0.06)',
                  border: `1px solid ${importResult.errors.length === 0 ? 'rgba(122, 139, 109, 0.15)' : 'rgba(184, 148, 63, 0.12)'}`,
                }}
              >
                {importResult.imported > 0 && (
                  <p className="text-[13px] text-sauge-light font-medium">
                    ✅ Successfully imported {importResult.imported} card{importResult.imported !== 1 ? 's' : ''}!
                  </p>
                )}
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[13px] text-miel font-medium">⚠️ {importResult.errors.length} error{importResult.errors.length !== 1 ? 's' : ''}:</p>
                    <ul className="mt-1 space-y-0.5">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-[11px] text-creme-400">• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="noir-btn w-full py-3 text-[14px]"
            >
              Import Cards
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6" style={{ animation: 'crossfadeIn 350ms ease both' }}>
          {/* Export Options */}
          <div className="noir-card p-7 space-y-5 fade-up fade-up-3">
            <h3 className="font-serif text-lg text-creme-100 font-light">Export Settings</h3>

            <div>
              <label className="text-[12px] font-medium text-creme-300 block mb-2 uppercase tracking-widest">Grade Filter</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setExportGrade('all')}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-400"
                  style={
                    exportGrade === 'all'
                      ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)', color: '#e8e3d8' }
                      : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
                  }
                >All ({store.cards.length})</button>
                {ALL_GRADES.map(g => {
                  const count = store.getCardsByGrade(g).length;
                  return (
                    <button
                      key={g}
                      onClick={() => setExportGrade(g)}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-400"
                      style={
                        exportGrade === g
                          ? { background: 'rgba(58, 61, 92, 0.3)', border: '1px solid rgba(58, 61, 92, 0.2)', color: '#e8e3d8' }
                          : { background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.04)', color: '#9c9486' }
                      }
                    >{GRADE_SHORT[g]} ({count})</button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportDownload}
                className="flex-1 py-3 rounded-lg font-medium text-[14px] text-creme-100 hover-float"
                style={{ background: 'linear-gradient(135deg, #7a8b6d, #8fa080)', border: '1px solid rgba(143, 160, 128, 0.3)' }}
              >
                📥 Download .txt File
              </button>
              <button
                onClick={handleCopyExport}
                className="px-5 py-3 rounded-lg font-medium text-[13px] text-creme-300 transition-all duration-400"
                style={{ background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
              >
                📋 Copy
              </button>
              <button
                onClick={() => setShowExportPreview(!showExportPreview)}
                className="px-5 py-3 rounded-lg font-medium text-[13px] text-creme-300 transition-all duration-400"
                style={{ background: 'rgba(232, 227, 216, 0.03)', border: '1px solid rgba(232, 227, 216, 0.06)' }}
              >
                👁️ Preview
              </button>
            </div>
          </div>

          {/* Export Preview */}
          {showExportPreview && (
            <div className="noir-card p-7 fade-up fade-up-4" style={{ animation: 'crossfadeIn 350ms ease both' }}>
              <h3 className="font-serif text-lg text-creme-100 mb-4 font-light">Export Preview</h3>
              <pre className="rounded-lg p-4 text-[11px] text-creme-300 font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre"
                style={{ background: 'rgba(18, 17, 15, 0.5)' }}>
                {exportText}
              </pre>
              <p className="text-[11px] text-creme-500 mt-3">
                {store.getCardsByGrade(exportGrade).length} cards •
                Anki-compatible tab-separated format
              </p>
            </div>
          )}

          {/* Import into Anki instructions */}
          <div className="noir-card p-7 fade-up fade-up-5" style={{ background: 'rgba(34, 31, 28, 0.5)' }}>
            <h3 className="font-serif text-lg text-creme-100 mb-4 font-light">📱 Importing into Anki</h3>
            <ol className="space-y-2.5 text-[13px] text-creme-400">
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">1.</span> Download the exported .txt file</li>
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">2.</span> Open Anki → File → Import</li>
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">3.</span> Select the .txt file</li>
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">4.</span> Set separator to "Tab" and ensure fields map correctly</li>
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">5.</span> Map: Field 1 → Front, Field 2 → Back, Field 5 → Tags</li>
              <li className="flex gap-3"><span className="text-miel font-semibold shrink-0 font-serif">6.</span> Click Import — your cards are ready!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Card Management */}
      <div className="noir-card p-7 fade-up fade-up-6">
        <h3 className="font-serif text-lg text-creme-100 mb-5 font-light">📚 Card Library ({store.cards.length} total)</h3>
        <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
          {store.cards.map(card => (
            <div key={card.id}
              className="flex items-center justify-between p-2.5 rounded-lg transition-colors duration-300 group"
              style={{ background: 'rgba(232, 227, 216, 0.01)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232, 227, 216, 0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232, 227, 216, 0.01)'; }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full shrink-0 text-creme-400"
                  style={{ background: 'rgba(232, 227, 216, 0.04)' }}
                >{GRADE_SHORT[card.grade]}</span>
                <span className="text-[13px] font-medium text-creme-100 truncate font-serif italic">{card.french}</span>
                <span className="text-[11px] text-creme-500 truncate hidden sm:inline">{card.english}</span>
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${card.french}"?`)) store.deleteCard(card.id); }}
                className="text-terre opacity-0 group-hover:opacity-60 hover:!opacity-100 text-[11px] transition-all duration-300 shrink-0"
              >✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
