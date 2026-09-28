'use client';

import React from 'react';
import { Star, ExternalLink, Copy, LogIn } from 'lucide-react';
import { btn, cx, cardClass } from '@/components/ui/styles';
import { trtSigla, hasSeparatePje2g } from './trtUtils';

const NewTab = () => <span className="sr-only"> (abre em nova aba)</span>;

/**
 * Botão de favorito — usado no card e na lista (mesmo componente = mesmo comportamento).
 */
export function FavoriteButton({ trt, isFavorite, onToggle, size = 'icon' }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(trt.id)}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remover ${trt.nome} dos favoritos` : `Adicionar ${trt.nome} aos favoritos`}
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cx(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        size === 'iconSm' ? 'h-8 w-8' : 'h-9 w-9',
        isFavorite ? 'text-favorite hover:bg-warning-soft' : 'text-subtle hover:text-favorite hover:bg-surface-2'
      )}
    >
      <Star className={cx('w-[18px] h-[18px]', isFavorite && 'fill-current')} aria-hidden="true" />
    </button>
  );
}

/**
 * Card de um tribunal.
 * Heurística 8 (Estética minimalista): uma ação principal clara ("Entrar no PJe") e links
 *   secundários discretos, em vez de quatro botões com o mesmo peso visual.
 * Heurística 2: "TST" aparece como TST (antes aparecia "TRT-TST").
 * Heurística 1: o rótulo do botão diz exatamente o que vai acontecer (copiar código + abrir).
 */
export default function TrtCard({ trt, isFavorite, onToggleFavorite, hasOtp, onOpenPje }) {
  const separate2g = hasSeparatePje2g(trt);

  const secondary = [
    separate2g && { href: trt.pje2g, label: 'PJe 2º grau' },
    { href: trt.portal, label: 'Portal' },
    trt.balcaoVirtual && { href: trt.balcaoVirtual, label: 'Balcão virtual' },
  ].filter(Boolean);

  return (
    <article className={cx(cardClass, 'p-5 flex flex-col gap-4 transition-colors hover:border-line-strong')} aria-labelledby={`${trt.id}-title`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-accent-text tabular">
            {trtSigla(trt)} <span className="text-subtle font-normal">· {trt.uf} · {trt.regiao}</span>
          </p>
          <h3 id={`${trt.id}-title`} className="mt-1 font-semibold text-[17px] text-fg leading-snug">
            {trt.nome}
          </h3>
          <p className="text-[13px] text-muted mt-0.5 line-clamp-1" title={trt.estado}>
            {trt.estado}
          </p>
        </div>
        <FavoriteButton trt={trt} isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={() => onOpenPje(trt, trt.pje1g)}
          className={btn('primary', 'md', 'w-full')}
          title={hasOtp ? 'Copia o código de verificação e abre o PJe em nova aba' : 'Abre o PJe em nova aba'}
        >
          {hasOtp ? <Copy className="w-4 h-4" aria-hidden="true" /> : <LogIn className="w-4 h-4" aria-hidden="true" />}
          {hasOtp ? 'Copiar código e abrir PJe' : 'Abrir PJe'}
          {separate2g && <span className="font-normal opacity-80">1º grau</span>}
          <NewTab />
        </button>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
          {secondary.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted hover:text-accent-text hover:underline underline-offset-2 rounded"
              >
                {l.label}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <NewTab />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
