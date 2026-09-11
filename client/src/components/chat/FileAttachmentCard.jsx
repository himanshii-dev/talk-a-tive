import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Eye, X } from 'lucide-react';

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const FileAttachmentCard = ({ attachment, isSelf }) => {
  const { url, fileName, fileSize } = attachment;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border max-w-sm my-1 ${
        isSelf
          ? 'bg-indigo-700/60 border-indigo-500/50 text-white'
          : 'bg-slate-800/80 border-slate-700/60 text-slate-100'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isSelf ? 'bg-indigo-800/80 text-white' : 'bg-slate-700/80 text-brand-400'
        }`}
      >
        <FileText className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate leading-tight">{fileName}</p>
        <p className="text-[10px] text-slate-300 mt-0.5">{formatFileSize(fileSize)}</p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        className={`p-2 rounded-lg transition-colors ${
          isSelf
            ? 'hover:bg-indigo-600 text-white'
            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
        }`}
        title="Download file"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
};

export const ImageAttachmentCard = ({ attachment }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { url, fileName } = attachment;

  return (
    <>
      <div className="my-1 max-w-xs overflow-hidden rounded-xl border border-white/10 group relative cursor-pointer">
        <img
          src={url}
          alt={fileName || 'Shared image'}
          className="w-full max-h-72 object-cover transition-transform duration-200 group-hover:scale-102"
          onClick={() => setLightboxOpen(true)}
          loading="lazy"
        />
        <div
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <Eye className="w-6 h-6 drop-shadow-md" />
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={url}
            alt={fileName || 'Full image'}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
