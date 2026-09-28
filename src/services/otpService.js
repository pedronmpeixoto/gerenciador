import * as OTPAuth from 'otpauth';

/**
 * Serviço modular para geração e validação de Tokens OTP (2FA / A2F) em JavaScript
 * Compatível com RFC 6238 (TOTP - Time-Based One-Time Password)
 * Utilizado para autenticação em dois fatores nos portais TRT / PJe com Certificado A1.
 */

// Conjunto de caracteres Base32 válidos
const BASE32_CHARSET = /^[A-Z2-7=\s]+$/i;

/**
 * Sanitiza e valida uma chave secreta Base32
 * @param {string} secret 
 * @returns {string} Secret limpo sem espaços em maiúsculo
 */
export function sanitizeSecret(secret) {
  if (!secret) return '';
  return secret.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Verifica se a chave secreta informada é um Base32 válido
 * @param {string} secret 
 * @returns {boolean}
 */
export function isValidBase32Secret(secret) {
  const cleaned = sanitizeSecret(secret);
  if (!cleaned || cleaned.length < 8) return false;
  return BASE32_CHARSET.test(cleaned);
}

/**
 * Gera um token TOTP de 6 dígitos com base na chave secreta A2F do Certificado A1
 * @param {string} secret Chave secreta em Base32 (ex: JBSWY3DPEHPK3PXP)
 * @returns {{ code: string, remainingSeconds: number, percentRemaining: number, isValid: boolean, error?: string }}
 */
export function generateTotp(secret) {
  const cleanedSecret = sanitizeSecret(secret);

  if (!cleanedSecret) {
    return {
      code: '------',
      remainingSeconds: 30,
      percentRemaining: 100,
      isValid: false,
      error: 'Nenhuma chave secreta informada'
    };
  }

  try {
    const totp = new OTPAuth.TOTP({
      issuer: 'TRT-PJe',
      label: 'CertificadoA1',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanedSecret)
    });

    const code = totp.generate();
    
    // Cálculo do tempo restante no ciclo atual de 30 segundos
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const period = 30;
    const remainingSeconds = period - (nowInSeconds % period);
    const percentRemaining = Math.round((remainingSeconds / period) * 100);

    return {
      code,
      remainingSeconds,
      percentRemaining,
      isValid: true
    };
  } catch (err) {
    console.error('Erro ao gerar TOTP:', err);
    return {
      code: '------',
      remainingSeconds: 30,
      percentRemaining: 100,
      isValid: false,
      error: 'Formato de secret Base32 inválido'
    };
  }
}

/**
 * Gera uma chave secreta Base32 aleatória para testes ou criação de novos perfis A2F
 * @param {number} length Tamanho da chave em bytes
 * @returns {string} Chave em Base32
 */
export function generateRandomSecret(length = 20) {
  const secret = new OTPAuth.Secret({ size: length });
  return secret.base32;
}

/**
 * Gera URL do protocolo otpauth:// para exibição ou leitura por QR Code
 * @param {string} secret 
 * @param {string} label 
 * @param {string} issuer 
 * @returns {string}
 */
export function buildOtpauthUri(secret, label = 'Advogado A1', issuer = 'TRT PJe') {
  const cleaned = sanitizeSecret(secret);
  if (!isValidBase32Secret(cleaned)) return '';
  
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(cleaned)
  });
  return totp.toString();
}
