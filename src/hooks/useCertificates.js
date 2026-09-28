'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getCertificates, 
  saveCertificates, 
  getActiveCertId, 
  setActiveCertId 
} from '@/services/storageService';
import { getDefaultCertificates } from '@/services/certificateService';

/**
 * Hook customizado para gerenciar a lista de Certificados A1 e o Certificado ativo.
 */
export function useCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [activeCertId, setActiveCertIdState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega do localStorage ao montar
  useEffect(() => {
    let loadedCerts = getCertificates();
    
    // Se não existir nenhum certificado, inicializa com o perfil de demonstração
    if (!loadedCerts || loadedCerts.length === 0) {
      loadedCerts = getDefaultCertificates();
      saveCertificates(loadedCerts);
    }
    
    setCertificates(loadedCerts);

    // Carrega certificado ativo
    let currentActiveId = getActiveCertId();
    if (!currentActiveId || !loadedCerts.some(c => c.id === currentActiveId)) {
      currentActiveId = loadedCerts[0]?.id || null;
      if (currentActiveId) setActiveCertId(currentActiveId);
    }

    setActiveCertIdState(currentActiveId);
    setIsLoaded(true);
  }, []);

  // Seleciona o certificado ativo por ID
  const selectActiveCert = useCallback((id) => {
    setActiveCertIdState(id);
    setActiveCertId(id);
  }, []);

  // Adiciona um novo certificado A1
  const addCertificate = useCallback((newCert) => {
    const certWithMeta = {
      ...newCert,
      id: `cert-${Date.now()}`,
      dataCriacao: new Date().toISOString()
    };

    setCertificates(prev => {
      const updated = [...prev, certWithMeta];
      saveCertificates(updated);
      return updated;
    });

    // Se for o único certificado ou marcado como padrão, ativa-o
    if (certificates.length === 0 || newCert.isPadrao) {
      selectActiveCert(certWithMeta.id);
    }

    return certWithMeta;
  }, [certificates.length, selectActiveCert]);

  // Atualiza um certificado existente
  const updateCertificate = useCallback((updatedCert) => {
    setCertificates(prev => {
      const updated = prev.map(c => c.id === updatedCert.id ? updatedCert : c);
      saveCertificates(updated);
      return updated;
    });
  }, []);

  // Remove um certificado
  const deleteCertificate = useCallback((id) => {
    setCertificates(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCertificates(updated);

      // Se apagou o ativo, ativa outro se houver
      if (activeCertId === id) {
        const nextActive = updated[0]?.id || null;
        setActiveCertIdState(nextActive);
        if (nextActive) setActiveCertId(nextActive);
      }

      return updated;
    });
  }, [activeCertId]);

  // Certificado ativo atual (objeto)
  const activeCertificate = certificates.find(c => c.id === activeCertId) || certificates[0] || null;

  return {
    certificates,
    activeCertificate,
    activeCertId,
    selectActiveCert,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    isLoaded
  };
}
