'use client';

import React from 'react';
import { useOtp } from '@/hooks/useOtp';
import { useTheme } from '@/hooks/useTheme';
import { getCertificateStatus } from '@/services/certificateService';
import { Scale, Copy, Check, ChevronDown, Moon, Sun, ShieldCheck, ShieldAlert } from 'lucide-react';
import { btn, cx } from '@/components/ui/styles';
import CountdownRing from '@/components/otp/CountdownRing';

/**
 * Cabeçalho fixo.
 * Heurística 1: mostra, o tempo todo, qual certificado está em uso, se ele é válido
 *               e o código atual com o tempo restante.
 * Heurística 7: copiar o código a partir de qualquer ponto da página, com 1 clique (ou Alt+C).
 * Heurística 8: sem relógio e selos decorativos — só o que ajuda a decidir.
 */
export default function Header({ activeCertificate, onOpenCertManager, onShowToast }) {
  const secretKey = activeCertificate?.secretOtp || '';
  const { code, remainingSeconds, percentRemaining, isValid, copied, copyToClipboard } = useOtp(secretKey);
  const { theme, toggleTheme } = useTheme();

  const status = activeCertificate ? getCertificateStatus(activeCertificate.validade) : null;
  const StatusIcon = status?.tone === 'success' ? ShieldCheck : ShieldAlert;
  const statusColor = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[status?.tone] || 'text-subtle';

  const handleCopyOtp = async () => {
    const ok = await copyToClipboard();
    onShowToast?.(
      ok ? `Código ${code} copiado. Válido por mais ${remainingSeconds}s.` : 'Não foi possível copiar. Selecione o código e copie manualmente.',
      ok ? 'success' : 'error'
    );
  };

  const formatted = code?.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between gap-3">
        {/* Marca */}
        <a href="#conteudo" className="flex items-center gap-3 min-w-0 rounded-lg" aria-label="Gerenciador TRT — ir para o conteúdo">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-accent text-on-accent shrink-0">
            <Scale className="w-[18px] h-[18px]" aria-hidden="true" />
          </span>
          <span className="hidden sm:block min-w-0 leading-tight">
            <span className="block font-semibold text-[15px] text-fg truncate">Gerenciador TRT</span>
            <span className="hidden md:block text-xs text-muted truncate">Justiça do Trabalho · PJe e Certificado A1</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          {/* Código atual — atalho rápido */}
          {activeCertificate && isValid && (
            <button
              type="button"
              onClick={handleCopyOtp}
              className={btn('secondary', 'md', 'px-3 gap-2.5')}
              aria-label={`Copiar código de verificação ${code}. Renova em ${remainingSeconds} segundos. Atalho: Alt+C`}
              title="Copiar código (Alt+C)"
            >
              <CountdownRing percent={percentRemaining} seconds={remainingSeconds} size={20} />
              <span className="font-mono text-[15px] font-semibold tracking-wide tabular text-fg">{formatted}</span>
              {copied ? (
                <Check className="w-4 h-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4 text-subtle" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Certificado em uso */}
          <button
            type="button"
            onClick={onOpenCertManager}
            className={btn('secondary', 'md', 'px-3 max-w-[220px]')}
            aria-label={
              activeCertificate
                ? `Certificado em uso: ${activeCertificate.titular}. ${status?.label}. Clique para trocar ou gerenciar.`
                : 'Nenhum certificado. Clique para cadastrar.'
            }
            title={status?.label || 'Cadastrar certificado'}
          >
            <StatusIcon className={cx('w-4 h-4 shrink-0', statusColor)} aria-hidden="true" />
            <span className="hidden md:inline truncate">
              {activeCertificate ? activeCertificate.titular : 'Cadastrar certificado'}
            </span>
            <ChevronDown className="w-4 h-4 text-subtle shrink-0" aria-hidden="true" />
          </button>

          {/* Tema */}
          <button
            type="button"
            onClick={toggleTheme}
            className={btn('ghost', 'icon')}
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" aria-hidden="true" /> : <Moon className="w-[18px] h-[18px]" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
