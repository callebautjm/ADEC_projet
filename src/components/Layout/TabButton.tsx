/**
 * Onglet en capitales souligné en prune, comme les liens de catégories du site adec.corsica.
 * À placer dans un conteneur `flex border-b border-neutral-200`.
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
    onClick={onClick}
    aria-pressed={active}
    className={`relative shrink-0 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
      active ? 'text-prune-700' : 'text-neutral-500 hover:text-prune-700'
    }`}
  >
    {children}
    {active && <span aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-1 bg-prune-600" />}
  </button>
);
