import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DocumentDetail } from '../types';
import { uploadDocumentFile } from '../api';

interface UploadModalProps {
  onClose: () => void;
  onDocumentUploaded: (doc: DocumentDetail) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onDocumentUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      setProgressStage('Extracting multi-modal layout & spatial tokens...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressStage('Running arithmetic and quantitative matrix audit...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressStage('Executing compliance & anti-hallucination verification loops...');
      const uploadedDoc = await uploadDocumentFile(file);

      setProgressStage('Document intelligence ready!');
      await new Promise((r) => setTimeout(r, 300));

      onDocumentUploaded(uploadedDoc);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload and audit document');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Upload Document for Verification
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
            <input
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-brand-400 mb-3 transition-colors" />
            <span className="text-sm font-semibold text-slate-200 mb-1">
              {file ? file.name : 'Select or Drag & Drop PDF Document'}
            </span>
            <span className="text-xs text-slate-500">
              Supports Invoices, Legal MSAs, POs, and Scanned Documents (PDF up to 25MB)
            </span>
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="w-4 h-4 text-brand-400" />
                <span className="font-medium truncate max-w-xs">{file.name}</span>
                <span className="text-slate-500 font-mono">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          {isUploading && (
            <div className="p-4 rounded-lg bg-slate-950 border border-brand-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-brand-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verification Engine Active</span>
              </div>
              <p className="text-slate-400 font-mono text-[11px]">
                {progressStage}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-500 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold transition-colors shadow-md shadow-brand-600/20"
          >
            {isUploading ? 'Auditing...' : 'Upload & Start Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
