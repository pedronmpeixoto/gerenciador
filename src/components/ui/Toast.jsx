'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cx } from './styles';

/**
 * Notificação Toast.
 * Heurística 1 (Visibilidade do status): confirma toda ação e some sozinha.
 * Heurística 3 (Controle e liberdade): aceita uma ação opcional, como "Desfazer".
 * Heurística 9 (Recuperação de erros): erros ficam mais tempo e são anunciados ao leitor de tela.
 */
const TYPES = {
  success: { icon: CheckCircle2, iconClass: 'text-success', bar: 'bg-success' },
  error: { icon: AlertCircle, iconClass: 'text-danger', bar: 'bg-danger' },
  info: { icon: Info, iconClass: 'text-accent-text', bar: 'bg-accent' },
};

export default function Toast({ id, message, type = 'success', action, onClose }) {
  const hasAction = Boolean(action);
  const duration = type === 'error' ? 7000 : hasAction ? 6500 : 3500;

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [id, message, duration, onClose]);

  if (!message) return null;

  const style = TYPES[type] || TYPES.info;
  const Icon = style.icon;

  return (
    <div className="fixed z-[60] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px]">
      <div
        key={id}
        role={type === 'error' ? 'alert' : 'status'}
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        className="relative overflow-hidden flex items-start gap-3 pl-4 pr-2 py-3 rounded-xl bg-surface border border-line shadow-pop animate-toast-in"
      >
        <span className={cx('absolute left-0 top-0 bottom-0 w-1', style.bar)} aria-hidden="true" />
        <Icon className={cx('w-5 h-5 shrink-0 mt-px', style.iconClass)} aria-hidden="true" />
        <p className="text-sm text-fg flex-1 pt-px">{message}</p>
        {hasAction && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className="text-sm font-semibold text-accent-text hover:underline px-2 h-7 rounded-md shrink-0"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="grid place-items-center w-7 h-7 rounded-md text-subtle hover:text-fg hover:bg-surface-2 shrink-0"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
