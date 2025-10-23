'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

type Variant = {
  name: string;
  options: { value: string }[];
};

type VariantEditorProps = {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
};

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const handleAddVariant = () => {
    onChange([...variants, { name: '', options: [{ value: '' }] }]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    onChange(newVariants);
  };

  const handleVariantNameChange = (index: number, name: string) => {
    const newVariants = [...variants];
    newVariants[index].name = name;
    onChange(newVariants);
  };

  const handleOptionChange = (variantIndex: number, optionIndex: number, value: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options[optionIndex].value = value;
    onChange(newVariants);
  };

  const handleAddOption = (variantIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.push({ value: '' });
    onChange(newVariants);
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.splice(optionIndex, 1);
    onChange(newVariants);
  };

  return (
    <div className="space-y-4">
      {variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="p-4 bg-white/80 border border-gray-200/80 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              value={variant.name}
              onChange={(e) => handleVariantNameChange(variantIndex, e.target.value)}
              placeholder="Variant Name (e.g., Size)"
              className="w-full font-semibold bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
            />
            <button onClick={() => handleRemoveVariant(variantIndex)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {variant.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(variantIndex, optionIndex, e.target.value)}
                  placeholder="Option (e.g., Small)"
                  className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
                <button onClick={() => handleRemoveOption(variantIndex, optionIndex)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => handleAddOption(variantIndex)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" />
              Add Option
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleAddVariant} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all bg-white/50">
        <Plus className="w-4 h-4" />
        <span className="font-medium">Add Variant</span>
      </button>
    </div>
  );
}