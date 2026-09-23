'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Code, Quote, Undo, Redo, Sparkles
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'متن خود را اینجا بنویسید...',
  minHeight = '320px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [htmlContent, setHtmlContent] = useState(value || '');

  // Synchronize internal state with external value changes
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlContent(value || '');
  }, [value, activeTab]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, arg);
      if (editorRef.current) {
        const newHtml = editorRef.current.innerHTML;
        setHtmlContent(newHtml);
        onChange(newHtml);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  };

  const handleAddLink = () => {
    const url = prompt('لطفاً آدرس لینک (URL) را وارد نمایید:', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  const handleAddImage = () => {
    const url = prompt('لطفاً آدرس مستقیم تصویر را وارد فرمایید:', 'https://');
    if (url) {
      exec('insertImage', url);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-[var(--neo-primary)] transition-all">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-gray-50/90 border-b border-gray-200 select-none">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <button
            type="button"
            title="تیتر ۱"
            onClick={() => exec('formatBlock', '<h2>')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="تیتر ۲"
            onClick={() => exec('formatBlock', '<h3>')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="تیتر ۳"
            onClick={() => exec('formatBlock', '<h4>')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            title="درشت (Bold)"
            onClick={() => exec('bold')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition font-bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="کج (Italic)"
            onClick={() => exec('italic')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="زیرخط (Underline)"
            onClick={() => exec('underline')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="خط روی متن (Strikethrough)"
            onClick={() => exec('strikeThrough')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="لیست نشانه‌دار (Unordered List)"
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="لیست شماره‌دار (Ordered List)"
            onClick={() => exec('insertOrderedList')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            title="راست‌چین"
            onClick={() => exec('justifyRight')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="وسط‌چین"
            onClick={() => exec('justifyCenter')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="چپ‌چین"
            onClick={() => exec('justifyLeft')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="هم‌تراز (Justify)"
            onClick={() => exec('justifyFull')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Elements */}
          <button
            type="button"
            title="درج نقل‌قول (Quote)"
            onClick={() => exec('formatBlock', '<blockquote>')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="درج لینک"
            onClick={handleAddLink}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="درج تصویر"
            onClick={handleAddImage}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            title="بازگشت (Undo)"
            onClick={() => exec('undo')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="انجام مجدد (Redo)"
            onClick={() => exec('redo')}
            className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-700 transition"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Visual vs Code */}
        <div className="flex items-center gap-1 bg-gray-200/80 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === 'visual' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ویرایشگر بصری
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              activeTab === 'code' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            کد HTML
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dir="rtl"
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="p-4 outline-none text-sm text-gray-800 leading-relaxed font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none prose prose-slate max-w-none [&>h2]:text-2xl [&>h2]:font-black [&>h2]:my-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:my-3 [&>blockquote]:border-r-4 [&>blockquote]:border-[var(--neo-primary)] [&>blockquote]:pr-4 [&>blockquote]:text-gray-600 [&>blockquote]:italic [&>ul]:list-disc [&>ul]:pr-5 [&>ol]:list-decimal [&>ol]:pr-5 [&>a]:text-blue-600 [&>a]:underline [&>img]:rounded-xl [&>img]:max-w-full [&>img]:my-3"
        />
      ) : (
        <textarea
          value={htmlContent}
          onChange={handleCodeChange}
          dir="ltr"
          style={{ minHeight }}
          placeholder="<html>..."
          className="w-full p-4 font-mono text-xs text-gray-800 bg-gray-900/5 outline-none resize-y"
        />
      )}
    </div>
  );
}
