/** Sigla curta do tribunal: "TRT-2", "TRT-15" ou "TST". */
export function trtSigla(trt) {
  return trt.numero === 0 ? 'TST' : `TRT-${trt.numero}`;
}

/** Alguns tribunais (ex.: TST) têm um único endereço de PJe. */
export function hasSeparatePje2g(trt) {
  return Boolean(trt.pje2g) && trt.pje2g !== trt.pje1g;
}

/** Mostra só o domínio de uma URL (ex.: "pje.trt2.jus.br"). */
export function urlHost(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
