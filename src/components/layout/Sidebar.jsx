'use client';

import React, { useMemo } from 'react';
import { REGIOES, TRT_LIST } from '@/config/trts';
import { cx, cardClass } from '@/components/ui/styles';
import { Keyboard } from 'lucide-react';

/**
 * Filtro por região (telas grandes).
 * Heurística 4 (Consistência): antes havia três lugares diferentes para filtrar região/favoritos,
 *   cada um com regra própria. Agora a região é escolhida aqui (desktop) ou nas "pílulas" da barra (celular),
 *   e favoritos é um filtro único na barra de ferramentas — as duas coisas se combinam.
 * Heurística 1: cada região mostra quantos tribunais tem.
 * Heurística 10: lista de atalhos de teclado sempre à vista.
 */
export default function Sidebar({ selectedRegion, onRegionChange }) {
  const counts = useMemo(() => {
    const c = { Todas: TRT_LIST.length };
    TRT_LIST.forEach((t) => {
      c[t.regiao] = (c[t.regiao] || 0) + 1;
    });
    return c;
  }, []);

  return (
    <aside className="hidden lg:block w-60 shrink-0 sticky top-24 space-y-4" aria-label="Filtros">
      <nav className={cx(cardClass, 'p-2')} aria-labelledby="regioes-title">
        <h2 id="regioes-title" className="px-3 pt-2 pb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">
          Região
        </h2>
        <ul className="space-y-0.5">
          {REGIOES.map((reg) => {
            const active = selectedRegion === reg;
            return (
              <li key={reg}>
                <button
                  type="button"
                  onClick={() => onRegionChange(reg)}
                  aria-current={active ? 'true' : undefined}
                  className={cx(
                    'w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-sm transition-colors',
                    active ? 'bg-accent-soft text-accent-text font-semibold' : 'text-fg hover:bg-surface-2'
                  )}
                >
                  <span>{reg === 'Todas' ? 'Todas as regiões' : reg}</span>
                  <span className={cx('text-xs tabular', active ? 'text-accent-text' : 'text-subtle')}>{counts[reg] || 0}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cx(cardClass, 'p-4')}>
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-muted">
          <Keyboard className="w-4 h-4" aria-hidden="true" />
          Atalhos
        </h2>
        <dl className="mt-3 space-y-2 text-[13px]">
          {[
            ['/', 'Buscar tribunal'],
            ['Alt + C', 'Copiar código'],
            ['Esc', 'Fechar janela / limpar busca'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <dt className="text-muted">{label}</dt>
              <dd>
                <kbd className="font-sans px-1.5 py-0.5 rounded border border-line bg-surface-2 text-xs text-muted whitespace-nowrap">{k}</kbd>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
