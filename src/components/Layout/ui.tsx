/**
 * Éléments d'interface communs de l'outil : boutons, champs, panneaux, badges, alertes et modale.
 * Style d'application métier : surfaces blanches bordées, angles discrets, prune réservé aux actions.
 */

import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

/** Largeur et marges du contenu des pages */
export const pageContainer = 'max-w-6xl mx-auto px-4 sm:px-6';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-prune-700 text-white hover:bg-prune-800 border border-prune-700 hover:border-prune-800',
  secondary: 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
  ghost: 'text-neutral-600 border border-transparent hover:bg-neutral-100 hover:text-neutral-900',
  danger: 'text-red-700 border border-transparent hover:bg-red-50 hover:text-red-800'
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1',
  md: 'h-8 px-3 text-sm gap-1.5'
};

/** Classes d'un bouton (ou d'un lien présenté comme un bouton) */
export const btn = (variant: ButtonVariant = 'secondary', size: ButtonSize = 'md') =>
  `inline-flex items-center justify-center shrink-0 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-prune-600 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`;

const iconBtnBase =
  'inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-500 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-prune-600';

/** Bouton carré ne contenant qu'une icône */
export const iconBtn = `${iconBtnBase} hover:text-neutral-900 hover:bg-neutral-100`;
/** Bouton-icône de suppression */
export const iconBtnDanger = `${iconBtnBase} hover:text-red-700 hover:bg-red-50`;

const inputBase =
  'w-full bg-white text-neutral-900 border border-neutral-300 rounded-md placeholder:text-neutral-400 focus:outline-none focus:border-prune-600 focus:ring-2 focus:ring-prune-600/15 disabled:bg-neutral-50 disabled:text-neutral-500';

export const inputClass = `${inputBase} px-2.5 py-1.5 text-sm`;
/** Champ compact (lignes de tableau, zones de code) */
export const inputSmClass = `${inputBase} px-2 py-1 text-xs`;

export const labelClass = 'block text-xs font-medium text-neutral-700 mb-1';
export const hintClass = 'text-[11px] text-neutral-500 mt-1';
export const linkClass = 'font-medium text-prune-700 hover:text-prune-900 underline underline-offset-2';

/** Ligne « case à cocher + libellé + précision », cliquable sur toute sa surface */
export const checkRowClass =
  'flex items-start gap-2.5 px-3 py-2.5 bg-white border border-neutral-200 rounded-md cursor-pointer hover:bg-neutral-50 transition-colors text-xs';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const BADGE_TONES: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-petrole-50 text-petrole-800 border-petrole-200',
  accent: 'bg-prune-50 text-prune-800 border-prune-200'
};

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; className?: string; title?: string }> = ({
  tone = 'neutral',
  children,
  className = '',
  title
}) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1 px-1.5 py-px rounded border text-[11px] font-medium leading-4 whitespace-nowrap ${BADGE_TONES[tone]} ${className}`}
  >
    {children}
  </span>
);

/** Pastille de couleur (statut du jeton, légende) */
export const StatusDot: React.FC<{ tone: Tone; className?: string }> = ({ tone, className = '' }) => {
  const color = { neutral: 'bg-neutral-400', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500', info: 'bg-petrole-500', accent: 'bg-prune-600' }[tone];
  return <span aria-hidden="true" className={`inline-block w-2 h-2 rounded-full shrink-0 ${color} ${className}`} />;
};

const NOTICE_TONES: Record<Exclude<Tone, 'accent'>, { box: string; icon: React.ElementType; iconClass: string }> = {
  neutral: { box: 'bg-neutral-50 border-neutral-200 text-neutral-700', icon: Info, iconClass: 'text-neutral-500' },
  info: { box: 'bg-petrole-50 border-petrole-200 text-petrole-950', icon: Info, iconClass: 'text-petrole-600' },
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-950', icon: CheckCircle2, iconClass: 'text-emerald-600' },
  warning: { box: 'bg-amber-50 border-amber-200 text-amber-950', icon: AlertTriangle, iconClass: 'text-amber-600' },
  danger: { box: 'bg-red-50 border-red-200 text-red-950', icon: AlertCircle, iconClass: 'text-red-600' }
};

/** Message contextuel : information, alerte, erreur ou confirmation */
export const Notice: React.FC<{
  tone?: Exclude<Tone, 'accent'>;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ tone = 'neutral', title, children, action, className = '' }) => {
  const { box, icon: Icon, iconClass } = NOTICE_TONES[tone];
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-relaxed ${box} ${className}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-px ${iconClass}`} />
      <div className="flex-1 min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

/** Bloc de contenu bordé avec barre de titre optionnelle */
export const Panel: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ElementType;
  headingLevel?: 2 | 3;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}> = ({ title, description, actions, icon: Icon, headingLevel = 2, children, className = '', bodyClassName = 'p-4 space-y-4' }) => {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return (
    <section className={`bg-white border border-neutral-200 rounded-md ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 border-b border-neutral-200">
          <div className="min-w-0">
            {title && (
              <Heading className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                {Icon && <Icon className="w-4 h-4 text-neutral-400 shrink-0" />}
                {title}
              </Heading>
            )}
            {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children !== undefined && children !== null && children !== false && <div className={bodyClassName}>{children}</div>}
    </section>
  );
};

/** Rangée de chiffres clés séparés par des filets */
export const StatGrid: React.FC<{
  /** valueClassName remplace la couleur du chiffre (text-neutral-900 par défaut) */
  items: { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode; valueClassName?: string }[];
  columnsClassName?: string;
  className?: string;
}> = ({ items, columnsClassName = 'grid-cols-2 lg:grid-cols-4', className = '' }) => (
  <dl className={`grid ${columnsClassName} gap-px bg-neutral-200 border border-neutral-200 rounded-md overflow-hidden ${className}`}>
    {items.map((item, i) => (
      <div key={i} className="bg-white px-4 py-3 min-w-0">
        <dt className="text-[11px] text-neutral-500">{item.label}</dt>
        <dd className={`mt-0.5 text-lg font-semibold tabular-nums leading-tight ${item.valueClassName || 'text-neutral-900'}`}>{item.value}</dd>
        {item.hint && <dd className="text-[11px] text-neutral-500 mt-0.5">{item.hint}</dd>}
      </div>
    ))}
  </dl>
);

/** En-tête d'une étape ou d'une sous-partie de page */
export const SectionHeading: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
    <div className="min-w-0">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description && <p className="text-xs text-neutral-500 mt-0.5 max-w-3xl">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

/** Choix exclusif compact (filtres, vues) */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode; title?: string }[];
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex flex-wrap items-center gap-0.5 p-0.5 bg-neutral-100 border border-neutral-200 rounded-md text-xs">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              active ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-200' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const MODAL_SIZES = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl'
};

/** Fenêtre modale : en-tête titré, corps défilant, pied d'actions ; Échap pour fermer */
export const Modal: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof MODAL_SIZES;
  children: React.ReactNode;
  bodyClassName?: string;
}> = ({ title, subtitle, onClose, headerActions, footer, size = 'lg', children, bodyClassName = 'p-4' }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/40" role="dialog" aria-modal="true">
      <div className={`bg-white w-full ${MODAL_SIZES[size]} max-h-[92vh] flex flex-col rounded-md border border-neutral-200 shadow-xl overflow-hidden`}>
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-neutral-200">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button type="button" onClick={onClose} className={iconBtn} title="Fermer (Échap)" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className={`flex-1 min-h-0 overflow-y-auto ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-neutral-200 bg-neutral-50">{footer}</div>
        )}
      </div>
    </div>
  );
};
