/**
 * Serviço modular de Persistência Local (localStorage)
 * Gerencia salvamento seguro de links favoritos, links customizados,
 * e perfis de Certificados A1 com segredos OTP.
 */

const STORAGE_KEYS = {
  FAVORITES: 'trt_manager_favorites',
  CUSTOM_LINKS: 'trt_manager_custom_links',
  CERTIFICATES: 'trt_manager_certificates',
  ACTIVE_CERT_ID: 'trt_manager_active_cert_id',
  THEME: 'trt_manager_theme'
};

const isClient = () => typeof window !== 'undefined';

/**
 * Lê favoritos salvos
 * @returns {Array<string>} Array de IDs dos TRTs (ex: ['trt2', 'trt15'])
 */
export function getFavorites() {
  if (!isClient()) return ['trt2', 'trt15', 'trt1', 'trt3', 'trt4', 'tst'];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : ['trt2', 'trt15', 'trt1', 'trt3', 'trt4', 'tst'];
  } catch (e) {
    console.error('Erro ao ler favoritos do localStorage:', e);
    return ['trt2', 'trt15', 'trt1', 'trt3', 'trt4', 'tst'];
  }
}

/**
 * Salva a lista de favoritos
 * @param {Array<string>} favorites 
 */
export function saveFavorites(favorites) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (e) {
    console.error('Erro ao salvar favoritos:', e);
  }
}

/**
 * Lê links personalizados cadastrados pelo usuário
 * @returns {Array<Object>}
 */
export function getCustomLinks() {
  if (!isClient()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_LINKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao ler links customizados:', e);
    return [];
  }
}

/**
 * Salva a lista de links personalizados
 * @param {Array<Object>} links 
 */
export function saveCustomLinks(links) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LINKS, JSON.stringify(links));
  } catch (e) {
    console.error('Erro ao salvar links customizados:', e);
  }
}

/**
 * Lê a lista de Certificados A1 cadastrados
 * @returns {Array<Object>}
 */
export function getCertificates() {
  if (!isClient()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao ler certificados:', e);
    return [];
  }
}

/**
 * Salva a lista de Certificados A1
 * @param {Array<Object>} certs 
 */
export function saveCertificates(certs) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  } catch (e) {
    console.error('Erro ao salvar certificados:', e);
  }
}

/**
 * Obtém o ID do certificado ativo atualmente
 * @returns {string|null}
 */
export function getActiveCertId() {
  if (!isClient()) return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CERT_ID) || null;
}

/**
 * Define o ID do certificado ativo
 * @param {string} id 
 */
export function setActiveCertId(id) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CERT_ID, id);
}

/**
 * Lê a preferência de tema (dark/light)
 * @returns {string} 'dark' | 'light'
 */
export function getThemePreference() {
  if (!isClient()) return 'dark';
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

/**
 * Salva preferência de tema
 * @param {string} theme 
 */
export function saveThemePreference(theme) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
