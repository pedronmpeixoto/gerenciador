'use client';

import React, { useState } from 'react';
import { useOtp } from '@/hooks/useOtp';
import { getCertificateStatus } from '@/services/certificateService';
import { Copy, Check, Eye, EyeOff, KeyRound, HelpCircle, ArrowLeftRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { btn, badge, cardClass, cx } from '@/components/ui/styles';
import CountdownRing from './CountdownRing';

/**
 * Painel do código de verificação (TOTP / 2FA) do Certificado A1.
 *
 * Heurística 1 (Visibilidade do status): código grande, contagem regressiva em texto + anel,
 *   e estado do certificado sempre visível.
 * Heurística 2 (Mundo real): "código de verificação" em vez de jargão (A2F, TOTP, Base32) no texto principal.
 * Heurística 6 (Reconhecer em vez de lembrar): dados do certificado ao lado do código.
 * Heurística 10 (Ajuda): explicação curta, recolhível, de onde vem a chave secreta.
 */
export default function OtpWidget({ activeCertificate, isLoading = false, onOpenCertManager, onShowToast }) {
  const [showSecret, setShowSecret] = useState(false);

  const secretKey = activeCertificate?.secretOtp || '';
  const { code, remainingSeconds, percentRemaining, isValid, copied, copyToClipboard } = useOtp(secretKey);

  const certStatus = activeCertificate ? getCertificateStatus(activeCertificate.validade) : null;

  const handleCopy = async () => {
    const ok = await copyToClipboard();
    if (ok) {
      onShowToast?.(
        remainingSeconds <= 5
          ? `Código copiado, mas expira em ${remainingSeconds}s. Se não der tempo, copie o próximo.`
          : `Código ${code} copiado. Cole no PJe — válido por mais ${remainingSeconds}s.`,
        remainingSeconds <= 5 ? 'info' : 'success'
      );
    } else {
      onShowToast?.('Não foi possível copiar. Selecione o código e use Ctrl+C.', 'error');
    }
  };

  const digits = code && code.length === 6 ? [code.slice(0, 3), code.slice(3)] : [code];
  const secretMasked = secretKey ? `${secretKey.slice(0, 4)}${'•'.repeat(Math.max(0, Math.min(secretKey.length - 4, 12)))}` : '';

  /* ---------- Carregando: evita mostrar "sem certificado" por engano ---------- */
  if (isLoading) {
    return (
      <section aria-busy="true" aria-label="Carregando certificado" className={cx(cardClass, 'p-6 md:p-7')}>
        <div className="h-3 w-48 rounded bg-surface-2 animate-pulse" />
        <div className="mt-5 h-12 w-64 rounded-lg bg-surface-2 animate-pulse" />
        <div className="mt-5 h-11 w-40 rounded-lg bg-surface-2 animate-pulse" />
      </section>
    );
  }

  /* ---------- Estado vazio / erro: explica e oferece a saída ---------- */
  if (!activeCertificate || !isValid) {
    return (
      <section aria-labelledby="otp-title" className={cx(cardClass, 'p-6 md:p-8')}>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="grid place-items-center w-12 h-12 rounded-xl bg-warning-soft text-warning shrink-0">
            <KeyRound className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="otp-title" className="text-lg font-semibold text-fg">
              {activeCertificate ? 'A chave secreta deste certificado não é válida' : 'Configure seu certificado para gerar o código'}
            </h2>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              {activeCertificate
                ? 'A chave deve conter apenas letras de A a Z e números de 2 a 7. Edite o certificado e cole a chave exatamente como foi fornecida pelo PJe.'
                : 'Cadastre a chave secreta da autenticação em dois fatores do PJe. O código de 6 dígitos passa a ser gerado aqui automaticamente.'}
            </p>
          </div>
          <button type="button" onClick={onOpenCertManager} className={btn('primary', 'md')}>
            {activeCertificate ? 'Corrigir certificado' : 'Cadastrar certificado'}
          </button>
        </div>
      </section>
    );
  }

  const StatusIcon = certStatus?.tone === 'success' ? ShieldCheck : ShieldAlert;

  return (
    <section aria-labelledby="otp-title" className={cx(cardClass, 'overflow-hidden')}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)]">
        {/* ---------- Código ---------- */}
        <div className="p-6 md:p-7 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-3">
            <h2 id="otp-title" className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              Código de verificação (2FA)
            </h2>
            <span className={badge('success')}>
              <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
              Gerando
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 md:gap-6">
            <output
              aria-label={`Código atual: ${code.split('').join(' ')}`}
              className="font-mono tabular text-[44px] md:text-[52px] leading-none font-semibold tracking-[0.06em] text-fg select-all"
            >
              {digits.map((g, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="inline-block w-3 md:w-4" aria-hidden="true" />}
                  {g}
                </React.Fragment>
              ))}
            </output>

            <div className="flex items-center gap-3" aria-hidden="true">
              <CountdownRing percent={percentRemaining} seconds={remainingSeconds} size={44} showLabel />
              <span className="text-sm text-muted leading-tight">
                novo código
                <br />
                em <span className="tabular font-medium text-fg">{remainingSeconds}s</span>
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={btn(copied ? 'secondary' : 'primary', 'lg', copied ? 'text-success border-success/40' : '')}
              aria-keyshortcuts="Alt+C"
            >
              {copied ? <Check className="w-[18px] h-[18px]" aria-hidden="true" /> : <Copy className="w-[18px] h-[18px]" aria-hidden="true" />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <span className="text-[13px] text-subtle hidden sm:inline">
              ou pressione <kbd className="font-sans px-1.5 py-0.5 rounded border border-line bg-surface-2 text-xs text-muted">Alt</kbd> +{' '}
              <kbd className="font-sans px-1.5 py-0.5 rounded border border-line bg-surface-2 text-xs text-muted">C</kbd>
            </span>
          </div>
        </div>

        {/* ---------- Certificado em uso ---------- */}
        <div className="p-6 md:p-7 bg-surface-2/60 border-t lg:border-t-0 lg:border-l border-line flex flex-col gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Certificado em uso</p>
            <p className="mt-2 font-semibold text-fg leading-snug">{activeCertificate.titular}</p>
            <p className="text-[13px] text-muted mt-0.5">
              {[activeCertificate.oab, activeCertificate.emissor].filter(Boolean).join(' · ') || 'ICP-Brasil'}
            </p>
            {certStatus && (
              <span className={badge(certStatus.tone, 'mt-3')}>
                <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {certStatus.label}
              </span>
            )}
          </div>

          <div>
            <p id="otp-secret-label" className="text-[13px] text-muted mb-1.5">Chave secreta</p>
            <div className="flex items-center gap-1 pl-3 pr-1 h-9 rounded-lg bg-surface border border-line">
              <code id="otp-secret" aria-labelledby="otp-secret-label" className="flex-1 min-w-0 truncate font-mono text-[13px] text-muted">
                {showSecret ? secretKey : secretMasked}
              </code>
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className={btn('ghost', 'iconSm', 'h-7 w-7')}
                aria-pressed={showSecret}
                aria-controls="otp-secret"
                aria-label={showSecret ? 'Ocultar chave secreta' : 'Mostrar chave secreta'}
                title={showSecret ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showSecret ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" onClick={onOpenCertManager} className={btn('secondary', 'sm')}>
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              Trocar certificado
            </button>
            <details className="text-[13px] text-muted w-full sm:w-auto lg:w-full xl:w-auto">
              <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-accent-text font-medium hover:underline rounded">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                Onde encontro a chave?
              </summary>
              <p className="mt-2 leading-relaxed">
                Ao ativar a autenticação em dois fatores no PJe, o sistema mostra um QR Code e uma chave de texto
                (ex.: <span className="font-mono">JBSW Y3DP EHPK 3PXP</span>). Cole essa chave no cadastro do certificado.
                O código gerado aqui é o mesmo do aplicativo autenticador.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
