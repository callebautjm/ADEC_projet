/**
 * Bandeau de titre des pages, dans l'esprit des bandeaux du site adec.corsica :
 * aplat prune, titre en capitales, filet et trame de points safran.
 */

import React from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Bandeau plus haut pour la page d'accueil */
  size?: 'default' | 'large';
  /** Actions affichées à droite du titre (boutons) */
  actions?: React.ReactNode;
  /** Contenu ajouté sous la description (pastilles, mentions) */
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description, size = 'default', actions, children }) => {
  const isLarge = size === 'large';
  return (
    <section className="relative overflow-hidden bg-prune-600 text-white">
      {/* Décor : anneau translucide et trame de points safran */}
      <div aria-hidden="true" className="absolute -right-28 -top-28 w-96 h-96 rounded-full border-[48px] border-white/10" />
      <div
        aria-hidden="true"
        className={`absolute w-40 sm:w-64 adec-dots text-safran-300/70 ${actions ? 'top-0 right-10 sm:right-56 h-12 sm:h-14' : 'bottom-0 right-6 sm:right-24 h-16 sm:h-20'}`}
      />

      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 ${isLarge ? 'py-12 sm:py-16' : 'py-8 sm:py-10'}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safran-300 mb-2">{eyebrow}</p>
            )}
            <h1 className={`font-bold uppercase tracking-tight leading-tight ${isLarge ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              {title}
            </h1>
            <span aria-hidden="true" className="block w-16 h-1 bg-safran-300 mt-4" />
            {description && (
              <p className={`text-white/90 mt-4 leading-relaxed ${isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>{description}</p>
            )}
            {children}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>
    </section>
  );
};

/** Bouton d'action posé sur un bandeau prune : pilule blanche, comme les boutons du site ADEC */
export const heroActionClass =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-prune-700 hover:bg-safran-300 hover:text-neutral-900 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer';

/** Action secondaire sur un bandeau prune : pilule à contour blanc */
export const heroSecondaryActionClass =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-white/70 text-white hover:bg-white hover:text-prune-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer';
