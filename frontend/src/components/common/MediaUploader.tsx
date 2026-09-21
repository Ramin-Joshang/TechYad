'use client';

import React, { useState, useRef } from 'react';
import { mediaApi } from '@/features/media/api/media.api';
import { UploadCloud, CheckCircle2, Copy, Trash2, Loader2, Play, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  helpText?: string;
  previewType?: 'image' | 'video' | 'auto';
  className?: string;
  id?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  maxSizeMB = 50,
  helpText,
  previewType = 'auto',
  className = '',
  id = 'media-uploader'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = previewType === 'video' || (previewType === 'auto' && (value?.startsWith('data:video') || value?.match(/\.(mp4|webm|ogg|mov)$/i)));

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
      return;
    }

    setIsUploading(true);
    try {
      const response = await mediaApi.uploadFile(file);
      const url = response.data?.url;
      if (url) {
        onChange(url);
        toast.success('فایل با موفقیت آپلود شد');
      } else {
        toast.error('خطا در دریافت نشانی فایل آپلود شده');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در آپلود فایل');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyLink = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('لینک کپی شد!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={id} className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-[var(--neo-text-main)]">
            {label}
          </label>
          <button
            type="button"
            id={`${id}-toggle-manual`}
            onClick={() => setManualInputOpen(!manualInputOpen)}
            className="text-xs text-[var(--neo-primary)] hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            {manualInputOpen ? 'آپلود با کلیک یا فایل' : 'درج مستقیم لینک یا آدرس'}
          </button>
        </div>
      )}

      {manualInputOpen ? (
        <div className="flex gap-2">
          <input
            type="text"
            id={`${id}-manual-input`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... یا نشانی فایل"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] text-sm focus:ring-2 focus:ring-[var(--neo-primary)] outline-none dir-ltr text-left"
          />
          {value && (
            <button
              type="button"
              id={`${id}-clear-manual-btn`}
              onClick={() => onChange('')}
              className="px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
              title="پاک کردن"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : value ? (
        /* Preview Card */
        <div className="relative group rounded-2xl overflow-hidden border border-[var(--neo-border)] bg-[var(--neo-surface-2)]">
          {isVideo ? (
            <div className="aspect-video relative bg-black/90 flex items-center justify-center">
              <video src={value} controls className="max-h-60 w-full object-contain rounded-xl" />
            </div>
          ) : (
            <div className="aspect-video max-h-56 relative overflow-hidden flex items-center justify-center bg-black/5">
              <img
                src={value}
                alt="پیش‌نمایش"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/400/225';
                }}
              />
            </div>
          )}

          <div className="p-3 bg-[var(--neo-surface)] flex items-center justify-between border-t border-[var(--neo-border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--neo-text-muted)] truncate max-w-[200px] dir-ltr text-left">
              {isVideo ? <Play className="w-3.5 h-3.5 text-[var(--neo-primary)] shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              <span className="truncate">{value.startsWith('data:') ? 'فایل آپلود شده محلی' : value}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id={`${id}-copy-link-btn`}
                onClick={handleCopyLink}
                className="p-1.5 text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-surface-2)] rounded-lg transition"
                title="کپی لینک"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                id={`${id}-change-file-btn`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1 text-xs font-bold text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition"
              >
                {isUploading ? 'درحال جایگزینی...' : 'تغییر فایل'}
              </button>

              <button
                type="button"
                id={`${id}-remove-file-btn`}
                onClick={() => onChange('')}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[var(--neo-primary)] bg-[var(--neo-primary)]/5 scale-[1.01]'
              : 'border-[var(--neo-border)] hover:border-[var(--neo-primary)]/60 bg-[var(--neo-surface)] hover:bg-[var(--neo-surface-2)]/40'
          }`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[var(--neo-primary)] animate-spin" />
              <p className="text-sm font-bold text-[var(--neo-text-main)]">درحال آپلود فایل...</p>
              <span className="text-xs text-[var(--neo-text-muted)]">لطفاً شکیبا باشید</span>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-[var(--neo-surface-2)] text-[var(--neo-primary)] rounded-2xl shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-[var(--neo-text-main)]">
                برای انتخاب فایل کلیک کنید یا فایل را اینجا رها کنید
              </div>
              <p className="text-xs text-[var(--neo-text-muted)]">
                {helpText || `پشتیبانی از ${accept} (حداکثر ${maxSizeMB} مگابایت)`}
              </p>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
