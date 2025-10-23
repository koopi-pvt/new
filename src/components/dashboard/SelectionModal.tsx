"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';

type SelectableItem = {
  id: string;
  name: string;
  images?: string[];
};

type SelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SelectableItem) => void;
  items: SelectableItem[];
  selectedItem: SelectableItem | null;
  title: string;
};

export default function SelectionModal({ isOpen, onClose, onSelect, items, selectedItem, title }: SelectionModalProps) {
  const handleSelect = (item: SelectableItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white/80 backdrop-blur-2xl p-6 text-left align-middle shadow-xl transition-all border border-white/30">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {title}
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 group focus:outline-none"
                      >
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-500 p-2 text-center">{item.name}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-100 group-hover:opacity-100">
                          <p className="text-xs font-bold text-white">{item.name}</p>
                        </div>
                        {selectedItem?.id === item.id && (
                          <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}