/**
 * En-tête de page de l'outil : titre, description courte, actions à droite
 * et, éventuellement, onglets accrochés au bas du bandeau.
 */

import React from 'react';
import { pageContainer } from './ui';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Boutons affichés à droite du titre */
  actions?: React.ReactNode;
  /** Onglets (TabButton) affichés sous le titre */
  tabs?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, tabs }) => (
  <div className="bg-white border-b border-neutral-200">
    <div className={`${pageContainer} pt-4 ${tabs ? 'pb-1' : 'pb-4'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-neutral-900 leading-tight">{title}</h1>
        {description && <p className="text-sm text-neutral-500 mt-1 max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {tabs && (
      <div className={`${pageContainer} flex items-stretch gap-5 overflow-x-auto -mb-px`} role="tablist">
        {tabs}
      </div>
    )}
  </div>
);
