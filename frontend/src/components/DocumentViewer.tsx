import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText
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
  const [hoveredElement, setHoveredElement] = useState<DocumentElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Scroll to focused bounding box when spotlighted
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
  const pageFindingIds = new Set(
    document.findings
      .filter((f) => f.page_number === currentPage)
      .map((f) => `${f.bounding_box.ymin}-${f.bounding_box.xmin}`)
  );

  const getElementSeverity = (el: DocumentElement): 'CRITICAL' | 'WARNING' | 'VERIFIED' | 'INFO' => {
    if (el.meta?.anomaly) return 'CRITICAL';
    const key = `${el.bbox.ymin}-${el.bbox.xmin}`;
    if (pageFindingIds.has(key)) return 'CRITICAL';
    if (el.element_type === 'signature' && el.text.includes('UNSIGNED')) return 'CRITICAL';
    if (el.element_type === 'clause' && (el.text.includes('24') || el.text.includes('Zurich'))) return 'WARNING';
    if (el.element_type === 'signature') return 'VERIFIED';
    return 'INFO';
  };

  const getBoxStyle = (el: DocumentElement) => {
    const sev = getElementSeverity(el);
    const isFocused =
      focusedBbox &&
      Math.abs(focusedBbox.ymin - el.bbox.ymin) < 5 &&
      Math.abs(focusedBbox.xmin - el.bbox.xmin) < 5;

    if (isFocused) {
      return 'border-2 border-red-500 bg-red-500/25 ring-4 ring-red-400/50 box-highlight-pulse z-30';
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

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs backdrop-blur">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-slate-200 truncate max-w-xs">
            {document.metadata.title}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
            {document.metadata.category}
          </span>
        </div>

        {/* Zoom & Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-300 font-mono font-medium">
              Page {currentPage} of {document.metadata.total_pages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(document.metadata.total_pages, currentPage + 1))}
              disabled={currentPage >= document.metadata.total_pages}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-1.5 text-slate-400 font-mono text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Layer Toggle */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              showBoxes
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Spatial Boxes</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto p-6 flex justify-center bg-slate-950/90 relative"
      >
        {/* Document Paper Container */}
        <div
          style={{
            width: `${800 * zoom}px`,
            minHeight: `${1050 * zoom}px`,
            transformOrigin: 'top center',
          }}
          className="relative bg-white text-slate-900 rounded-lg shadow-2xl p-8 transition-all duration-150 select-text font-sans"
        >
          {/* Subtle Watermark or Header Grid */}
          <div className="absolute top-3 right-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none select-none">
            DOCUAUDIT MULTI-MODAL RECON-LAYER • PAGE {currentPage}
          </div>

          {/* Document Content Rendering */}
          <div className="space-y-4">
            {pageElements.map((el) => {
              const sev = getElementSeverity(el);
              const isAnomaly = !!el.meta?.anomaly || sev === 'CRITICAL';

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectBbox(el)}
                  onMouseEnter={() => setHoveredElement(el)}
                  onMouseLeave={() => setHoveredElement(null)}
                  className={`relative p-2.5 rounded transition-all cursor-pointer ${
                    isAnomaly 
                      ? 'bg-red-50/70 border border-red-200' 
                      : 'hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  {/* Element Text Content */}
                  {el.element_type === 'header' && (
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b pb-2 mb-2">
                      {el.text}
                    </h2>
                  )}

                  {el.element_type === 'badge' && (
                    <div className="bg-slate-100 border border-slate-300 rounded p-3 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {el.text}
                    </div>
                  )}

                  {el.element_type === 'table_cell' && (
                    <div className="font-mono text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
                      <span>{el.text}</span>
                      {el.meta?.anomaly && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
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
              {pageElements.map((el) => {
                const boxClass = getBoxStyle(el);
                const isFocused =
                  focusedBbox &&
                  Math.abs(focusedBbox.ymin - el.bbox.ymin) < 5 &&
                  Math.abs(focusedBbox.xmin - el.bbox.xmin) < 5;

                // Scale bounding coordinates to rendered dimensions
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
                    {/* Tiny Coordinate Tag */}
                    <div className="absolute -top-3 left-1 px-1 rounded text-[9px] font-mono bg-slate-900/90 text-slate-300 border border-slate-700 shadow-sm pointer-events-none flex items-center gap-1">
                      <span>[{Math.round(el.bbox.ymin)}, {Math.round(el.bbox.xmin)}]</span>
                      <span className="text-[8px] text-brand-400 font-bold uppercase">{el.element_type}</span>
                    </div>

                    {isFocused && (
                      <div className="absolute -top-6 right-1 bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] shadow-lg animate-bounce flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AUDIT SPOTLIGHT
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
          <div className="fixed bottom-6 left-12 z-50 max-w-md bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Spatial Element Inspector
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-brand-300">
                Confidence: {Math.round(hoveredElement.confidence * 100)}%
              </span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] line-clamp-3 bg-slate-950/70 p-2 rounded border border-slate-800/80 mb-2">
              {hoveredElement.text}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Page {hoveredElement.page}</span>
              <span>BBox: [{hoveredElement.bbox.ymin}, {hoveredElement.bbox.xmin}, {hoveredElement.bbox.ymax}, {hoveredElement.bbox.xmax}]</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
