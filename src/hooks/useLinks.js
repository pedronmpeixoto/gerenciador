'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TRT_LIST } from '@/config/trts';
import { 
  getFavorites, 
  saveFavorites, 
  getCustomLinks, 
  saveCustomLinks 
} from '@/services/storageService';

const normalize = (str) =>
  String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * Hook customizado para gerenciar links dos TRTs, favoritos, buscas e links adicionados pelo usuário.
 */
export function useLinks() {
  const [favorites, setFavorites] = useState([]);
  const [customLinks, setCustomLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega favoritos e links customizados do localStorage
  useEffect(() => {
    setFavorites(getFavorites());
    setCustomLinks(getCustomLinks());
    setIsLoaded(true);
  }, []);

  // Alterna status de favorito de um TRT pelo ID
  const toggleFavorite = useCallback((trtId) => {
    setFavorites(prev => {
      let updated;
      if (prev.includes(trtId)) {
        updated = prev.filter(id => id !== trtId);
      } else {
        updated = [...prev, trtId];
      }
      saveFavorites(updated);
      return updated;
    });
  }, []);

  // Adiciona um link personalizado criado pelo usuário
  const addCustomLink = useCallback((newLink) => {
    const linkObj = {
      ...newLink,
      id: `custom-${Date.now()}`,
      dataCriacao: new Date().toISOString()
    };
    setCustomLinks(prev => {
      const updated = [linkObj, ...prev];
      saveCustomLinks(updated);
      return updated;
    });
    return linkObj;
  }, []);

  // Remove um link personalizado
  const deleteCustomLink = useCallback((linkId) => {
    setCustomLinks(prev => {
      const updated = prev.filter(l => l.id !== linkId);
      saveCustomLinks(updated);
      return updated;
    });
  }, []);

  // Restaura um link removido (usado pelo botão "Desfazer" da notificação)
  const restoreCustomLink = useCallback((link, index = 0) => {
    setCustomLinks(prev => {
      if (prev.some(l => l.id === link.id)) return prev;
      const updated = [...prev];
      updated.splice(Math.min(index, updated.length), 0, link);
      saveCustomLinks(updated);
      return updated;
    });
  }, []);

  // Limpa todos os filtros de uma vez
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('Todas');
    setOnlyFavorites(false);
  }, []);

  // Filtro inteligente dos TRTs com base na busca, região e favoritos
  const filteredTrts = useMemo(() => {
    return TRT_LIST.filter(trt => {
      // Filtro de Favoritos
      if (onlyFavorites && !favorites.includes(trt.id)) {
        return false;
      }

      // Filtro de Região
      if (selectedRegion !== 'Todas' && trt.regiao !== selectedRegion) {
        return false;
      }

      // Filtro por texto de busca — ignora acentos, espaços e hífens ("sao paulo", "trt 2", "trt-15")
      if (searchQuery.trim() !== '') {
        const q = normalize(searchQuery);
        const haystack = normalize(
          [trt.nome, trt.uf, trt.estado, trt.regiao, trt.id, trt.numero ? `trt${trt.numero}` : 'tst'].join(' ')
        );
        const compactQ = q.replace(/[\s-]/g, '');
        return haystack.includes(q) || haystack.replace(/[\s-]/g, '').includes(compactQ) || `${trt.numero}` === q;
      }

      return true;
    });
  }, [searchQuery, selectedRegion, onlyFavorites, favorites]);

  return {
    allTrts: TRT_LIST,
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
    isLoaded
  };
}
