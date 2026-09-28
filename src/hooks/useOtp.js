'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateTotp, sanitizeSecret } from '@/services/otpService';

/**
 * Hook customizado para gerenciar a geração em tempo real do código TOTP/2FA
 * com atualização automática a cada 1 segundo e contagem regressiva de 30s.
 * 
 * @param {string} secretKey Chave secreta Base32 do certificado A1
 */
export function useOtp(secretKey = '') {
  const [secret, setSecret] = useState(secretKey);
  const [totpData, setTotpData] = useState(() => generateTotp(secretKey));
  const [copied, setCopied] = useState(false);

  // Sincroniza quando a prop secretKey se altera
  useEffect(() => {
    setSecret(secretKey);
    setTotpData(generateTotp(secretKey));
  }, [secretKey]);

  // Efeito principal: Atualiza o TOTP e o relógio a cada 1 segundo
  useEffect(() => {
    const updateToken = () => {
      setTotpData(generateTotp(secret));
    };

    // Atualiza imediatamente
    updateToken();

    // Timer de 1s
    const timer = setInterval(updateToken, 1000);
    return () => clearInterval(timer);
  }, [secret]);

  // Função para copiar o token de 6 dígitos com 1 clique
  const copyToClipboard = useCallback(async () => {
    if (!totpData || !totpData.isValid || totpData.code === '------') return false;
    
    try {
      await navigator.clipboard.writeText(totpData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch (err) {
      console.error('Falha ao copiar OTP para área de transferência:', err);
      return false;
    }
  }, [totpData]);

  // Atualiza secret manualmente
  const updateSecret = useCallback((newSecret) => {
    const cleaned = sanitizeSecret(newSecret);
    setSecret(cleaned);
  }, []);

  return {
    code: totpData.code,
    remainingSeconds: totpData.remainingSeconds,
    percentRemaining: totpData.percentRemaining,
    isValid: totpData.isValid,
    error: totpData.error,
    copied,
    secret,
    updateSecret,
    copyToClipboard
  };
}
