const fs = require('fs');
const path = require('path');

const chatbotContent = `// =====================================
// IMPORTAÇÕES
// =====================================
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const {
  identificarOrcamento,
  parseOrcamento,
  interpretarRespostaQuestionario,
  calcularOrcamento,
  gerarRespostaOrcamento,
  carregarTabelaPrecos,
} = require("./orcamentoService");

// =====================================
// ESTADO GLOBAL DO BOT E DA API
// =====================================
const estadosConversa = new Map();
let botStatus = "INITIALIZING"; // "INITIALIZING" | "QR_READY" | "CONNECTED" | "DISCONNECTED"
let qrCodeDataUrl = null;
let qrCodeRaw = null;
let botInfo = { phone: null, name: "Tenório Confecções" };
const stats = {
  totalMensagens: 0,
  totalOrcamentos: 0,
  iniciadoEm: new Date().toISOString(),
};
const ultimosOrcamentos = [];
const clientesAguardandoHumano = [];

// =====================================
// CONFIGURAÇÕES DE NOTIFICAÇÕES (ADMIN E WEB PUSH)
// =====================================
const CAMINHO_CONFIG_NOTIFICACOES = path.join(__dirname, "configNotificacoes.json");

function carregarConfigNotificacoes() {
  try {
    if (fs.existsSync(CAMINHO_CONFIG_NOTIFICACOES)) {
      return JSON.parse(fs.readFileSync(CAMINHO_CONFIG_NOTIFICACOES, "utf-8"));
    }
  } catch (e) {}
  return {
    adminPhone: "",
    notificarAtendimentoHumano: true,
    notificarNovoOrcamento: true,
    notificarPushWeb: true,
    siteApiUrl: "https://www.tenorioconfeccoes.shop/api/notifications/send",
  };
}

function salvarConfigNotificacoes(config) {
  fs.writeFileSync(CAMINHO_CONFIG_NOTIFICACOES, JSON.stringify(config, null, 2), "utf-8");
}

// Disparador Unificado de Notificações
async function dispararNotificacaoAdmin({ tipo, titulo, mensagem, dados }) {
  const config = carregarConfigNotificacoes();

  // 1. Web Push para iPhone / Navegador
  if (config.notificarPushWeb !== false) {
    const payload = {
      title: titulo,
      body: mensagem.replace(/[*_~]/g, ""),
      url: "/admin/chatbot",
      tag: "alerta-" + Date.now(),
    };

    const targetUrls = [
      "http://localhost:3000/api/notifications/send",
      config.siteApiUrl || "https://www.tenorioconfeccoes.shop/api/notifications/send",
    ];

    for (const url of targetUrls) {
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch (e) {}
    }
  }

  // 2. WhatsApp Direto para o Administrador
  if (config.adminPhone && client && botStatus === "CONNECTED") {
    if (
      (tipo === "ATENDIMENTO_HUMANO" && config.notificarAtendimentoHumano !== false) ||
      (tipo === "NOVO_ORCAMENTO" && config.notificarNovoOrcamento !== false) ||
      tipo === "TESTE"
    ) {
      let cleanPhone = String(config.adminPhone).replace(/[^0-9]/g, "");
      if (cleanPhone.length >= 10) {
        if (!cleanPhone.startsWith("55") && cleanPhone.length <= 11) {
          cleanPhone = "55" + cleanPhone;
        }
        const adminWid = cleanPhone + "@c.us";

        let textoZap = \`🔔 *[PAINEL TENÓRIO CONFECÇÕES]*\\n\\n\${titulo}\\n\\n\${mensagem}\`;
        if (dados && dados.clientePhone) {
          const cleanCliente = String(dados.clientePhone).replace(/[^0-9]/g, "");
          textoZap += \`\\n\\n👉 *Conversar com o cliente:* https://wa.me/\${cleanCliente}\`;
        }

        try {
          await client.sendMessage(adminWid, textoZap);
          console.log(\`📲 [WhatsApp Admin] Alerta enviado para \${cleanPhone}: \${titulo}\`);
        } catch (errZap) {
          console.error(\`❌ Erro ao enviar WhatsApp para admin (\${cleanPhone}):\`, errZap.message);
        }
      }
    }
  }
}

function registrarClienteAguardando(numeroRaw, nomeContato, motivo) {
  const telefone = String(numeroRaw || "").replace(/[^0-9]/g, "");
  const id = "CLI-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const index = clientesAguardandoHumano.findIndex((c) => c.telefone === telefone && c.status === "AGUARDANDO");
  const novoRegistro = {
    id,
    nome: nomeContato || "Cliente",
    telefone,
    motivo: motivo || "Solicitação de Atendimento Humano",
    data: new Date().toISOString(),
    status: "AGUARDANDO",
  };

  if (index >= 0) {
    clientesAguardandoHumano[index] = {
      ...clientesAguardandoHumano[index],
      ...novoRegistro,
      id: clientesAguardandoHumano[index].id,
    };
  } else {
    clientesAguardandoHumano.unshift(novoRegistro);
  }
  if (clientesAguardandoHumano.length > 50) clientesAguardandoHumano.pop();
  console.log(\`👤 [Fila de Atendimento] Cliente adicionado/atualizado: \${nomeContato} (\${telefone}) - \${motivo}\`);

  // Dispara alerta imediato
  dispararNotificacaoAdmin({
    tipo: "ATENDIMENTO_HUMANO",
    titulo: "🚨 Atendimento Humano Solicitado",
    mensagem: \`*Cliente:* \${nomeContato || "Cliente"}\\n*WhatsApp:* \${telefone}\\n*Motivo:* \${motivo || "Opção 5"}\`,
    dados: { clientePhone: telefone, nome: nomeContato },
  });
}

// Caminho da tabela de preços
const CAMINHO_TABELA = path.join(__dirname, "tabelaPrecos.json");

function salvarTabelaPrecos(novaTabela) {
  fs.writeFileSync(CAMINHO_TABELA, JSON.stringify(novaTabela, null, 2), "utf-8");
}

// Sincronizador de Orçamentos com o Banco de Dados do Site / Painel Admin
async function salvarOrcamentoNoBanco(calculo, clientePhoneRaw) {
  try {
    const config = carregarConfigNotificacoes();
    let cleanPhone = String(clientePhoneRaw || calculo.dados.whatsapp || "").replace(/[^0-9]/g, "");
    if (cleanPhone.length >= 10 && !cleanPhone.startsWith("55") && cleanPhone.length <= 11) {
      cleanPhone = "55" + cleanPhone;
    }

    let localizacao = calculo.dados.localizacao || "";
    let cidade = "";
    let estado = "";
    if (localizacao.includes("-")) {
      const parts = localizacao.split("-");
      cidade = parts[0]?.trim() || "";
      estado = parts[1]?.trim() || "";
    } else {
      cidade = localizacao;
    }

    const payload = {
      quoteCode: calculo.dados.codigo || ("ORC-" + Date.now()),
      customerName: calculo.dados.cliente || "Cliente WhatsApp",
      whatsapp: cleanPhone || "WhatsApp",
      email: calculo.dados.email || undefined,
      city: cidade || undefined,
      state: estado || undefined,
      desiredDate: calculo.dados.prazoDesejado || undefined,
      notes: calculo.dados.observacoes || "Orçamento gerado via Chatbot do WhatsApp",
      estimatedTotal: calculo.totalLiquido || 0,
      items: calculo.itens.map((it) => {
        const sizesMap = {};
        if (it.grade) {
          const matches = it.grade.matchAll(/([A-Za-z0-9\s]+):\s*([0-9]+)/g);
          for (const m of matches) {
            sizesMap[m[1].trim()] = parseInt(m[2], 10);
          }
        }
        if (Object.keys(sizesMap).length === 0) {
          sizesMap["Padrão"] = it.quantidade || 1;
        }

        return {
          productName: it.nomeOficial || it.nome || "Produto Personalizado",
          quantity: it.quantidade || 1,
          unitPrice: it.precoUnitarioLiquido || it.precoUnitarioBruto || 0,
          totalPrice: it.subtotalLiquido || 0,
          customizationPositions: it.locais ? [it.locais] : ["Frente"],
          sizes: sizesMap,
          hasCustomArt: false,
          notes: it.estampa ? \`Estampa: \${it.estampa}\` : undefined,
        };
      }),
    };

    const targetUrls = [
      "http://localhost:3000/api/quotes",
      "https://www.tenorioconfeccoes.shop/api/quotes",
    ];

    if (config.siteApiUrl) {
      try {
        const parsedBase = new URL(config.siteApiUrl);
        const customQuotesUrl = \`\${parsedBase.origin}/api/quotes\`;
        if (!targetUrls.includes(customQuotesUrl)) {
          targetUrls.push(customQuotesUrl);
        }
      } catch (e) {}
    }

    for (const url of targetUrls) {
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            if (res.ok) {
              console.log(\`💾 [Banco de Dados] Orçamento \${payload.quoteCode} gravado com sucesso em \${url}\`);
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
  } catch (err) {
    console.error("⚠️ Erro ao sincronizar orçamento no banco de dados:", err.message);
  }
}

// =====================================
// CONFIGURAÇÃO DO CLIENTE WHATSAPP
// =====================================
let client;

function criarClienteWhatsApp() {
  botStatus = "INITIALIZING";
  qrCodeDataUrl = null;
  qrCodeRaw = null;

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, ".wwebjs_auth"),
    }),
    webVersionCache: {
      type: "remote",
      remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html",
    },
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-software-rasterizer",
      ],
    },
  });

  // QR CODE
  client.on("qr", async (qr) => {
    botStatus = "QR_READY";
    qrCodeRaw = qr;
    console.log("📲 [QR Code Gerado] Escaneie no terminal ou no painel admin:");
    qrcodeTerminal.generate(qr, { small: true });

    try {
      qrCodeDataUrl = await QRCode.toDataURL(qr, { margin: 2, width: 320 });
    } catch (e) {
      console.error("Erro ao gerar QR Code DataURL:", e);
    }
  });

  // WHATSAPP CONECTADO
  client.on("ready", async () => {
    botStatus = "CONNECTED";
    qrCodeDataUrl = null;
    qrCodeRaw = null;
    console.log("✅ Tudo certo! WhatsApp conectado.");

    try {
      const info = client.info;
      if (info) {
        botInfo = {
          phone: info.wid ? info.wid.user : null,
          name: info.pushname || "Tenório Confecções",
        };
      }
    } catch (e) {}
  });

  // DESCONEXÃO
  client.on("disconnected", (reason) => {
    botStatus = "DISCONNECTED";
    qrCodeDataUrl = null;
    console.log("⚠️ Desconectado:", reason);
  });

  client.initialize().catch((err) => {
    console.warn("⚠️ [WhatsApp] Aviso de inicialização do navegador:", err.message);
    if (err.message && err.message.includes("Execution context was destroyed")) {
      console.log("🔄 Redirecionamento de página do WhatsApp detectado. Tentando reconectar em 2s...");
      setTimeout(() => {
        try {
          client.initialize().catch(() => {});
        } catch (e) {}
      }, 2000);
    }
  });
}

criarClienteWhatsApp();

// =====================================
// FUNÇÃO DE DELAY
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// =====================================
// FUNIL DE MENSAGENS (SOMENTE PRIVADO)
// =====================================
client.on("message_create", async (msg) => {
  try {
    // ❌ IGNORA STATUS OU MENSAGENS DE GRUPO
    if (!msg.from || msg.from.endsWith("@g.us") || msg.from === "status@broadcast") return;
    // ❌ NUNCA PROCESSA MENSAGENS ENVIADAS PELO PRÓPRIO BOT (EVITA LOOP INFINITO)
    if (msg.fromMe) return;

    const texto = msg.body ? msg.body.trim().toLowerCase() : "";
    if (!texto) return;

    console.log(\`📩 [Mensagem Recebida] De: \${msg.from} | Texto: "\${msg.body.slice(0, 80).replace(/\\n/g, " ")}..."\`);

    stats.totalMensagens++;

    // Verifica se é orçamento vindo do site
    const ehOrcamento = identificarOrcamento(msg.body);

    // Função de digitação sem bloqueio
    const typing = async (tempo = 800) => {
      try {
        Promise.race([
          msg.getChat().then((chat) => chat?.sendStateTyping && chat.sendStateTyping()),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 500)),
        ]).catch(() => {});
      } catch (err) {}
      await delay(tempo);
    };

    // Função segura de envio de mensagens priorizando reply
    const responder = async (mensagem) => {
      await typing();
      console.log(\`📤 Enviando resposta para \${msg.from}...\`);
      try {
        await msg.reply(mensagem);
        console.log(\`✅ Resposta enviada com sucesso via msg.reply!\`);
      } catch (err) {
        console.warn(\`⚠️ msg.reply falhou (\${err.message}), tentando via client.sendMessage...\`);
        try {
          await client.sendMessage(msg.from, mensagem);
          console.log(\`✅ Resposta enviada com sucesso via client.sendMessage!\`);
        } catch (err2) {
          console.error(\`❌ Erro no envio da mensagem para \${msg.from}:\`, err2.message);
        }
      }
    };

    // =====================================
    // 0. RECONHECIMENTO DE ORÇAMENTO ESTRUTURADO DO SITE
    // =====================================
    if (ehOrcamento) {
      estadosConversa.delete(msg.from);
      console.log(\`📋 [Orçamento Detectado] Processando solicitação de \${msg.from}...\`);
      const dadosOrcamento = parseOrcamento(msg.body);
      const calculo = calcularOrcamento(dadosOrcamento);
      const respostaOrcamento = gerarRespostaOrcamento(calculo);

      // Atualiza estatísticas
      stats.totalOrcamentos++;
      ultimosOrcamentos.unshift({
        codigo: calculo.dados.codigo || "ORC-" + Date.now(),
        cliente: calculo.dados.cliente || "Cliente",
        total: calculo.totalLiquido,
        pecas: calculo.totalPecas,
        data: new Date().toISOString(),
      });
      if (ultimosOrcamentos.length > 20) ultimosOrcamentos.pop();

      // Sincroniza e grava no banco de dados do Painel Admin (/api/quotes)
      salvarOrcamentoNoBanco(calculo, msg.from);

      // Notifica admin sobre novo orçamento
      const valorMoeda = (calculo.totalLiquido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      dispararNotificacaoAdmin({
        tipo: "NOVO_ORCAMENTO",
        titulo: \`💰 Novo Orçamento Recebido (\${valorMoeda})\`,
        mensagem: \`*Cliente:* \${calculo.dados.cliente || "Cliente"}\\n*Volume:* \${calculo.totalPecas} peças\\n*Valor:* \${valorMoeda}\`,
        dados: { clientePhone: msg.from, nome: calculo.dados.cliente },
      });

      await responder(respostaOrcamento);
      return;
    }

    // =====================================
    // 0.1 RESPOSTA AO QUESTIONÁRIO DE ORÇAMENTO (OPÇÃO 1)
    // =====================================
    const estadoUsuario = estadosConversa.get(msg.from);
    if (estadoUsuario && estadoUsuario.etapa === "AGUARDANDO_DADOS_ORCAMENTO") {
      const expirado = estadoUsuario.timestamp && Date.now() - estadoUsuario.timestamp > 15 * 60 * 1000;
      const ehOpcaoMenu = /^(menu|voltar|cancelar|inicio|início|1|2|3|4|5)$/i.test(texto) ||
                          texto.includes("atendente") || texto.includes("humano") || texto.includes("vendedor") ||
                          texto.includes("produto") || texto.includes("catalogo") || texto.includes("catálogo") ||
                          texto.includes("prazo") || texto.includes("arte") || texto.includes("logo");

      if (expirado || ehOpcaoMenu) {
        estadosConversa.delete(msg.from);
        // Não retorna aqui se for opção de menu, permitindo que caia diretamente no switch/if da opção desejada
      } else {
        estadosConversa.delete(msg.from);
        console.log(\`📝 [Questionário Respondido] Interpretando dados enviados por \${msg.from}...\`);

        let nomeContato = "Cliente";
        try {
          const contact = await msg.getContact();
          if (contact && (contact.name || contact.pushname)) {
            nomeContato = contact.name || contact.pushname;
          }
        } catch (e) {}

        const dadosOrcamento = interpretarRespostaQuestionario(msg.body, nomeContato);
        const calculo = calcularOrcamento(dadosOrcamento);
        const respostaOrcamento = gerarRespostaOrcamento(calculo);

        // Atualiza estatísticas
        stats.totalOrcamentos++;
        ultimosOrcamentos.unshift({
          codigo: calculo.dados.codigo || "ORC-" + Date.now(),
          cliente: calculo.dados.cliente || "Cliente",
          total: calculo.totalLiquido,
          pecas: calculo.totalPecas,
          data: new Date().toISOString(),
        });
        if (ultimosOrcamentos.length > 20) ultimosOrcamentos.pop();

        // Sincroniza e grava no banco de dados do Painel Admin (/api/quotes)
        salvarOrcamentoNoBanco(calculo, msg.from);

        // Notifica admin sobre novo orçamento
        const valorMoeda = (calculo.totalLiquido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        dispararNotificacaoAdmin({
          tipo: "NOVO_ORCAMENTO",
          titulo: \`💰 Novo Orçamento Gerado (\${valorMoeda})\`,
          mensagem: \`*Cliente:* \${nomeContato}\\n*Volume:* \${calculo.totalPecas} peças\\n*Valor Total:* \${valorMoeda}\`,
          dados: { clientePhone: msg.from, nome: nomeContato },
        });

        await responder(respostaOrcamento);
        return;
      }
    }

    // =====================================
    // 1. RECONHECIMENTO DE MENSAGENS DO SITE
    // =====================================
    const veioDoSite =
      texto.includes("vim pelo site") ||
      texto.includes("vim do site") ||
      texto.includes("orçamento do site") ||
      texto.includes("solicitar orçamento") ||
      texto.includes("quero um orçamento");

    // =====================================
    // 2. GATILHOS INICIAIS (SAUDAÇÃO / SITE / MENU)
    // =====================================
    if (veioDoSite || /^(menu|oi|olá|ola|bom dia|boa tarde|boa noite|iniciar|começar|comecar|help|ajuda)$/i.test(texto)) {
      const hora = new Date().getHours();
      let saudacao = "Olá";
      if (hora >= 5 && hora < 12) saudacao = "Bom dia";
      else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
      else saudacao = "Boa noite";

      let intro = "";
      if (veioDoSite) {
        intro = \`Que ótimo receber você aqui pelo nosso site! 🌐\\n\`;
      }

      const menuPrincipal =
        \`👋 \${saudacao}! Seja muito bem-vindo(a) à *Tenório Confecções*! 🧵✨\\n\` +
        \`\${intro}\\n\` +
        \`Somos especialistas em vestuário personalizado para *escolas, faculdades, empresas, eventos e equipes*.\\n\\n\` +
        \`Como podemos te ajudar hoje? Digite o *número* da opção desejada:\\n\\n\` +
        \`1️⃣ 📋 *Fazer um Orçamento Rápido*\\n\` +
        \`2️⃣ 👕 *Ver Linha de Produtos / Portfólio*\\n\` +
        \`3️⃣ ⏱️ *Prazos, Quantidades Mínimas e Pagamento*\\n\` +
        \`4️⃣ 🎨 *Enviar Minha Logo / Arte para Avaliação*\\n\` +
        \`5️⃣ 👤 *Falar com um Vendedor / Atendente*\\n\\n\` +
        \`_A qualquer momento, digite *menu* para voltar aqui._\`;

      await responder(menuPrincipal);
      return;
    }

    // =====================================
    // 3. OPÇÃO 1: FAZER ORÇAMENTO
    // =====================================
    if (texto === "1" || texto.includes("orcamento") || texto.includes("orçamento") || texto.includes("cotacao") || texto.includes("cotação")) {
      estadosConversa.set(msg.from, { etapa: "AGUARDANDO_DADOS_ORCAMENTO", timestamp: Date.now() });
      const msgOrcamento =
        \`📋 *SOLICITAÇÃO DE ORÇAMENTO - TENÓRIO CONFECÇÕES*\\n\\n\` +
        \`Para montarmos sua proposta personalizada no menor tempo possível, por favor nos envie:\\n\\n\` +
        \`1️⃣ *Tipo de produto:* (ex: Camisetas algodão/dry-fit, Camisas Polo, Moletons, Jalecos, Coletes, Calças, Bonés, etc.)\\n\` +
        \`2️⃣ *Segmento:* (Escolar, Universitário, Corporativo/Empresarial ou Evento)\\n\` +
        \`3️⃣ *Quantidade estimada:* (ex: 15, 50, 100+ peças)\\n\` +
        \`4️⃣ *Tipo de personalização:* (Bordado, Silk Screen, DTF/Sublimação ou não sabe ainda)\\n\` +
        \`5️⃣ *Possui a arte/logo?* (Se sim, pode enviar a imagem logo em seguida)\\n\\n\` +
        \`✍️ *Responda tudo em uma única mensagem* que nosso robô já vai calcular sua cotação completa na hora!\\n\\n\` +
        \`_Digite *menu* para retornar ao início._\`;

      await responder(msgOrcamento);
      return;
    }

    // =====================================
    // 4. OPÇÃO 2: PRODUTOS E PORTFÓLIO (LISTAGEM DINÂMICA)
    // =====================================
    if (texto === "2" || texto.includes("produto") || texto.includes("catalogo") || texto.includes("catálogo") || texto.includes("portfolio") || texto.includes("portfólio")) {
      let produtosLista = [];
      try {
        const tab = carregarTabelaPrecos();
        if (tab && Array.isArray(tab.produtos)) {
          produtosLista = tab.produtos;
        }
      } catch (e) {
        console.error("Erro ao carregar tabela de produtos:", e);
      }

      let msgProdutos = \`👕 *CATÁLOGO DE PRODUTOS PERSONALIZADOS — TENÓRIO CONFECÇÕES*\\n\`;
      msgProdutos += \`Confira os produtos disponíveis para confecção e personalização:\\n\\n\`;

      if (produtosLista.length === 0) {
        msgProdutos += \`_Nenhum produto cadastrado no momento._\\n\\n\`;
      } else {
        produtosLista.forEach((prod, index) => {
          const valor = Number(prod.precoBase ?? prod.precoBaseUnitario ?? 0);
          const precoFormatado = valor > 0 ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Sob Consulta';
          
          msgProdutos += \`*\${index + 1}. \${prod.nome}*\\n\`;
          msgProdutos += \`• 🏷️ *A partir de:* \${precoFormatado}\`;
          if (prod.quantidadeMinima) {
            msgProdutos += \` _(Mínimo: \${prod.quantidadeMinima} un)_\`;
          }
          msgProdutos += \`\\n\`;

          if (prod.prazoConfeccao) {
            msgProdutos += \`• ⏱️ *Prazo de produção:* \${prod.prazoConfeccao}\\n\`;
          }

          if (prod.variacoes && prod.variacoes.length > 0) {
            const resumoVar = prod.variacoes.slice(0, 5).map(v => {
              const vPreco = Number(v.preco ?? 0);
              const vPrecoStr = vPreco > 0 ? \` (R$ \${vPreco.toFixed(2).replace('.', ',')})\` : '';
              return \`\${v.nome || v.termo}\${vPrecoStr}\`;
            }).join(', ');
            const maisVar = prod.variacoes.length > 5 ? \` e +\${prod.variacoes.length - 5} opções\` : '';
            msgProdutos += \`• 📐 *Opções/Variações:* \${resumoVar}\${maisVar}\\n\`;
          }

          if (prod.gradeTamanhos && prod.gradeTamanhos.length > 0) {
            msgProdutos += \`• 📏 *Tamanhos:* \${prod.gradeTamanhos.join(', ')}\\n\`;
          }

          if (prod.observacoes) {
            msgProdutos += \`• ℹ️ _\${prod.observacoes}_\\n\`;
          }

          msgProdutos += \`\\n\`;
        });
      }

      msgProdutos += \`━━━━━━━━━━━━━━━━━━━━━\\n\`;
      msgProdutos += \`🌐 *Catálogo completo com fotos no nosso site:*\\nhttps://www.tenorioconfeccoes.shop/produtos\\n\\n\`;
      msgProdutos += \`✨ *Todos os itens contam com acabamento profissional e personalização de alta durabilidade.*\\n\\n\`;
      msgProdutos += \`💬 *O que deseja fazer agora?*\\n\`;
      msgProdutos += \`• Digite *1* para solicitar um orçamento rápido.\\n\`;
      msgProdutos += \`• Digite *5* para falar com um atendente humano.\\n\`;
      msgProdutos += \`• Digite *menu* para retornar ao início.\`;

      await responder(msgProdutos);
      return;
    }

    // =====================================
    // 5. OPÇÃO 3: PRAZOS, QUANTIDADE MÍNIMA E PAGAMENTO
    // =====================================
    if (texto === "3" || texto.includes("prazo") || texto.includes("minimo") || texto.includes("mínimo") || texto.includes("pagamento")) {
      const msgInformacoes =
        \`ℹ️ *INFORMAÇÕES GERAIS DE PEDIDOS:*\\n\\n\` +
        \`📦 *Quantidade Mínima:* Atendemos pedidos a partir de 1 unidade por modelo/arte dependendo do produto selecionado.\\n\\n\` +
        \`⏱️ *Prazo de Produção:* Geralmente entre 7 a 15 dias úteis após a aprovação do layout virtual e confirmação do pedido.\\n\\n\` +
        \`💳 *Formas de Pagamento:* Atualmente aceitamos somente pagamentos via PIX.\\n\\n\` +
        \`🚚 *Entrega:* Enviamos para todo o Brasil ou retirada direto conosco.\\n\\n\` +
        \`_Digite *1* para fazer orçamento ou *menu* para voltar._\`;

      await responder(msgInformacoes);
      return;
    }

    // =====================================
    // 6. OPÇÃO 4: ENVIAR LOGO / ARTE
    // =====================================
    if (texto === "4" || texto.includes("logo") || texto.includes("arte") || texto.includes("estampa") || texto.includes("vetor")) {
      const msgArte =
        \`🎨 *ENVIO DE ARTE / LOGOMARCA*\\n\\n\` +
        \`Pode enviar seu arquivo diretamente por aqui! 📎\\n\\n\` +
        \`💡 *Dicas para melhor qualidade:*\\n\` +
        \`• Aceitamos imagens em alta resolução (PNG, JPG, PDF) ou vetor (Corel, Illustrator).\\n\` +
        \`• Se ainda não tem a arte pronta, não se preocupe! Nossa equipe cria um modelo virtual para você aprovar antes de estampar.\\n\\n\` +
        \`Envie sua imagem e informe a quantidade aproximada para avaliarmos! 🚀\`;

      await responder(msgArte);
      return;
    }

    // =====================================
    // 7. OPÇÃO 5: FALAR COM ATENDENTE
    // =====================================
    if (texto === "5" || texto.includes("atendente") || texto.includes("humano") || texto.includes("vendedor") || texto.includes("falar com atendente")) {
      let nomeContato = "Cliente";
      try {
        const contact = await msg.getContact();
        if (contact && (contact.name || contact.pushname)) {
          nomeContato = contact.name || contact.pushname;
        }
      } catch (e) {}

      registrarClienteAguardando(msg.from, nomeContato, "Solicitou Falar com Atendente Humano (Opção 5)");

      const msgAtendente =
        \`👨‍💼 *ATENDIMENTO HUMANIZADO*\\n\\n\` +
        \`Perfeito! Já notifiquei um de nossos consultores da *Tenório Confecções*.\\n\\n\` +
        \`Por favor, deixe sua dúvida ou detalhes do pedido abaixo que em instantes você será atendido(a)! ⏳🤝\`;

      await responder(msgAtendente);
      return;
    }

    // =====================================
    // 8. RESPOSTA PADRÃO (OPÇÃO NÃO RECONHECIDA)
    // =====================================
    await responder(
      \`Olá! Não entendi essa opção. 🤔\\n\\n\` +
      \`Por favor, digite o *número de 1 a 5* correspondente à opção desejada, ou digite *menu* para ver as opções novamente.\`
    );

  } catch (error) {
    console.error("❌ Erro no processamento da mensagem:", error);
  }
});

// =====================================
// API HTTP PARA O PAINEL ADMIN
// =====================================
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 1. Status do Robô, QR Code, Fila de Atendimento e Configs
app.get("/api/status", (req, res) => {
  const tabela = carregarTabelaPrecos();
  const configNotif = carregarConfigNotificacoes();
  const totalAguardando = clientesAguardandoHumano.filter((c) => c.status === "AGUARDANDO").length;

  res.json({
    status: botStatus,
    qrCode: qrCodeDataUrl,
    info: botInfo,
    stats: {
      ...stats,
      totalProdutos: tabela.produtos ? tabela.produtos.length : 0,
      totalAguardandoHumano: totalAguardando,
    },
    ultimosOrcamentos,
    clientesAguardando: clientesAguardandoHumano,
    notificacoes: configNotif,
  });
});

// 1.1 Marcar Atendimento como Concluído
app.post("/api/atendimento/:id/concluir", (req, res) => {
  const id = req.params.id;
  const index = clientesAguardandoHumano.findIndex((c) => c.id === id);
  if (index >= 0) {
    clientesAguardandoHumano[index].status = "ATENDIDO";
    clientesAguardandoHumano[index].concluidoEm = new Date().toISOString();
    console.log(\`✅ [Fila de Atendimento] Atendimento concluído: \${clientesAguardandoHumano[index].nome}\`);
    res.json({ success: true, message: "Atendimento marcado como concluído!", item: clientesAguardandoHumano[index] });
  } else {
    res.status(404).json({ success: false, message: "Cliente não encontrado na fila." });
  }
});

// 1.2 Excluir Item da Fila de Atendimento
app.delete("/api/atendimento/:id", (req, res) => {
  const id = req.params.id;
  const index = clientesAguardandoHumano.findIndex((c) => c.id === id);
  if (index >= 0) {
    const removido = clientesAguardandoHumano.splice(index, 1);
    console.log(\`🗑️ [Fila de Atendimento] Cliente removido da fila: \${removido[0]?.nome}\`);
    res.json({ success: true, message: "Removido da fila com sucesso!", removido: removido[0] });
  } else {
    res.status(404).json({ success: false, message: "Cliente não encontrado." });
  }
});

// 1.3 Obter e Salvar Configurações de Notificações
app.get("/api/config/notificacoes", (req, res) => {
  res.json({ success: true, config: carregarConfigNotificacoes() });
});

app.post("/api/config/notificacoes", (req, res) => {
  try {
    const novaConfig = req.body;
    salvarConfigNotificacoes(novaConfig);
    console.log("💾 [Configurações] Notificações atualizadas via painel admin!");
    res.json({ success: true, message: "Configurações salvas com sucesso!", config: novaConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/config/notificacoes/test", async (req, res) => {
  try {
    const config = carregarConfigNotificacoes();
    await dispararNotificacaoAdmin({
      tipo: "TESTE",
      titulo: "🔔 Teste de Notificação Tenório Confecções",
      mensagem: "Este é um teste de alerta instantâneo enviado pelo seu sistema de atendimento!",
      dados: { clientePhone: config.adminPhone || "5581999999999", nome: "Administrador" },
    });
    res.json({ success: true, message: "Teste de notificação disparado com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Reiniciar Robô / Forçar novo QR Code
app.post("/api/restart", async (req, res) => {
  try {
    console.log("🔄 [API] Reiniciando conexão do WhatsApp...");
    if (client) {
      try {
        await client.destroy();
      } catch (e) {}
    }
    criarClienteWhatsApp();
    res.json({ success: true, message: "Cliente WhatsApp reiniciado com sucesso!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Desconectar Sessão
app.post("/api/logout", async (req, res) => {
  try {
    console.log("🔌 [API] Desconectando sessão do WhatsApp...");
    if (client) {
      await client.logout();
      botStatus = "DISCONNECTED";
      qrCodeDataUrl = null;
    }
    res.json({ success: true, message: "WhatsApp desconectado com sucesso!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Obter Tabela de Preços Completa
app.get("/api/tabela", (req, res) => {
  try {
    const tabela = carregarTabelaPrecos();
    res.json({ success: true, tabela });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Salvar Tabela de Preços Completa
app.post("/api/tabela", (req, res) => {
  try {
    const novaTabela = req.body;
    if (!novaTabela || !Array.isArray(novaTabela.produtos)) {
      return res.status(400).json({ success: false, message: "Formato inválido para tabela de preços." });
    }
    salvarTabelaPrecos(novaTabela);
    console.log("💾 [API] Tabela de preços atualizada via painel admin!");
    res.json({ success: true, message: "Tabela de preços salva com sucesso!", tabela: novaTabela });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Adicionar Novo Produto
app.post("/api/produtos", (req, res) => {
  try {
    const novoProduto = req.body;
    if (!novoProduto || !novoProduto.nome) {
      return res.status(400).json({ success: false, message: "Nome do produto é obrigatório." });
    }
    const tabela = carregarTabelaPrecos();
    tabela.produtos.push(novoProduto);
    salvarTabelaPrecos(tabela);
    console.log(\`➕ [API] Novo produto cadastrado: \${novoProduto.nome}\`);
    res.json({ success: true, message: "Produto cadastrado com sucesso!", produto: novoProduto, tabela });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Editar Produto por Índice
app.put("/api/produtos/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const produtoEditado = req.body;
    const tabela = carregarTabelaPrecos();

    if (isNaN(index) || index < 0 || index >= tabela.produtos.length) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    tabela.produtos[index] = produtoEditado;
    salvarTabelaPrecos(tabela);
    console.log(\`✏️ [API] Produto editado: \${produtoEditado.nome} (índice \${index})\`);
    res.json({ success: true, message: "Produto atualizado com sucesso!", produto: produtoEditado, tabela });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Excluir Produto por Índice
app.delete("/api/produtos/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const tabela = carregarTabelaPrecos();

    if (isNaN(index) || index < 0 || index >= tabela.produtos.length) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    const removido = tabela.produtos.splice(index, 1);
    salvarTabelaPrecos(tabela);
    console.log(\`🗑️ [API] Produto removido: \${removido[0]?.nome}\`);
    res.json({ success: true, message: "Produto removido com sucesso!", removido: removido[0], tabela });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Simulação de Teste de Cálculo
app.post("/api/test-calculo", (req, res) => {
  try {
    const dados = req.body;
    const calculo = calcularOrcamento(dados);
    const resposta = gerarRespostaOrcamento(calculo);
    res.json({ success: true, calculo, resposta });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inicialização do Servidor HTTP
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`🚀 [API do Chatbot] Servidor Express ativo na porta \${PORT} (http://localhost:\${PORT})\`);
});
`;

fs.writeFileSync(path.join(__dirname, 'chatbot.js'), chatbotContent, 'utf-8');
console.log('✅ chatbot.js atualizado com notificações de WhatsApp e Web Push!');
