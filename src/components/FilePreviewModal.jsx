import React from 'react';
import { X, Download, FileText, Image as ImageIcon } from 'lucide-react';

const FilePreviewModal = ({ isOpen, onClose, fileUrl, fileName, fileType }) => {
    if (!isOpen) return null;

    const handleDownload = async () => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for cross-origin or other issues
            window.open(fileUrl, '_blank');
        }
    };

    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                            {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate" title={fileName}>
                            {fileName}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm active:transform active:scale-95"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    {isImage ? (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain p-4"
                        />
                    ) : isPDF ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-full"
                            title={fileName}
                        />
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <FileText size={40} />
                            </div>
                            <p className="text-xl font-medium text-gray-900 mb-2">No preview available</p>
                            <p className="text-gray-500 mb-6">This file type cannot be previewed directly.</p>
                            <button
                                onClick={handleDownload}
                                className="text-indigo-600 hover:underline font-medium"
                            >
                                Download to view
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
