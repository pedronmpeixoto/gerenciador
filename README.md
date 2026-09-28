# ⚖️ Gerenciador de Links TRTs & Certificado Digital A1 OTP

> **Aplicação Web em Next.js para Gerenciamento Rápido dos Tribunais Regionais do Trabalho (TRT 1 a 24 e TST) com Gerador de Tokens OTP/TOTP em Tempo Real para Autenticação A2F de Certificados Digitais A1.**

---

## 🌟 Funcionalidades

- **🏛️ Mapeamento Completo da Justiça do Trabalho**:
  - Acesso direto ao **PJe 1º Grau**, **PJe 2º Grau**, **Portal Oficial**, **Consulta Processual** e **Balcão Virtual** de todos os 24 TRTs do Brasil + TST.
  - Links atualizados e organizados por regiões (Sudeste, Sul, Nordeste, Norte, Centro-Oeste e Nacional).

- **🔐 Gerador de Token OTP / TOTP (A2F do Certificado A1)**:
  - Cálculo de tokens de 6 dígitos em tempo real em JavaScript (compatível com a norma **RFC 6238**).
  - Suporte à chave secreta Base32 do Certificado Digital A1.
  - Temporizador regressivo animado de 30 segundos com barra de progresso.
  - Botão de **1-Clique para Copiar** com notificação flutuante (Toast).
  - Ação **"Copiar OTP & Abrir PJe"**: copia o código de autenticação e abre a página do tribunal em nova aba.

- **🪪 Gerenciador de Perfis de Certificados A1**:
  - Cadastro de múltiplos perfis de certificados (Titular, CPF/CNPJ, OAB, Data de Validade e Chave Secreta A2F).
  - Indicador automático de status de validade (*Válido*, *Vence em X dias*, *Expirado*).

- **🔍 Busca Inteligente & Atalhos Personalizados**:
  - Busca por nome do tribunal, estado (UF), região ou número.
  - Marcador de **Tribunais Favoritos**.
  - Possibilidade de cadastrar atalhos e links personalizados.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Linguagem**: JavaScript (ES6+)
- **Estilização**: Tailwind CSS v4 & CSS Custom Properties
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Cálculo OTP / TOTP**: `otpauth` (RFC 6238)
- **Persistência**: `localStorage` no navegador

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.js          # Layout raiz com tema escuro e metadados
│   ├── globals.css        # Importação do Tailwind CSS
│   └── page.js            # Página principal e orquestração de estados
├── config/
│   └── trts.js            # Configuração e links oficiais dos 24 TRTs + TST
├── services/
│   ├── otpService.js      # Serviço de cálculo e validação de tokens TOTP
│   ├── certificateService.js # Serviço de validação e status de certificados A1
│   └── storageService.js  # Serviço de armazenamento local (localStorage)
├── hooks/
│   ├── useOtp.js          # Hook para cálculo do código OTP e tempo restante (30s)
│   ├── useCertificates.js # Hook para gestão da lista e certificado ativo
│   └── useLinks.js        # Hook para filtros, buscas e favoritos
└── components/
    ├── layout/            # Header com relógio/OTP e Sidebar por regiões
    ├── otp/               # Widget interativo do Token A2F
    ├── trt/               # Cards de Tribunais e Grade com filtros
    ├── certificate/       # Modal de cadastro de Certificados A1
    ├── links/             # Modal de criação de links personalizados
    └── ui/                # Componente Toast de notificação
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18+ ou superior
- **npm** / **yarn** / **pnpm**

### Passo a Passo

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/pedronmpeixoto/gerenciador.git
   cd gerenciador
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. Acesse no seu navegador: **`http://localhost:3000`**

---

## 📦 Como Gerar a Build de Produção

```bash
npm run build
npm run start
```

---

## 👤 Autor

Desenvolvido por **Pedro Peixoto** (Desenvolvedor de IA & Automação | Bacharel em Direito).

- **GitHub**: [@pedronmpeixoto](https://github.com/pedronmpeixoto)
- **LinkedIn**: [in/pedronpeixoto](https://www.linkedin.com/in/pedronpeixoto)
- **Portfólio**: [pedronmpeixoto.github.io](https://pedronmpeixoto.github.io)
