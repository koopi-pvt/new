'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter text here...',
  minHeight = '150px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, `<${tag}>`);
    editorRef.current?.focus();
    handleInput();
  };

  const toolbarButtons = [
    { icon: Heading1, title: 'Heading 1', action: () => formatBlock('h1') },
    { icon: Heading2, title: 'Heading 2', action: () => formatBlock('h2') },
    { icon: Heading3, title: 'Heading 3', action: () => formatBlock('h3') },
    { type: 'divider' },
    { icon: Bold, title: 'Bold', action: () => execCommand('bold') },
    { icon: Italic, title: 'Italic', action: () => execCommand('italic') },
    { icon: Underline, title: 'Underline', action: () => execCommand('underline') },
    { icon: Strikethrough, title: 'Strikethrough', action: () => execCommand('strikethrough') },
    { type: 'divider' },
    { icon: AlignLeft, title: 'Align Left', action: () => execCommand('justifyLeft') },
    { icon: AlignCenter, title: 'Align Center', action: () => execCommand('justifyCenter') },
    { icon: AlignRight, title: 'Align Right', action: () => execCommand('justifyRight') },
    { type: 'divider' },
    { icon: ListOrdered, title: 'Numbered List', action: () => execCommand('insertOrderedList') },
    { icon: List, title: 'Bullet List', action: () => execCommand('insertUnorderedList') },
    { type: 'divider' },
    { icon: LinkIcon, title: 'Insert Link', action: insertLink },
    { type: 'divider' },
    { icon: Undo, title: 'Undo', action: () => execCommand('undo') },
    { icon: Redo, title: 'Redo', action: () => execCommand('redo') },
  ];

  return (
    <div className={`w-full bg-white/80 border rounded-xl transition-all shadow-sm overflow-hidden ${
      isFocused ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50/50 flex-wrap">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'divider') {
            return (
              <div 
                key={`divider-${index}`} 
                className="w-px h-6 bg-gray-300 mx-1"
              />
            );
          }
          
          const Icon = button.icon!;
          return (
            <button
              key={index}
              type="button"
              onClick={button.action}
              title={button.title}
              className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700 hover:text-gray-900"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-4 py-3.5 focus:outline-none text-sm text-gray-900 max-w-none
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2
          [&_p]:my-2
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
          [&_a]:text-blue-500 [&_a]:underline
          [&_b]:font-bold
          [&_strong]:font-bold
          [&_i]:italic
          [&_em]:italic
          [&_u]:underline"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}