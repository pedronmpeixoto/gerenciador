'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import OtpWidget from '@/components/otp/OtpWidget';
import TrtGrid from '@/components/trt/TrtGrid';
import CertificateManager from '@/components/certificate/CertificateManager';
import AddLinkModal from '@/components/links/AddLinkModal';
import Toast from '@/components/ui/Toast';

import { useCertificates } from '@/hooks/useCertificates';
import { useLinks } from '@/hooks/useLinks';
import { generateTotp } from '@/services/otpService';
import { trtSigla } from '@/components/trt/trtUtils';

const isTypingTarget = (el) =>
  el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

export default function Home() {
  const {
    certificates,
    activeCertificate,
    activeCertId,
    selectActiveCert,
    addCertificate,
    deleteCertificate,
    isLoaded: certsLoaded,
  } = useCertificates();

  const {
    allTrts,
    filteredTrts,
    favorites,
    customLinks,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    onlyFavorites,
    setOnlyFavorites,
    viewMode,
    setViewMode,
    toggleFavorite,
    addCustomLink,
    deleteCustomLink,
    restoreCustomLink,
    resetFilters,
  } = useLinks();

  const [isCertManagerOpen, setIsCertManagerOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [toast, setToast] = useState({ id: 0, message: '', type: 'success', action: null });
  const searchInputRef = useRef(null);

  const showToast = useCallback((message, type = 'success', action = null) => {
    setToast((prev) => ({ id: prev.id + 1, message, type, action }));
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: '', action: null }));
  }, []);

  const openCertManager = useCallback(() => setIsCertManagerOpen(true), []);
  const closeCertManager = useCallback(() => setIsCertManagerOpen(false), []);
  const openAddLink = useCallback(() => setIsAddLinkModalOpen(true), []);
  const closeAddLink = useCallback(() => setIsAddLinkModalOpen(false), []);

  const hasOtp = Boolean(activeCertificate?.secretOtp) && generateTotp(activeCertificate.secretOtp).isValid;

  /** Gera e copia o código atual. Retorna o resultado para quem chamou decidir a mensagem. */
  const copyCurrentOtp = useCallback(() => {
    if (!activeCertificate?.secretOtp) return null;
    const totp = generateTotp(activeCertificate.secretOtp);
    if (!totp?.isValid) return null;
    navigator.clipboard?.writeText(totp.code).catch(() => {
      showToast('Não foi possível copiar o código. Copie manualmente no painel acima.', 'error');
    });
    return totp;
  }, [activeCertificate, showToast]);

  /** Copia o código (se houver certificado) e abre o PJe do tribunal em nova aba. */
  const handleOpenPje = useCallback(
    (trt, url) => {
      const totp = copyCurrentOtp();
      window.open(url, '_blank', 'noopener,noreferrer');

      if (totp) {
        showToast(
          `Código ${totp.code} copiado — cole no PJe do ${trtSigla(trt)}. Válido por mais ${totp.remainingSeconds}s.`,
          totp.remainingSeconds <= 5 ? 'info' : 'success'
        );
      } else {
        showToast(`Abrindo o PJe do ${trtSigla(trt)}. Cadastre um certificado para copiar o código automaticamente.`, 'info', {
          label: 'Cadastrar',
          onClick: openCertManager,
        });
      }
    },
    [copyCurrentOtp, showToast, openCertManager]
  );

  /** Exclui um link com opção de desfazer (Heurística 3). */
  const handleDeleteCustomLink = useCallback(
    (link) => {
      const index = customLinks.findIndex((l) => l.id === link.id);
      deleteCustomLink(link.id);
      showToast(`Link "${link.titulo}" excluído.`, 'info', {
        label: 'Desfazer',
        onClick: () => restoreCustomLink(link, index),
      });
    },
    [customLinks, deleteCustomLink, restoreCustomLink, showToast]
  );

  /** Atalhos de teclado (Heurística 7): "/" busca, Alt+C copia o código. */
  useEffect(() => {
    const onKey = (e) => {
      const modalOpen = isCertManagerOpen || isAddLinkModalOpen;

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !modalOpen && !isTypingTarget(document.activeElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyC') {
        e.preventDefault();
        const totp = copyCurrentOtp();
        if (totp) {
          showToast(`Código ${totp.code} copiado. Válido por mais ${totp.remainingSeconds}s.`, 'success');
        } else {
          showToast('Nenhum certificado com chave válida para gerar o código.', 'error', {
            label: 'Configurar',
            onClick: openCertManager,
          });
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isCertManagerOpen, isAddLinkModalOpen, copyCurrentOtp, showToast, openCertManager]);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-on-accent"
      >
        Pular para o conteúdo
      </a>

      <Header activeCertificate={activeCertificate} onOpenCertManager={openCertManager} onShowToast={showToast} />

      <main id="conteudo" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <OtpWidget
          activeCertificate={activeCertificate}
          isLoading={!certsLoaded}
          onOpenCertManager={openCertManager}
          onShowToast={showToast}
        />

        <section aria-labelledby="tribunais-title" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="tribunais-title" className="text-xl font-semibold text-fg">
                Tribunais
              </h2>
              <p className="text-sm text-muted">
                {hasOtp
                  ? 'Ao abrir o PJe, o código de verificação é copiado automaticamente.'
                  : 'Cadastre um certificado para copiar o código automaticamente ao abrir o PJe.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <Sidebar selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />

            <div className="flex-1 w-full min-w-0">
              <TrtGrid
                trts={filteredTrts}
                totalCount={allTrts.length}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                onlyFavorites={onlyFavorites}
                onOnlyFavoritesChange={setOnlyFavorites}
                onResetFilters={resetFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                customLinks={customLinks}
                onOpenAddLinkModal={openAddLink}
                onDeleteCustomLink={handleDeleteCustomLink}
                hasOtp={hasOtp}
                onOpenPje={handleOpenPje}
                onShowToast={showToast}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-subtle">
          <p>Dados salvos apenas neste navegador. Nenhuma chave é enviada para servidores.</p>
          <p>Códigos compatíveis com RFC 6238 (TOTP) · PJe 1º e 2º grau</p>
        </div>
      </footer>

      <CertificateManager
        isOpen={isCertManagerOpen}
        onClose={closeCertManager}
        certificates={certificates}
        activeCertId={activeCertId}
        onSelectActiveCert={selectActiveCert}
        onAddCertificate={addCertificate}
        onDeleteCertificate={deleteCertificate}
        onShowToast={showToast}
      />

      <AddLinkModal isOpen={isAddLinkModalOpen} onClose={closeAddLink} onAddCustomLink={addCustomLink} onShowToast={showToast} />

      {toast.message && <Toast key={toast.id} {...toast} onClose={hideToast} />}
    </div>
  );
}
