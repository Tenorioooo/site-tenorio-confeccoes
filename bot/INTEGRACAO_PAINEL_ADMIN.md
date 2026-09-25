# 🧵 Guia de Integração — Aba "Chat Bot" no Painel Admin (Tenório Confecções)

Este guia orienta passo a passo como colocar a nova aba **"Chat Bot"** para funcionar no seu site **Next.js + Tailwind CSS** (`https://www.tenorioconfeccoes.shop/admin`).

---

## 📁 Arquivos Criados / Modificados

1. **[chatbot.js](file:///c:/Users/nicol/Downloads/Chat%20Bot/chatbot.js)**:
   - Servidor Express integrado na porta `3001` (com suporte a CORS e JSON).
   - Rotas de API completas:
     - `GET /api/status`: Retorna status da conexão, imagem do QR Code em Base64, telefone conectado e métricas.
     - `POST /api/restart`: Reinicia o cliente do WhatsApp e gera novo QR Code.
     - `POST /api/logout`: Desconecta a sessão do WhatsApp.
     - `GET /api/tabela`: Obtém o catálogo de preços completo com produtos e variações.
     - `POST /api/tabela`: Salva alterações gerais da tabela.
     - `POST /api/produtos`: Adiciona novo produto com termos, preço e variações.
     - `PUT /api/produtos/:index`: Edita produto existente.
     - `DELETE /api/produtos/:index`: Exclui produto.
     - `POST /api/test-calculo`: Simula um orçamento em tempo real.

2. **[ChatbotAdminTab.tsx](file:///c:/Users/nicol/Downloads/Chat%20Bot/ChatbotAdminTab.tsx)**:
   - Componente React completo para Next.js com Tailwind CSS (Dark Mode: `slate-950`, `slate-900`, etc.).
   - Pronto para adicionar como aba ou página em `app/admin/chatbot/page.tsx` ou `pages/admin/chatbot.tsx`.

---

## 🚀 Como Integrar no seu Projeto Next.js (Passo a Passo)

### Opção A: Como uma Nova Página de Rota no Next.js (App Router)
1. No projeto do seu site, crie o arquivo:
   `app/admin/chatbot/page.tsx`
2. Copie o conteúdo de **[ChatbotAdminTab.tsx](file:///c:/Users/nicol/Downloads/Chat%20Bot/ChatbotAdminTab.tsx)** e cole dentro dele.
3. No menu lateral do seu painel admin, adicione o link para `/admin/chatbot`.

### Opção B: Como uma Aba dentro da sua página Admin existente
1. Copie o arquivo **[ChatbotAdminTab.tsx](file:///c:/Users/nicol/Downloads/Chat%20Bot/ChatbotAdminTab.tsx)** para a pasta de componentes do seu site (ex: `components/admin/ChatbotAdminTab.tsx`).
2. No seu componente de abas do painel admin, importe o componente:
   ```tsx
   import ChatbotAdminTab from "@/components/admin/ChatbotAdminTab";
   ```
3. Renderize quando a aba ativa for `"chatbot"`:
   ```tsx
   {activeTab === "chatbot" && <ChatbotAdminTab />}
   ```

---

## 🌐 Configuração de Ambiente (.env)

No arquivo `.env.local` ou `.env` do seu site Next.js, configure a URL onde o robô estará rodando:

```env
# Se estiver testando no mesmo computador:
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:3001

# Se o robô estiver hospedado em um servidor/VPS:
# NEXT_PUBLIC_CHATBOT_API_URL=https://api-bot.tenorioconfeccoes.shop
```

---

## ▶️ Como Iniciar o Chatbot com a API

No terminal da pasta **Chat Bot**, basta rodar:

```bash
node chatbot.js
```

Você verá as mensagens:
- `🚀 [API do Chatbot] Servidor Express ativo na porta 3001 (http://localhost:3001)`
- `📲 [QR Code Gerado] Escaneie no terminal ou no painel admin:`

Quando você abrir a aba **Chat Bot** no seu painel admin, o QR Code já aparecerá na tela automaticamente para escanear com o celular!
