'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { btn, cx } from './styles';

/**
 * Modal acessível e reutilizável.
 * Heurística 3 (Controle e liberdade): fecha com Esc, clique fora ou no "X".
 * Heurística 4 (Consistência): todos os diálogos têm o mesmo cabeçalho e comportamento.
 */
export default function Modal({ isOpen, onClose, title, description, icon: Icon, size = 'md', children }) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);
  const lastFocused = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    lastFocused.current = document.activeElement;

    const panel = panelRef.current;
    // Foca o primeiro campo (ou o próprio painel) ao abrir
    const first = panel?.querySelector('[data-autofocus]') || panel;
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      // Mantém o foco dentro do diálogo
      const focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cx(
          'relative w-full bg-surface border border-line shadow-pop flex flex-col max-h-[92vh] animate-pop-in',
          'rounded-t-2xl sm:rounded-2xl outline-none',
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="mt-0.5 grid place-items-center w-9 h-9 rounded-lg bg-accent-soft text-accent-text shrink-0">
                <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-[17px] font-semibold text-fg leading-snug">
                {title}
              </h2>
              {description && (
                <p id={descId} className="text-[13px] text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className={btn('ghost', 'iconSm', '-mr-2')} aria-label="Fechar (Esc)" title="Fechar (Esc)">
            <X className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
