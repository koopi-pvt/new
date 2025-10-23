'use client';

import React from 'react';
import { templates } from '@/lib/templates';
import { Lock } from 'lucide-react';

type TemplatePreviewProps = {
  templateId: keyof typeof templates;
  isSelected: boolean;
  isLocked?: boolean;
  onClick: () => void;
};

export function TemplatePreview({ templateId, isSelected, isLocked, onClick }: TemplatePreviewProps) {
  const template = templates[templateId];

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`relative w-full p-2 border-2 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
          : isLocked
          ? 'border-gray-300/50 cursor-not-allowed'
          : 'border-gray-300/50 hover:border-gray-400/50 hover:shadow-md'
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
          <Lock className="w-6 h-6 text-gray-500 mb-2" />
          <span className="text-xs font-semibold text-gray-600">Upgrade to Pro</span>
        </div>
      )}
      <div
        className={`h-32 rounded-lg flex flex-col justify-between p-3 ${isLocked ? 'opacity-50' : ''}`}
        style={{
          backgroundColor: template.theme.previewBg,
          fontFamily: template.theme.fontFamily,
        }}
      >
        <div className="flex justify-between items-start">
          <div className="w-8 h-3 rounded-full" style={{ backgroundColor: template.theme.textColor }}></div>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.theme.primaryColor }}></div>
        </div>
        <div className="space-y-1">
          <div className="w-3/4 h-3 rounded-full" style={{ backgroundColor: template.theme.textColor }}></div>
          <div className="w-1/2 h-2 rounded-full" style={{ backgroundColor: template.theme.textColor, opacity: 0.7 }}></div>
        </div>
      </div>
      <p className={`text-sm font-medium capitalize mt-2 ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>{templateId}</p>
    </button>
  );
}