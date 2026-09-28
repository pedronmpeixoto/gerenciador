/**
 * Serviço modular para validação e gerenciamento de Certificados Digitais A1
 */

/**
 * Calcula os dias restantes até a expiração do certificado
 * @param {string} expiryDateStr Format ISO (YYYY-MM-DD) ou timestamp
 * @returns {number}
 */
export function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  
  // Zera horas para comparação puramente por data
  expiry.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formata uma data ISO (AAAA-MM-DD) no padrão brasileiro (DD/MM/AAAA).
 * Heurística 2 (Correspondência com o mundo real).
 */
export function formatDateBR(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = String(isoDate).split('T')[0].split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

/**
 * Aplica máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) enquanto o usuário digita.
 * Heurística 5 (Prevenção de erros).
 */
export function formatDocumento(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Retorna o status da validade do certificado A1.
 * `tone` define a cor (sempre acompanhada de texto — nunca só a cor comunica o estado).
 * @param {string} expiryDateStr
 * @returns {{ code: 'VALID'|'EXPIRING_SOON'|'EXPIRED', label: string, shortLabel: string, tone: 'success'|'warning'|'danger', daysLeft: number }}
 */
export function getCertificateStatus(expiryDateStr) {
  const daysLeft = calculateDaysRemaining(expiryDateStr);

  if (daysLeft < 0) {
    return {
      code: 'EXPIRED',
      label: `Vencido em ${formatDateBR(expiryDateStr)}`,
      shortLabel: 'Vencido',
      tone: 'danger',
      daysLeft
    };
  }

  if (daysLeft <= 30) {
    return {
      code: 'EXPIRING_SOON',
      label: `Vence em ${daysLeft} dia${daysLeft === 1 ? '' : 's'} (${formatDateBR(expiryDateStr)})`,
      shortLabel: `Vence em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}`,
      tone: 'warning',
      daysLeft
    };
  }

  return {
    code: 'VALID',
    label: `Válido até ${formatDateBR(expiryDateStr)}`,
    shortLabel: 'Válido',
    tone: 'success',
    daysLeft
  };
}

/**
 * Valida o formulário de cadastro de Certificado A1.
 * Heurística 9: cada mensagem diz o que está errado e como corrigir.
 * @param {Object} cert
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateCertificateData(cert) {
  const errors = {};
  const digits = String(cert.documento || '').replace(/\D/g, '');
  const secret = String(cert.secretOtp || '').replace(/[\s-]/g, '').toUpperCase();

  if (!cert.titular || cert.titular.trim().length < 3) {
    errors.titular = 'Informe o nome do titular (mínimo de 3 letras).';
  }

  if (digits.length !== 11 && digits.length !== 14) {
    errors.documento = 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).';
  }

  if (!cert.validade) {
    errors.validade = 'Informe a data de validade que consta no certificado.';
  }

  if (secret.length < 8) {
    errors.secretOtp = 'A chave precisa ter pelo menos 8 caracteres.';
  } else if (!/^[A-Z2-7]+=*$/.test(secret)) {
    errors.secretOtp = 'Use apenas letras de A a Z e números de 2 a 7 (formato Base32).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Perfis de exemplo para inicialização do sistema
 */
export function getDefaultCertificates() {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const expiryFormatted = nextYear.toISOString().split('T')[0];

  return [
    {
      id: 'cert-1',
      titular: 'Dra. Patrícia Peixoto (Advogada)',
      documento: '123.456.789-00',
      oab: 'OAB/SP 450.123',
      emissor: 'AC Certisign / ICP-Brasil',
      validade: expiryFormatted,
      tipo: 'Certificado A1 (PF)',
      secretOtp: 'JBSWY3DPEHPK3PXP', // Chave Base32 de exemplo ("Hello World!")
      isPadrao: true,
      dataCriacao: new Date().toISOString()
    }
  ];
}
