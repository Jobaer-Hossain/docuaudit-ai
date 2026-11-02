import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  PanelLeftClose,
  PanelLeft,
  X,
  Crosshair,
  Scan
} from 'lucide-react';
import { DocumentDetail, DocumentElement, BoundingBox } from '../types';

interface DocumentViewerProps {
  document: DocumentDetail;
  currentPage: number;
  onPageChange: (page: number) => void;
  focusedBbox: BoundingBox | null;
  onSelectBbox: (el: DocumentElement) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  currentPage,
  onPageChange,
  focusedBbox,
  onSelectBbox,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'VERIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [hoveredElement, setHoveredElement] = useState<DocumentElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusedBbox && canvasRef.current) {
      const targetTop = (focusedBbox.ymin / 1000) * 1050 * zoom;
      canvasRef.current.scrollTo({
        top: Math.max(0, targetTop - 150),
        behavior: 'smooth',
      });
    }
  }, [focusedBbox, zoom]);

  const pageElements = document.elements.filter((el) => el.page === currentPage);
  const pageFindingMap = new Map(
    document.findings
      .filter((f) => f.page_number === currentPage)
      .map((f) => [`${f.bounding_box.ymin}-${f.bounding_box.xmin}`, f])
  );

  const getElementSeverity = (el: DocumentElement): 'CRITICAL' | 'WARNING' | 'VERIFIED' | 'INFO' => {
    if (el.meta?.anomaly) return 'CRITICAL';
    const key = `${el.bbox.ymin}-${el.bbox.xmin}`;
    const find = pageFindingMap.get(key);
    if (find) return find.severity;
    if (el.element_type === 'signature' && el.text.includes('UNSIGNED')) return 'CRITICAL';
    if (el.element_type === 'clause' && (el.text.includes('24') || el.text.includes('Zurich'))) return 'WARNING';
    if (el.element_type === 'signature') return 'VERIFIED';
    return 'INFO';
  };

  const isBoxVisible = (el: DocumentElement) => {
    if (!showBoxes) return false;
    const sev = getElementSeverity(el);
    if (activeLayer === 'ALL') return true;
    return sev === activeLayer;
  };

  const getBoxStyle = (el: DocumentElement) => {
    const sev = getElementSeverity(el);
    const isFocused =
      focusedBbox &&
      Math.abs(focusedBbox.ymin - el.bbox.ymin) < 5 &&
      Math.abs(focusedBbox.xmin - el.bbox.xmin) < 5;

    if (isFocused) {
      return 'border-2 border-red-500 bg-red-500/25 ring-4 ring-red-400/50 box-highlight-pulse z-30 shadow-md';
    }

    switch (sev) {
      case 'CRITICAL':
        return 'border border-red-500/80 bg-red-500/10 hover:bg-red-500/20 z-20';
      case 'WARNING':
        return 'border border-amber-500/80 bg-amber-500/10 hover:bg-amber-500/20 z-10';
      case 'VERIFIED':
        return 'border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20';
      default:
        return 'border border-sky-500/40 bg-sky-500/5 hover:border-sky-400 hover:bg-sky-500/15';
    }
  };

  const searchMatches = searchQuery.trim()
    ? pageElements.filter((e) => e.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs gap-2 flex-wrap">
        {/* Left: Document Info & Page Thumbnail Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showThumbnails 
                ? 'bg-slate-200/80 border-slate-300 text-slate-800' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="Toggle Page Thumbnails"
          >
            {showThumbnails ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
          </button>

          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="font-semibold text-slate-800 truncate max-w-[180px]">
            {document.metadata.title}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
            {document.metadata.category}
          </span>
        </div>

        {/* Center: In-Document Search Bar */}
        <div className="relative flex items-center min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words in document..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {searchQuery && (
            <span className="absolute -bottom-4 right-0 text-[10px] text-brand-600 font-mono font-medium">
              {searchMatches.length} match{searchMatches.length !== 1 ? 'es' : ''} on page
            </span>
          )}
        </div>

        {/* Right: Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Page Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-700 font-mono text-[11px] font-medium">
              {currentPage} / {document.metadata.total_pages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(document.metadata.total_pages, currentPage + 1))}
              disabled={currentPage >= document.metadata.total_pages}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-slate-600 font-mono text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Layer Toggle */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors shadow-xs ${
              showBoxes
                ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Spatial Boxes</span>
          </button>
        </div>
      </div>

      {/* Layer Filter Quick Bar */}
      {showBoxes && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50/70 border-b border-slate-200 text-[10px] font-mono">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Layers:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'VERIFIED'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2 py-0.5 rounded transition-all ${
                activeLayer === layer
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {layer === 'ALL' ? 'All Bounding Boxes' : layer.charAt(0) + layer.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Thumbnail Page Drawer */}
        {showThumbnails && (
          <div className="w-36 bg-slate-50 border-r border-slate-200 p-2.5 space-y-3 overflow-y-auto shrink-0 select-none">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block px-1">
              Pages ({document.metadata.total_pages})
            </span>
            {document.pages_content.map((p) => {
              const isSelected = p.page === currentPage;
              const pageFlags = document.findings.filter((f) => f.page_number === p.page);
              const critFlags = pageFlags.filter((f) => f.severity === 'CRITICAL').length;

              return (
                <div
                  key={p.page}
                  onClick={() => onPageChange(p.page)}
                  className={`cursor-pointer rounded-lg p-2 border transition-all text-center ${
                    isSelected
                      ? 'bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-xs'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-24 bg-white rounded border border-slate-200 shadow-2xs mb-2 flex flex-col p-1.5 text-left overflow-hidden pointer-events-none">
                    <div className="h-1.5 w-1/2 bg-slate-200 rounded mb-1" />
                    <div className="h-1 w-full bg-slate-100 rounded mb-1" />
                    <div className="h-1 w-3/4 bg-slate-100 rounded mb-1" />
                    <div className="mt-auto flex justify-between text-[6px] font-mono text-slate-400">
                      <span>P.{p.page}</span>
                      <span>800x1050</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-brand-700 font-bold' : 'text-slate-600'}>
                      Page {p.page}
                    </span>
                    {critFlags > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-100 text-red-700 font-bold">
                        {critFlags} 🔴
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Canvas Scroll Area */}
        <div 
          ref={canvasRef}
          className="flex-1 overflow-auto p-6 flex justify-center bg-slate-100/70 relative"
        >
          {/* Document Paper Container */}
          <div
            style={{
              width: `${800 * zoom}px`,
              minHeight: `${1050 * zoom}px`,
              transformOrigin: 'top center',
            }}
            className="relative bg-white text-slate-900 rounded-lg shadow-md border border-slate-200/80 p-8 transition-all duration-150 select-text font-sans"
          >
            {/* Header Watermark */}
            <div className="absolute top-3 right-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>DOCUAUDIT VERIFICATION LAYER • PAGE {currentPage}</span>
            </div>

            {/* Document Content Rendering */}
            <div className="space-y-4">
              {pageElements.map((el) => {
                const sev = getElementSeverity(el);
                const isAnomaly = !!el.meta?.anomaly || sev === 'CRITICAL';
                const isSearchHit = searchQuery.trim() && el.text.toLowerCase().includes(searchQuery.toLowerCase());

                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectBbox(el)}
                    onMouseEnter={() => setHoveredElement(el)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className={`relative p-2.5 rounded transition-all cursor-pointer ${
                      isSearchHit
                        ? 'bg-amber-50 border-2 border-amber-400 ring-2 ring-amber-300/40'
                        : isAnomaly 
                        ? 'bg-red-50/70 border border-red-200' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {el.element_type === 'header' && (
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-2 mb-2">
                        {el.text}
                      </h2>
                    )}

                    {el.element_type === 'badge' && (
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                        {el.text}
                      </div>
                    )}

                    {el.element_type === 'table_cell' && (
                      <div className="font-mono text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
                        <span>{el.text}</span>
                        {el.meta?.anomaly && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Arithmetic Error
                          </span>
                        )}
                      </div>
                    )}

                    {el.element_type === 'metric' && (
                      <div className={`p-2.5 rounded text-sm font-bold flex items-center justify-between ${
                        el.meta?.anomaly 
                          ? 'bg-red-100 text-red-900 border border-red-300' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <span>{el.text}</span>
                        {el.meta?.anomaly && (
                          <span className="text-xs text-red-700 bg-red-200/80 px-2 py-0.5 rounded">
                            Flagged Total
                          </span>
                        )}
                      </div>
                    )}

                    {el.element_type === 'clause' && (
                      <div className="text-xs leading-relaxed text-slate-800 border-l-2 border-slate-300 pl-3 italic py-1">
                        {el.text}
                      </div>
                    )}

                    {el.element_type === 'signature' && (
                      <div className={`p-3 rounded-lg border text-xs font-mono ${
                        el.text.includes('UNSIGNED')
                          ? 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          {el.text.includes('UNSIGNED') ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>{el.text.includes('UNSIGNED') ? 'BLOCKED DISBURSEMENT' : 'DIGITAL CERTIFICATE VERIFIED'}</span>
                        </div>
                        <div className="whitespace-pre-line text-[11px]">
                          {el.text}
                        </div>
                      </div>
                    )}

                    {el.element_type === 'text' && (
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {el.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Spatial Grounding Overlay Layer */}
            {showBoxes && (
              <div className="absolute inset-0 pointer-events-none">
                {pageElements.filter(isBoxVisible).map((el) => {
                  const boxClass = getBoxStyle(el);
                  const isFocused =
                    focusedBbox &&
                    Math.abs(focusedBbox.ymin - el.bbox.ymin) < 5 &&
                    Math.abs(focusedBbox.xmin - el.bbox.xmin) < 5;

                  const top = (el.bbox.ymin / 1000) * 1050 * zoom;
                  const left = (el.bbox.xmin / 800) * 800 * zoom;
                  const height = Math.max(28, ((el.bbox.ymax - el.bbox.ymin) / 1000) * 1050 * zoom);
                  const width = ((el.bbox.xmax - el.bbox.xmin) / 800) * 800 * zoom;

                  return (
                    <div
                      key={`bbox-${el.id}`}
                      style={{
                        top: `${top}px`,
                        left: `${left}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                      className={`absolute rounded transition-all pointer-events-auto cursor-pointer ${boxClass}`}
                      onClick={() => onSelectBbox(el)}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <div className="absolute -top-3 left-1 px-1 rounded text-[9px] font-mono bg-slate-900 text-white shadow-xs pointer-events-none flex items-center gap-1">
                        <span>[{Math.round(el.bbox.ymin)}, {Math.round(el.bbox.xmin)}]</span>
                        <span className="text-[8px] text-brand-300 font-bold uppercase">{el.element_type}</span>
                      </div>

                      {isFocused && (
                        <div className="absolute -top-6 right-1 bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] shadow-sm flex items-center gap-1">
                          <Crosshair className="w-3 h-3" /> AUDIT SPOTLIGHT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Floating Element Inspector Card */}
          {hoveredElement && (
            <div className="fixed bottom-6 left-48 z-50 max-w-md bg-white border border-slate-300 rounded-xl p-3 shadow-xl text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-brand-600" />
                  Spatial Token Inspector
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  Confidence: {Math.round(hoveredElement.confidence * 100)}%
                </span>
              </div>
              <p className="text-slate-800 font-mono text-[11px] line-clamp-3 bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                {hoveredElement.text}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Page {hoveredElement.page}</span>
                <span>BBox: [{hoveredElement.bbox.ymin}, {hoveredElement.bbox.xmin}, {hoveredElement.bbox.ymax}, {hoveredElement.bbox.xmax}]</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
