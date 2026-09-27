# Buu Voice Agent (Gemini Live 2.5 Realtime)

Assistente de voz em tempo real para atendimento ao cliente da Buu, construído com **LiveKit Agents**, **Gemini Live 2.5 Native Audio (Vertex AI)** e executado sob o runtime **Bun**.

---

## 🚀 Arquitetura do Projeto

```text
buu/
├── src/
│   ├── config/
│   │   ├── env.ts          # Validação estrita de variáveis de ambiente com Zod
│   │   └── prompts.ts      # BUU_SYSTEM_PROMPT e instruções de saudação inicial
│   ├── tools/
│   │   └── account.ts      # Ferramenta checkAccountStatus com schemas Zod tipados
│   ├── utils/
│   │   ├── env-loader.ts   # Fallback de leitura de .env para o LiveKit CLI
│   │   └── tcp-fix.ts      # Interceptador da condição de corrida TCP no modo console
│   └── agent.ts            # Ponto de entrada oficial do agente
├── package.json            # Scripts de execução e dependências
├── tsconfig.json           # Configuração TypeScript / Bun (Bundler mode)
├── .env.example            # Modelo de configuração de ambiente
└── README.md
```

---

## 📋 Pré-requisitos de Sistema

Para rodar o projeto localmente, certifique-se de ter as ferramentas abaixo instaladas na sua máquina:

### 1. Runtime Bun
O projeto roda 100% sobre o [Bun](https://bun.com):
```bash
# macOS / Linux:
curl -fsSL https://bun.sh/install | bash
```

### 2. LiveKit CLI (`lk`)
> [!IMPORTANT]
> O **LiveKit CLI (`lk`)** é um binário global compilado em Go. Ele **não** faz parte das dependências do `package.json` e é **obrigatório** para executar o teste interativo de terminal via microfone (`bun run console`).

- **macOS (Homebrew):**
  ```bash
  brew install livekit-cli
  ```
- **Linux:**
  ```bash
  curl -sSL https://get.livekit.io/cli | bash
  ```
- **Windows:**
  ```powershell
  choco install livekit-cli
  # ou via Scoop:
  scoop install livekit-cli
  ```

### 3. Google Cloud Vertex AI (Gemini Live)
O agente utiliza o modelo nativo de áudio do Gemini na Google Cloud Platform (faturamento em reais e consumo de créditos GCP):
1. Tenha um projeto ativo no [Google Cloud Console](https://console.cloud.google.com).
2. Ative a API **Vertex AI API** (`aiplatform.googleapis.com`).
3. Crie uma **Conta de Serviço (Service Account)** com o papel **Vertex AI User** (`roles/aiplatform.user`).
4. Crie e baixe uma **Chave JSON** da conta de serviço e guarde na raiz do projeto (ex: `gcp-credentials.json`).
   *(O arquivo `.gitignore` já ignora arquivos `*.json` de credenciais para sua segurança).*

### 4. Servidor LiveKit (Apenas para WebRTC real / Modo Servidor)
- **Para o Modo Console (`bun run console`):** Não é necessário subir servidor externo; o `lk agent console` emula a conexão localmente.
- **Para o Modo Servidor (`bun run dev`):** É necessário ter um LiveKit Server rodando:
  - **Local via Docker:**
    ```bash
    docker run --rm -it -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server --dev
    ```
  - **Ou na Nuvem:** Crie um projeto gratuito no [LiveKit Cloud](https://cloud.livekit.io).

---

## 🛠️ Instalação e Configuração

1. **Instale as dependências:**
   ```bash
   bun install
   ```

2. **Configure o arquivo de ambiente:**
   ```bash
   cp .env.example .env
   ```

3. **Edite o `.env` com suas informações:**
   ```dotenv
   # Servidor LiveKit
   LIVEKIT_URL=ws://127.0.0.1:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret

   # Google Cloud Vertex AI
   GOOGLE_CLOUD_PROJECT=seu-project-id-gcp
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json

   # Nível de log (info mantém a saída limpa e elegante no terminal)
   LOG_LEVEL=info
   ```

---

## 🎙️ Executando o Agente

### Opção 1: Modo Console Interativo (Recomendado para Testes Rápidos)

Testa o agente diretamente pelo microfone e fone de ouvido locais (AirPods / Headset), com saída de áudio sintetizada em tempo real:

```bash
bun run console
```

#### 💡 Roteiro de Teste Sugerido:
1. **Saudação:** O agente iniciará falando: *"Olá! Sou o assistente virtual da Buu. Como posso ajudar você hoje?"*
2. **Pergunta:** Diga: *"Olá, você poderia consultar o status da minha conta A1234?"*
3. **Execução de Tool:** O agente chamará a ferramenta `checkAccountStatus` e responderá em voz: *"Sua conta A1234 está ativa com o plano premium. Gostaria de solicitar uma segunda via da fatura ou verificar opções de upgrade?"*
4. **Encerramento:** Diga: *"Não, só isso mesmo. Muito obrigado!"*
5. **Despedida:** O agente responderá: *"Por nada! Tenha um excelente dia!"*

---

### Opção 2: Modo Servidor (LiveKit Worker WebRTC)

Executa o agente como worker aguardando conexões reais de salas de videoconferência ou áudio (web, mobile, SIP):

1. Certifique-se de que o LiveKit Server está rodando (localmente via Docker ou apontando para a LiveKit Cloud no `.env`).
2. Inicie o worker:
   ```bash
   bun run dev
   ```
3. Teste a conexão através do [LiveKit Agents Playground](https://agents-playground.livekit.io).

---

## 🧪 Checagem de Tipos (TypeScript)

Para validar a integridade de tipos de todo o projeto:

```bash
bun run typecheck
```

---

## ❓ Solução de Problemas Comuns (Troubleshooting)

### 1. `command not found: lk`
- **Causa:** O LiveKit CLI não foi instalado na máquina.
- **Solução:** No macOS execute `brew install livekit-cli`. Em Linux/WSL, execute `curl -sSL https://get.livekit.io/cli | bash`.

### 2. `Falha na validação das variáveis de ambiente`
- **Causa:** Alguma variável essencial não foi informada ou o `.env` não existe.
- **Solução:** Verifique a mensagem exibida no terminal. O Schema Zod aponta exatamente o campo ausente (ex: `GOOGLE_CLOUD_PROJECT`).

### 3. `Permission 'aiplatform.endpoints.predict' denied / 403`
- **Causa:** A Service Account do Google Cloud não possui o papel de permissão necessário.
- **Solução:** No Console GCP (IAM), atribua o papel `Vertex AI User` (`roles/aiplatform.user`) à sua Service Account e certifique-se de que a **Vertex AI API** está ativada.
