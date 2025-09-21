# 🎬 Alex 2.0 - Plataforma Premium +18

Uma plataforma moderna de conteúdo premium desenvolvida com Next.js 15, Wasabi Storage e TailwindCSS.

## ✨ Funcionalidades

- 🎥 **Reprodução de vídeos** na mesma tela (sem thumbnails)
- ☁️ **Armazenamento Wasabi** configurado
- 📱 **Design responsivo** e moderno
- 🔒 **Controle de acesso** +18
- 💳 **Comprovantes de pagamento** dinâmicos
- 🚀 **Deploy otimizado** para Vercel
- ⚡ **Performance** otimizada

## 🛠️ Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS 4**
- **Wasabi Storage** (S3-compatible)
- **Lucide React** (Ícones)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Wasabi

## 🚀 Instalação

### 1. Clone e instale dependências:
```bash
git clone <seu-repositorio>
cd alex-nextjs-site
npm install
```

### 2. Configure variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite .env.local com suas configurações do Wasabi
```

### 3. Configure o Wasabi:

#### 3.1. Crie uma conta no [Wasabi](https://wasabi.com)

#### 3.2. Crie dois buckets:
- `alex-site-storage` (para vídeos e imagens)
- `alex-site-metadata` (para arquivos JSON de configuração)

#### 3.3. Configure as variáveis:
```env
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com
WASABI_ACCESS_KEY_ID=your_access_key_here
WASABI_SECRET_ACCESS_KEY=your_secret_key_here
WASABI_BUCKET_NAME=alex-site-storage
WASABI_METADATA_BUCKET_NAME=alex-site-metadata
```

### 4. Inicialize o sistema:
```bash
# Executar inicialização automática
npm run init

# Ou simplesmente executar o projeto (inicialização automática)
npm run dev
```

**🎉 Na primeira execução, o sistema criará automaticamente:**
- Usuário administrador: `admin@gmail.com` / `admin123`
- Configurações padrão do site
- Estrutura de metadados no Wasabi

## 🎥 Upload de Vídeos

### Via Painel Administrativo:
1. Acesse `/admin/videos`
2. Faça upload dos vídeos (.mp4, .webm, .ogg)
3. Os vídeos são automaticamente salvos no Wasabi
4. Os metadados são salvos como arquivos JSON no bucket de metadados

### Via Código:
```typescript
import { useWasabiStorage } from '@/hooks/useWasabiStorage'

const { uploadFile } = useWasabiStorage()

const handleVideoUpload = async (file: File) => {
  const result = await uploadFile(file)
  console.log('Video uploaded:', result.fileId)
}
```

## 🏃‍♂️ Executar Localmente

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build
npm start
```

Acesse: http://localhost:3000

## 🚀 Deploy

### Vercel (Recomendado):
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Outras opções:
- **Netlify**: Conecte o repositório GitHub
- **Railway**: Deploy automático via Git
- **DigitalOcean**: App Platform

## 📦 Armazenamento

Este projeto usa **Wasabi** para armazenamento de arquivos e metadados:

- **Arquivos de vídeo**: Armazenados no bucket principal do Wasabi
- **Metadados**: Configurações e dados do site salvos como arquivos JSON no bucket de metadados
- **Comprovantes**: Imagens de comprovantes de pagamento armazenadas no Wasabi

### Configuração do Wasabi:
1. Crie uma conta no [Wasabi](https://wasabi.com)
2. Crie dois buckets:
   - `alex-site-storage` (para vídeos e imagens)
   - `alex-site-metadata` (para arquivos JSON de configuração)
3. Configure as credenciais no arquivo `.env`

## 📁 Estrutura do Projeto

```
alex-nextjs-site/
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── admin/          # Painel administrativo
│   │   ├── login/          # Página de login
│   │   ├── globals.css     # Estilos globais
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página inicial
│   ├── components/         # Componentes reutilizáveis
│   ├── context/           # Contextos React
│   ├── hooks/             # Hooks customizados
│   ├── lib/               # Utilitários e configurações
│   ├── services/          # Serviços de API
│   └── types/             # Definições TypeScript
├── public/                # Arquivos estáticos
├── scripts/               # Scripts de configuração
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build
npm start

# Linting
npm run lint

# Verificar build
npm run build:check

# Deploy check
npm run deploy:check

# Setup Wasabi
npm run setup:wasabi

# Setup PayPal
npm run setup:paypal
```

## 🎯 Funcionalidades Principais

### 🎥 Gerenciamento de Vídeos
- Upload de vídeos para Wasabi
- Metadados salvos como JSON
- Controle de status (published, draft, processing)
- Sistema de visualizações
- Tags e categorização

### 💳 Sistema de Pagamentos
- Comprovantes de pagamento via upload
- Aprovação/rejeição de comprovantes
- Integração com PayPal
- Histórico de transações

### ⚙️ Configurações do Site
- Nome do site
- Descrição
- Username do Telegram
- Configurações do PayPal
- Tudo salvo como JSON no Wasabi

### 🔐 Painel Administrativo
- Dashboard com estatísticas
- Gerenciamento de vídeos
- Aprovação de comprovantes
- Configurações do site
- Interface responsiva

## 🚀 Migração do Appwrite

Este projeto foi migrado do Appwrite para Wasabi Storage:

- ✅ **Armazenamento**: Appwrite Storage → Wasabi S3
- ✅ **Metadados**: Appwrite Database → JSON files no Wasabi
- ✅ **Configurações**: Collections → JSON files
- ✅ **Performance**: Melhorada com S3-compatible API
- ✅ **Custos**: Reduzidos com Wasabi

## 📝 Licença

Este projeto é privado e proprietário.

## 🤝 Suporte

Para suporte, entre em contato através do Telegram: @alexchannel