/**
 * Onglet souligné, à placer dans le bandeau de PageHeader (prop `tabs`)
 * ou dans un conteneur `flex border-b border-neutral-200`.
 */

import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    type="button"
    role="tab"
    onClick={onClick}
    aria-selected={active}
    className={`shrink-0 inline-flex items-center gap-1.5 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
      active
        ? 'border-prune-700 text-neutral-900 font-medium'
        : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
    }`}
  >
    {children}
  </button>
);
