import React, { useState, useRef } from 'react';
import { Upload, X, Play, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFilesUpload: (files: Array<{ fileUrl: string; originalName: string; mimeType: string }>) => void;
  maxFiles?: number;
  acceptTypes?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesUpload, 
  maxFiles = 5,
  acceptTypes = "image/*,video/*"
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    
    if (files.length + previews.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const tryUpload = async (url: string) => {
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
        return response.json();
      };

      // Prefer Cloudinary. Fallback to local uploads if Cloudinary is not configured.
      let data: any;
      try {
        data = await tryUpload('/api/upload/cloudinary-multiple');
      } catch {
        data = await tryUpload('/api/upload/upload-multiple');
      }
      
      // Add previews
      const newPreviews = files.map((file, idx) => ({
        url: data.files[idx]?.fileUrl || URL.createObjectURL(file),
        type: file.type,
        name: file.name
      }));

      setPreviews([...previews, ...newPreviews]);
      onFilesUpload([...previews, ...newPreviews].map(p => ({
        fileUrl: p.url,
        originalName: p.name,
        mimeType: p.type
      })));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onFilesUpload(newPreviews.map(p => ({
      fileUrl: p.url,
      originalName: p.name,
      mimeType: p.type
    })));
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
      >
        <Upload className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">Click to upload files</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or drag and drop</p>
        <p className="text-xs text-slate-400 mt-2">Images and videos up to 50MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Uploaded Files ({previews.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative group">
                {preview.type.startsWith('image/') ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Play className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{preview.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin">
            <Upload className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Uploading...</p>
        </div>
      )}
    </div>
  );
};
