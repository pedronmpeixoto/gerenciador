'use client';

import React, { useState } from 'react';
import {
  validateCertificateData,
  getCertificateStatus,
  formatDateBR,
  formatDocumento,
} from '@/services/certificateService';
import { generateRandomSecret, sanitizeSecret } from '@/services/otpService';
import { ShieldCheck, ShieldAlert, Plus, Trash2, AlertCircle, ArrowLeft, Check, Wand2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { btn, badge, cx, inputClass, labelClass, hintClass, errorClass } from '@/components/ui/styles';

const emptyForm = () => ({
  titular: '',
  documento: '',
  oab: '',
  emissor: 'AC Certisign / ICP-Brasil',
  validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  tipo: 'Certificado A1 (PF)',
  secretOtp: '',
  isPadrao: true,
});

/**
 * Gerenciar certificados A1.
 *
 * Heurística 5 (Prevenção de erros): máscara de CPF/CNPJ, validação da chave enquanto digita,
 *   confirmação antes de excluir.
 * Heurística 6 (Reconhecer): cada certificado mostra titular, documento, validade e status em texto.
 * Heurística 9 (Recuperação de erros): mensagens junto ao campo, dizendo como corrigir.
 */
export default function CertificateManager({
  isOpen,
  onClose,
  certificates,
  activeCertId,
  onSelectActiveCert,
  onAddCertificate,
  onDeleteCertificate,
  onShowToast,
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleClose = () => {
    setConfirmDeleteId(null);
    setIsAddingNew(false);
    setErrors({});
    onClose();
  };

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleGenerateSampleSecret = () => {
    set('secretOtp', generateRandomSecret());
    onShowToast?.('Chave de teste gerada. Use apenas para experimentar — ela não funciona no PJe.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = { ...formData, secretOtp: sanitizeSecret(formData.secretOtp) };
    const validation = validateCertificateData(cleaned);

    if (!validation.valid) {
      setErrors(validation.errors);
      // Leva o foco ao primeiro campo com erro
      const first = ['titular', 'documento', 'validade', 'secretOtp'].find((f) => validation.errors[f]);
      document.getElementById(`cert-${first}`)?.focus();
      return;
    }

    onAddCertificate(cleaned);
    setIsAddingNew(false);
    setFormData(emptyForm());
    setErrors({});
    onShowToast?.(
      cleaned.isPadrao ? `Certificado de ${cleaned.titular} cadastrado e em uso.` : `Certificado de ${cleaned.titular} cadastrado.`,
      'success'
    );
  };

  const handleSelect = (cert) => {
    onSelectActiveCert(cert.id);
    onShowToast?.(`Agora usando o certificado de ${cert.titular}.`, 'success');
  };

  const handleDelete = (cert) => {
    onDeleteCertificate(cert.id);
    setConfirmDeleteId(null);
    onShowToast?.(`Certificado de ${cert.titular} excluído.`, 'info');
  };

  // Validação ao vivo da chave (sem bloquear a digitação)
  const secretClean = sanitizeSecret(formData.secretOtp);
  const secretHasBadChars = secretClean.length > 0 && !/^[A-Z2-7]*=*$/.test(secretClean);
  const secretOk = secretClean.length >= 8 && !secretHasBadChars;

  const fieldError = (field) =>
    errors[field] ? (
      <p id={`cert-${field}-error`} className={errorClass}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
        {errors[field]}
      </p>
    ) : null;

  const aria = (field, hintId) => ({
    id: `cert-${field}`,
    'aria-invalid': errors[field] ? 'true' : 'false',
    'aria-describedby': [errors[field] && `cert-${field}-error`, hintId].filter(Boolean).join(' ') || undefined,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={ShieldCheck}
      size="lg"
      title={isAddingNew ? 'Novo certificado A1' : 'Certificados A1'}
      description={
        isAddingNew
          ? 'Os dados ficam salvos apenas neste navegador.'
          : 'Escolha qual certificado gera o código de verificação.'
      }
    >
      {!isAddingNew ? (
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted">Nenhum certificado cadastrado ainda.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {certificates.map((cert) => {
                const status = getCertificateStatus(cert.validade);
                const isActive = cert.id === activeCertId;
                const StatusIcon = status.tone === 'success' ? ShieldCheck : ShieldAlert;
                const confirming = confirmDeleteId === cert.id;

                return (
                  <li
                    key={cert.id}
                    className={cx(
                      'rounded-xl border p-4 transition-colors',
                      isActive ? 'border-accent/50 bg-accent-soft/50' : 'border-line hover:border-line-strong'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-fg">{cert.titular}</p>
                          {isActive && (
                            <span className={badge('accent')}>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              Em uso
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-muted mt-0.5">
                          {[cert.documento, cert.oab].filter(Boolean).join(' · ')}
                        </p>
                        <span className={badge(status.tone, 'mt-2')}>
                          <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          {status.label}
                        </span>
                      </div>

                      {!confirming && (
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {!isActive && (
                            <button type="button" onClick={() => handleSelect(cert)} className={btn('secondary', 'sm')}>
                              Usar este
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(cert.id)}
                            disabled={certificates.length === 1}
                            className={btn('dangerGhost', 'iconSm')}
                            aria-label={
                              certificates.length === 1
                                ? 'Não é possível excluir: é necessário ter ao menos um certificado'
                                : `Excluir certificado de ${cert.titular}`
                            }
                            title={certificates.length === 1 ? 'Cadastre outro certificado antes de excluir este' : 'Excluir'}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>

                    {confirming && (
                      <div role="alert" className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-danger-soft border border-danger/30">
                        <p className="text-[13px] text-fg flex-1">
                          Excluir o certificado de <strong>{cert.titular}</strong>? A chave secreta será apagada deste navegador
                          {isActive && certificates.length > 1 ? ' e outro certificado passará a ser usado' : ''}.
                        </p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className={btn('secondary', 'sm')} autoFocus>
                            Cancelar
                          </button>
                          <button type="button" onClick={() => handleDelete(cert)} className={btn('danger', 'sm')}>
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <button type="button" onClick={() => setIsAddingNew(true)} className={btn('primary', 'md', 'w-full sm:w-auto')}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Cadastrar certificado
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <button type="button" onClick={() => setIsAddingNew(false)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-text hover:underline rounded">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar para a lista
          </button>

          <p className="text-[13px] text-muted">
            Campos marcados com <span className="text-danger">*</span> são obrigatórios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-titular" className={labelClass}>
                Nome do titular <span className="text-danger">*</span>
              </label>
              <input
                {...aria('titular')}
                type="text"
                value={formData.titular}
                onChange={(e) => set('titular', e.target.value)}
                placeholder="Ex.: Dra. Ana Silva"
                autoComplete="name"
                data-autofocus
                className={inputClass}
              />
              {fieldError('titular')}
            </div>

            <div>
              <label htmlFor="cert-documento" className={labelClass}>
                CPF ou CNPJ <span className="text-danger">*</span>
              </label>
              <input
                {...aria('documento')}
                type="text"
                inputMode="numeric"
                value={formData.documento}
                onChange={(e) => set('documento', formatDocumento(e.target.value))}
                placeholder="000.000.000-00"
                className={cx(inputClass, 'tabular')}
              />
              {fieldError('documento')}
            </div>

            <div>
              <label htmlFor="cert-oab" className={labelClass}>
                Inscrição na OAB <span className="font-normal text-subtle">(opcional)</span>
              </label>
              <input
                id="cert-oab"
                type="text"
                value={formData.oab}
                onChange={(e) => set('oab', e.target.value)}
                placeholder="Ex.: OAB/SP 123.456"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="cert-validade" className={labelClass}>
                Validade do certificado <span className="text-danger">*</span>
              </label>
              <input
                {...aria('validade', 'cert-validade-hint')}
                type="date"
                value={formData.validade}
                onChange={(e) => set('validade', e.target.value)}
                className={cx(inputClass, 'tabular')}
              />
              {fieldError('validade') || (
                <p id="cert-validade-hint" className={hintClass}>
                  {formData.validade ? getCertificateStatus(formData.validade).label : 'Consta no próprio certificado.'}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cert-emissor" className={labelClass}>
                Autoridade certificadora <span className="font-normal text-subtle">(opcional)</span>
              </label>
              <input
                id="cert-emissor"
                type="text"
                value={formData.emissor}
                onChange={(e) => set('emissor', e.target.value)}
                placeholder="Ex.: AC Certisign / ICP-Brasil"
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-1.5">
              <label htmlFor="cert-secretOtp" className={cx(labelClass, 'mb-0')}>
                Chave secreta da autenticação em dois fatores <span className="text-danger">*</span>
              </label>
              <button type="button" onClick={handleGenerateSampleSecret} className="inline-flex items-center gap-1 text-[13px] text-accent-text hover:underline rounded">
                <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                Gerar chave de teste
              </button>
            </div>
            <input
              {...aria('secretOtp', 'cert-secretOtp-hint')}
              type="text"
              value={formData.secretOtp}
              onChange={(e) => set('secretOtp', e.target.value.toUpperCase())}
              placeholder="Ex.: JBSWY3DPEHPK3PXP"
              autoComplete="off"
              spellCheck={false}
              className={cx(inputClass, 'font-mono tracking-wide')}
            />
            {fieldError('secretOtp') || (
              <p id="cert-secretOtp-hint" className={cx(hintClass, secretHasBadChars && 'text-danger', secretOk && 'text-success')}>
                {secretHasBadChars
                  ? 'Há caracteres inválidos: a chave usa apenas letras A–Z e números 2–7.'
                  : secretOk
                    ? 'Formato válido.'
                    : 'Copie a chave exibida pelo PJe ao ativar a autenticação em dois fatores. Espaços são ignorados.'}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-sm text-fg cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isPadrao}
              onChange={(e) => set('isPadrao', e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--accent)]"
            />
            Usar este certificado após salvar
          </label>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-line">
            <button type="button" onClick={() => setIsAddingNew(false)} className={btn('secondary', 'md')}>
              Cancelar
            </button>
            <button type="submit" className={btn('primary', 'md')}>
              Salvar certificado
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
