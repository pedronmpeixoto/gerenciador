'use client';

import React from 'react';
import TrtCard, { FavoriteButton } from './TrtCard';
import { REGIOES } from '@/config/trts';
import { Search, Star, LayoutGrid, List, Plus, ExternalLink, Trash2, X, Copy, LogIn, Link2, SearchX } from 'lucide-react';
import { btn, badge, cx, cardClass, inputClass } from '@/components/ui/styles';
import { trtSigla, hasSeparatePje2g, urlHost } from './trtUtils';

/**
 * Barra de ferramentas + lista de tribunais.
 *
 * Heurística 1: resumo "X de Y tribunais" e filtros ativos sempre visíveis.
 * Heurística 3: cada filtro ativo pode ser removido individualmente, ou todos de uma vez.
 * Heurística 4: um único controle por função (antes: favoritos em 3 lugares, "adicionar link" em 2).
 * Heurística 7: "/" foca a busca; Esc limpa.
 * Heurística 9: estados vazios dizem o motivo e oferecem a correção.
 */
export default function TrtGrid({
  trts,
  totalCount,
  favorites,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedRegion,
  onRegionChange,
  onlyFavorites,
  onOnlyFavoritesChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  customLinks,
  onOpenAddLinkModal,
  onDeleteCustomLink,
  hasOtp,
  onOpenPje,
  onShowToast,
}) {
  const hasFilters = Boolean(searchQuery) || selectedRegion !== 'Todas' || onlyFavorites;

  const copyUrl = async (url, title) => {
    try {
      await navigator.clipboard.writeText(url);
      onShowToast?.(`Endereço de "${title}" copiado.`, 'info');
    } catch {
      onShowToast?.('Não foi possível copiar o endereço.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* ---------- Barra de ferramentas ---------- */}
      <div className={cx(cardClass, 'p-3 md:p-4 flex flex-col gap-3')}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <label htmlFor="busca-trt" className="sr-only">
              Buscar tribunal
            </label>
            <Search className="w-[18px] h-[18px] text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="busca-trt"
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchQuery) {
                  e.preventDefault();
                  onSearchChange('');
                }
              }}
              placeholder="Buscar por número, estado ou UF — ex.: 2, São Paulo, MG"
              autoComplete="off"
              aria-keyshortcuts="/"
              className={cx(inputClass, 'pl-10 pr-12 [&::-webkit-search-cancel-button]:hidden')}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef?.current?.focus();
                }}
                className={btn('ghost', 'iconSm', 'absolute right-1 top-1/2 -translate-y-1/2')}
                aria-label="Limpar busca"
                title="Limpar busca (Esc)"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 font-sans px-1.5 py-0.5 rounded border border-line bg-surface-2 text-xs text-subtle pointer-events-none">
                /
              </kbd>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOnlyFavoritesChange(!onlyFavorites)}
              aria-pressed={onlyFavorites}
              className={btn(
                'secondary',
                'md',
                onlyFavorites ? 'bg-accent-soft border-accent/40 text-accent-text hover:bg-accent-soft' : ''
              )}
            >
              <Star className={cx('w-4 h-4', onlyFavorites ? 'fill-current text-favorite' : 'text-subtle')} aria-hidden="true" />
              Favoritos
              <span className="tabular text-xs text-subtle">{favorites.length}</span>
            </button>

            <div className="flex items-center p-0.5 rounded-lg border border-line bg-surface-2" role="group" aria-label="Modo de exibição">
              {[
                { id: 'grid', label: 'Cartões', icon: LayoutGrid },
                { id: 'list', label: 'Lista', icon: List },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewModeChange(id)}
                  aria-pressed={viewMode === id}
                  aria-label={`Exibir em ${label.toLowerCase()}`}
                  title={label}
                  className={cx(
                    'grid place-items-center h-9 w-9 rounded-md transition-colors',
                    viewMode === id ? 'bg-surface text-fg shadow-card' : 'text-subtle hover:text-fg'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </button>
              ))}
            </div>

            <button type="button" onClick={onOpenAddLinkModal} className={btn('secondary', 'md', 'ml-auto md:ml-0')}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Novo link</span>
              <span className="sm:hidden">Link</span>
            </button>
          </div>
        </div>

        {/* Regiões — apenas em telas menores (no desktop ficam na lateral) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1" role="group" aria-label="Filtrar por região">
          {REGIOES.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => onRegionChange(reg)}
              aria-pressed={selectedRegion === reg}
              className={cx(
                'h-8 px-3 rounded-full text-[13px] whitespace-nowrap border transition-colors',
                selectedRegion === reg
                  ? 'bg-accent text-on-accent border-accent font-medium'
                  : 'bg-surface text-muted border-line hover:text-fg hover:border-line-strong'
              )}
            >
              {reg === 'Todas' ? 'Todas as regiões' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Meus links ---------- */}
      {customLinks?.length > 0 && (
        <section aria-labelledby="meus-links-title" className={cx(cardClass, 'p-4 md:p-5')}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 id="meus-links-title" className="font-semibold text-fg flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent-text" aria-hidden="true" />
              Meus links
              <span className="text-[13px] font-normal text-subtle tabular">({customLinks.length})</span>
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {customLinks.map((link) => (
              <li key={link.id} className="flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-lg border border-line bg-surface hover:border-line-strong transition-colors">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 rounded group">
                  <span className="block text-sm font-medium text-fg truncate group-hover:text-accent-text group-hover:underline underline-offset-2">
                    {link.titulo}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </span>
                  <span className="block text-xs text-subtle truncate">
                    {urlHost(link.url)}
                    {link.trtAlvo && !link.trtAlvo.startsWith('Geral') ? ` · ${link.trtAlvo}` : ''}
                  </span>
                </a>
                {link.categoria && link.categoria !== 'Personalizado' && (
                  <span className={badge('neutral', 'hidden md:inline-flex')}>{link.categoria}</span>
                )}
                <button type="button" onClick={() => copyUrl(link.url, link.titulo)} className={btn('ghost', 'iconSm')} aria-label={`Copiar endereço de ${link.titulo}`} title="Copiar endereço">
                  <Copy className="w-4 h-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => onDeleteCustomLink(link)} className={btn('dangerGhost', 'iconSm')} aria-label={`Excluir ${link.titulo}`} title="Excluir (pode desfazer)">
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Resumo e filtros ativos ---------- */}
      <div className="flex flex-wrap items-center gap-2 min-h-8 px-1" aria-live="polite">
        <p className="text-sm text-muted mr-1">
          {hasFilters ? (
            <>
              <strong className="text-fg tabular">{trts.length}</strong> de {totalCount} tribunais
            </>
          ) : (
            <>
              <strong className="text-fg tabular">{totalCount}</strong> tribunais da Justiça do Trabalho
            </>
          )}
        </p>
        {searchQuery && <FilterChip label={`Busca: "${searchQuery}"`} onRemove={() => onSearchChange('')} />}
        {selectedRegion !== 'Todas' && <FilterChip label={`Região: ${selectedRegion}`} onRemove={() => onRegionChange('Todas')} />}
        {onlyFavorites && <FilterChip label="Só favoritos" onRemove={() => onOnlyFavoritesChange(false)} />}
        {hasFilters && (
          <button type="button" onClick={onResetFilters} className="text-[13px] font-medium text-accent-text hover:underline rounded px-1">
            Limpar filtros
          </button>
        )}
      </div>

      {/* ---------- Resultados ---------- */}
      {trts.length === 0 ? (
        <EmptyState onlyFavorites={onlyFavorites} favoritesCount={favorites.length} searchQuery={searchQuery} onResetFilters={onResetFilters} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trts.map((trt) => (
            <TrtCard
              key={trt.id}
              trt={trt}
              isFavorite={favorites.includes(trt.id)}
              onToggleFavorite={onToggleFavorite}
              hasOtp={hasOtp}
              onOpenPje={onOpenPje}
            />
          ))}
        </div>
      ) : (
        <ul className={cx(cardClass, 'divide-y divide-line overflow-hidden')}>
          {trts.map((trt) => (
            <li key={trt.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-surface-2/60 transition-colors">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FavoriteButton trt={trt} isFavorite={favorites.includes(trt.id)} onToggle={onToggleFavorite} size="iconSm" />
                <span className="w-16 shrink-0 text-[13px] font-semibold text-accent-text tabular">{trtSigla(trt)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{trt.nome}</p>
                  <p className="text-xs text-muted truncate">
                    {trt.estado} · {trt.regiao}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap md:justify-end pl-10 md:pl-0">
                <button type="button" onClick={() => onOpenPje(trt, trt.pje1g)} className={btn('primary', 'sm')}>
                  {hasOtp ? <Copy className="w-3.5 h-3.5" aria-hidden="true" /> : <LogIn className="w-3.5 h-3.5" aria-hidden="true" />}
                  {hasSeparatePje2g(trt) ? 'PJe 1º grau' : 'PJe'}
                  <span className="sr-only">{hasOtp ? ' — copia o código e abre em nova aba' : ' (abre em nova aba)'}</span>
                </button>
                {hasSeparatePje2g(trt) && (
                  <button type="button" onClick={() => onOpenPje(trt, trt.pje2g)} className={btn('secondary', 'sm')}>
                    PJe 2º grau
                    <span className="sr-only">{hasOtp ? ' — copia o código e abre em nova aba' : ' (abre em nova aba)'}</span>
                  </button>
                )}
                <a href={trt.portal} target="_blank" rel="noopener noreferrer" className={btn('ghost', 'sm')}>
                  Portal <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-accent-soft text-accent-text text-[13px] font-medium max-w-[260px]">
      <span className="truncate">{label}</span>
      <button type="button" onClick={onRemove} className="grid place-items-center w-5 h-5 rounded-full hover:bg-accent/15" aria-label={`Remover filtro ${label}`}>
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

function EmptyState({ onlyFavorites, favoritesCount, searchQuery, onResetFilters }) {
  const noFavorites = onlyFavorites && favoritesCount === 0;
  return (
    <div className={cx(cardClass, 'py-14 px-6 text-center')}>
      <div className="mx-auto grid place-items-center w-12 h-12 rounded-xl bg-surface-2 text-subtle">
        {noFavorites ? <Star className="w-6 h-6" aria-hidden="true" /> : <SearchX className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 font-semibold text-fg">
        {noFavorites ? 'Você ainda não tem favoritos' : searchQuery ? `Nenhum tribunal encontrado para "${searchQuery}"` : 'Nenhum tribunal com esses filtros'}
      </h3>
      <p className="text-sm text-muted mt-1 max-w-md mx-auto">
        {noFavorites
          ? 'Clique na estrela de um tribunal para fixá-lo aqui e acessá-lo mais rápido.'
          : 'Tente buscar pelo número (ex.: 15), pela sigla do estado (ex.: SP) ou remova algum filtro.'}
      </p>
      <button type="button" onClick={onResetFilters} className={btn('secondary', 'md', 'mt-5')}>
        {noFavorites ? 'Ver todos os tribunais' : 'Limpar filtros'}
      </button>
    </div>
  );
}
