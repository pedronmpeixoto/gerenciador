'use client';

import React, { useState } from 'react';
import { TRT_LIST } from '@/config/trts';
import { Link2, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { btn, cx, inputClass, labelClass, hintClass, errorClass } from '@/components/ui/styles';

const emptyForm = () => ({
  titulo: '',
  url: '',
  trtAlvo: 'Geral (Todos os TRTs)',
  categoria: 'Personalizado',
  descricao: '',
});

/** Normaliza e valida o endereço. Retorna a URL completa ou null. */
function normalizeUrl(raw) {
  let value = raw.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const u = new URL(value);
    return u.hostname.includes('.') ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Novo link personalizado.
 * Heurística 5: valida o endereço antes de salvar e completa "https://" automaticamente.
 * Heurística 9: erro aparece no próprio campo, com exemplo do formato esperado.
 */
export default function AddLinkModal({ isOpen, onClose, onAddCustomLink, onShowToast }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const url = normalizeUrl(formData.url);

    if (!formData.titulo.trim()) nextErrors.titulo = 'Dê um nome para reconhecer o link depois.';
    if (!formData.url.trim()) nextErrors.url = 'Informe o endereço do link.';
    else if (!url) nextErrors.url = 'Endereço inválido. Exemplo: pje.trt2.jus.br/pjekz';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      document.getElementById(nextErrors.titulo ? 'link-titulo' : 'link-url')?.focus();
      return;
    }

    onAddCustomLink({ ...formData, titulo: formData.titulo.trim(), url });
    onShowToast?.(`Link "${formData.titulo.trim()}" salvo em Meus links.`, 'success');
    setFormData(emptyForm());
    setErrors({});
    onClose();
  };

  const err = (field) =>
    errors[field] ? (
      <p id={`link-${field}-error`} className={errorClass}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={Link2}
      title="Novo link"
      description="Crie um atalho para pautas, certidões ou qualquer sistema dos tribunais."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="link-titulo" className={labelClass}>
            Nome do link <span className="text-danger">*</span>
          </label>
          <input
            id="link-titulo"
            type="text"
            value={formData.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Ex.: Pauta da 2ª Turma — TRT-2"
            aria-invalid={errors.titulo ? 'true' : 'false'}
            aria-describedby={errors.titulo ? 'link-titulo-error' : undefined}
            data-autofocus
            className={inputClass}
          />
          {err('titulo')}
        </div>

        <div>
          <label htmlFor="link-url" className={labelClass}>
            Endereço (URL) <span className="text-danger">*</span>
          </label>
          <input
            id="link-url"
            type="url"
            inputMode="url"
            value={formData.url}
            onChange={(e) => set('url', e.target.value)}
            onBlur={() => {
              const n = normalizeUrl(formData.url);
              if (formData.url.trim() && !n) setErrors((p) => ({ ...p, url: 'Endereço inválido. Exemplo: pje.trt2.jus.br/pjekz' }));
            }}
            placeholder="https://pje.trt2.jus.br/..."
            autoComplete="url"
            spellCheck={false}
            aria-invalid={errors.url ? 'true' : 'false'}
            aria-describedby={errors.url ? 'link-url-error' : 'link-url-hint'}
            className={inputClass}
          />
          {err('url') || (
            <p id="link-url-hint" className={hintClass}>
              Pode colar sem “https://” — completamos automaticamente.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="link-trt" className={labelClass}>
              Tribunal
            </label>
            <select id="link-trt" value={formData.trtAlvo} onChange={(e) => set('trtAlvo', e.target.value)} className={cx(inputClass, 'pr-8')}>
              <option value="Geral (Todos os TRTs)">Geral (todos)</option>
              {TRT_LIST.map((trt) => (
                <option key={trt.id} value={trt.nome}>
                  {trt.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="link-categoria" className={labelClass}>
              Categoria
            </label>
            <select id="link-categoria" value={formData.categoria} onChange={(e) => set('categoria', e.target.value)} className={cx(inputClass, 'pr-8')}>
              <option value="Personalizado">Outros</option>
              <option value="PJe">PJe / Processos</option>
              <option value="Certidão">Certidões</option>
              <option value="Audiências">Audiências / Pautas</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-line">
          <button type="button" onClick={handleClose} className={btn('secondary', 'md')}>
            Cancelar
          </button>
          <button type="submit" className={btn('primary', 'md')}>
            Salvar link
          </button>
        </div>
      </form>
    </Modal>
  );
}
