import { Upload, User } from 'lucide-react';
import { useRef, useState } from 'react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File) => void;
  isUploading?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  isUploading = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call parent handler
    onAvatarChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0] ?? null;
    handleFileChange(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`group relative size-32 cursor-pointer overflow-hidden rounded-full transition-all duration-300 ${
          isDragging
            ? 'scale-105 ring-4 ring-primary/50'
            : 'hover:scale-105 hover:ring-4 hover:ring-primary/30'
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-gradient-primary flex size-full items-center justify-center">
            <User className="size-16 text-white" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {isUploading ? (
            <div className="spinner border-white/20 border-t-white" />
          ) : (
            <Upload className="size-8 text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      <p className="text-center text-sm text-gray-600">
        Click or drag to upload avatar
        <br />
        <span className="text-xs text-gray-500">Max size: 5MB</span>
      </p>
    </div>
  );
}
