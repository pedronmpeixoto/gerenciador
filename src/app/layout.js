import "./globals.css";

export const metadata = {
  title: "Gerenciador de Links TRT | Certificado A1 e código 2FA",
  description:
    "Acesso rápido aos Tribunais Regionais do Trabalho (TRT 1 a 24) e TST, com gerador de código de verificação (TOTP/2FA) para o Certificado Digital A1.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

/*
 * Aplica o tema salvo (ou o do sistema) antes da primeira pintura,
 * evitando o "piscar" de tema ao carregar a página.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('trt_manager_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-theme="light" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
