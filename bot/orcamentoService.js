// =====================================
// SERVIÇO DE PROCESSAMENTO DE ORÇAMENTOS
// =====================================
const fs = require("fs");
const path = require("path");

/// Carrega tabela de preços (com fallback caso o arquivo seja modificado dinamicamente e integração com banco SQLite)
function carregarTabelaPrecos() {
  let tabela = {
    produtos: [],
    precoPadrao: 39.9,
    custoAdicionalPorLocalExtra: 5.0,
    descontoProgressivo: [
      { min: 1, max: 10, percentual: 0, descricao: "Sem desconto" },
      { min: 11, max: 99999, percentual: 0, descricao: "Sem desconto" },
    ],
    informacoesPagamento: {
      forma: "PIX",
      condicao: "50% de entrada para início da confecção + 50% na conclusão/despacho do pedido.",
      prazoProducao: "7 a 12 dias úteis após a aprovação do layout virtual.",
    },
  };

  try {
    const caminho = path.join(__dirname, "tabelaPrecos.json");
    if (fs.existsSync(caminho)) {
      const conteudo = fs.readFileSync(caminho, "utf-8");
      tabela = JSON.parse(conteudo);
    }
  } catch (err) {
    console.error("⚠️ Erro ao ler tabelaPrecos.json, usando valores padrão:", err);
  }

  // Se o banco dev.db existir no projeto, sincroniza os pricingTiers atualizados
  try {
    const pathsToCheck = [
      path.join(__dirname, "../dev.db"),
      path.join(__dirname, "dev.db"),
      path.join(process.cwd(), "dev.db")
    ];
    let dbPath = pathsToCheck.find(p => fs.existsSync(p));
    if (dbPath) {
      const { DatabaseSync } = require("node:sqlite");
      const db = new DatabaseSync(dbPath);
      const rows = db.prepare("SELECT id, name, slug, category, basePrice, pricingTiers, leadTime, minQuantity FROM Product WHERE active = 1").all();
      
      if (rows && rows.length > 0) {
        for (const row of rows) {
          if (!row.pricingTiers && !row.basePrice) continue;
          
          let parsedTiers = null;
          try {
            parsedTiers = typeof row.pricingTiers === "string" ? JSON.parse(row.pricingTiers) : row.pricingTiers;
          } catch {}

          // Encontra o produto correspondente na tabela de preços
          const nomeNormalizado = (row.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const prodExistente = (tabela.produtos || []).find((p) => {
            const pNome = (p.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return pNome.includes(nomeNormalizado) || nomeNormalizado.includes(pNome) || 
                   (p.termos && p.termos.some(t => nomeNormalizado.includes(t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))));
          });

          if (prodExistente) {
            if (row.leadTime && !prodExistente.prazoConfeccao) prodExistente.prazoConfeccao = row.leadTime;
            if (parsedTiers) {
              if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
                prodExistente.pricingTiers = parsedTiers;
              } else if (parsedTiers.mode === "by_variant" && parsedTiers.variantTiers) {
                prodExistente.pricingConfig = parsedTiers;
              } else if (parsedTiers.mode === "unified" && Array.isArray(parsedTiers.tiers) && parsedTiers.tiers.length > 0) {
                prodExistente.pricingTiers = parsedTiers.tiers;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    // Silencioso se SQLite não estiver acessível, usa tabelaPrecos.json
  }

  return tabela;
}

/**
 * Função utilitária para resolver o preço unitário a partir de faixas (pricingTiers)
 */
function resolverPrecoPorFaixa(tiersInput, quantidade) {
  if (!tiersInput) return null;
  let tiers = tiersInput;
  if (typeof tiers === "string") {
    try {
      tiers = JSON.parse(tiers);
    } catch {
      return null;
    }
  }
  if (tiers && typeof tiers === "object" && !Array.isArray(tiers)) {
    if (Array.isArray(tiers.tiers)) {
      tiers = tiers.tiers;
    }
  }
  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  const qtd = Number(quantidade) || 1;
  const tiersValidos = tiers
    .map((t) => ({
      minQty: Number(t.minQty || t.min || t.quantidadeMinima || 0),
      maxQty: t.maxQty !== null && t.maxQty !== undefined && t.maxQty !== "" ? Number(t.maxQty || t.max || t.quantidadeMaxima) : null,
      unitPrice: Number(t.unitPrice || t.preco || t.precoUnitario || 0),
    }))
    .filter((t) => t.minQty > 0 && t.unitPrice > 0)
    .sort((a, b) => a.minQty - b.minQty);

  if (tiersValidos.length === 0) return null;

  // Busca faixa que engloba a quantidade informada
  for (const tier of tiersValidos) {
    if (qtd >= tier.minQty) {
      if (tier.maxQty === null || tier.maxQty === undefined || qtd <= tier.maxQty) {
        return tier.unitPrice;
      }
    }
  }

  // Se a quantidade for menor que a primeira faixa
  if (qtd < tiersValidos[0].minQty) {
    return tiersValidos[0].unitPrice;
  }

  // Se for superior a todas as faixas
  return tiersValidos[tiersValidos.length - 1].unitPrice;
}

/**
 * Verifica se a mensagem recebida é uma solicitação de orçamento vinda do site
 */
function identificarOrcamento(texto) {
  if (!texto) return false;
  const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return (
    textoLimpo.includes("SOLICITACAO DE ORCAMENTO") ||
    textoLimpo.includes("SOLICITACAO DE COTACAO") ||
    textoLimpo.includes("CODIGO DO ORCAMENTO") ||
    textoLimpo.includes("CODIGO DE ORCAMENTO") ||
    (textoLimpo.includes("ITENS DO PEDIDO") && (textoLimpo.includes("ORCAMENTO") || textoLimpo.includes("COTACAO") || textoLimpo.includes("CONFECCOES") || textoLimpo.includes("TENORIO"))) ||
    (textoLimpo.includes("TENORIO CONFECCOES") && (textoLimpo.includes("ORCAMENTO") || textoLimpo.includes("COTACAO")) && (textoLimpo.includes("QUANTIDADE") || textoLimpo.includes("GRADE") || textoLimpo.includes("ITENS")))
  );
}

/**
 * Extrai todos os dados estruturados do orçamento enviado pelo site
 */
function parseOrcamento(textoOriginal) {
  const dados = {
    codigo: "",
    cliente: "",
    whatsapp: "",
    email: "",
    localizacao: "",
    prazoDesejado: "",
    observacoes: "",
    itens: [],
  };

  // Normalização de quebras de linha
  const texto = (textoOriginal || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Expressões regulares para cabeçalho
  const matchCodigo = texto.match(/C[oó]digo\s*(?:do|de)?\s*Or[cç]amento[:*\s~_]*([A-Za-z0-9\-_]+)/i);
  if (matchCodigo) dados.codigo = matchCodigo[1].trim();

  const matchCliente = texto.match(/(?:^|\n)\s*(?:\*)?Cliente[:*\s~_]*([^\n\r]+)/i);
  if (matchCliente) dados.cliente = matchCliente[1].replace(/[*_~]/g, "").trim();

  const matchWhatsapp = texto.match(/(?:^|\n)\s*(?:\*)?WhatsApp[:*\s~_]*([^\n\r]+)/i);
  if (matchWhatsapp) dados.whatsapp = matchWhatsapp[1].replace(/[*_~]/g, "").trim();

  const matchEmail = texto.match(/(?:^|\n)\s*(?:\*)?E-?mail[:*\s~_]*([^\n\r]+)/i);
  if (matchEmail) dados.email = matchEmail[1].replace(/[*_~]/g, "").trim();

  const matchLocalizacao = texto.match(/(?:^|\n)\s*(?:\*)?Localiza[cç][aã]o[:*\s~_]*([^\n\r]+)/i);
  if (matchLocalizacao) dados.localizacao = matchLocalizacao[1].replace(/[*_~]/g, "").trim();

  const matchPrazo = texto.match(/(?:^|\n)\s*(?:\*)?Prazo\s*Desejado[:*\s~_]*([^\n\r]+)/i);
  if (matchPrazo) dados.prazoDesejado = matchPrazo[1].replace(/[*_~]/g, "").trim();

  const matchObs = texto.match(/(?:^|\n)\s*(?:\*)?OBSERVA[CÇ][OÕ]ES\s*GERAIS[:*\s~_]*([^\n\r]+)/i);
  if (matchObs) dados.observacoes = matchObs[1].replace(/[*_~]/g, "").trim();

  // Extração dos itens do pedido
  // Localiza o bloco após ITENS DO PEDIDO
  const idxItens = texto.search(/ITENS\s*DO\s*PEDIDO/i);
  let blocoItens = idxItens !== -1 ? texto.substring(idxItens) : texto;

  // Remove seções posteriores como VALOR ESTIMADO TOTAL, OBSERVAÇÕES, links ou saudações
  const idxFim = blocoItens.search(/(?:VALOR\s*ESTIMADO\s*TOTAL|OBSERVA[CÇ][OÕ]ES\s*GERAIS|ARTE\(S\)\s*ENVIADA|Ver\s*detalhes\s*do\s*orçamento|Olá!|Ola!)/i);
  if (idxFim !== -1 && idxFim > 0) {
    blocoItens = blocoItens.substring(0, idxFim);
  }

  // Divide itens enumerados (ex: *1. Camiseta...* ou 1. Camiseta...)
  const regexItem = /(?:^|\n)\s*(?:\*)?(\d+)\.\s*([^\n\r]+)([\s\S]*?)(?=(?:(?:^|\n)\s*(?:\*)?\d+\.\s*)|$)/gi;
  let match;

  while ((match = regexItem.exec(blocoItens)) !== null) {
    const numero = match[1];
    let nome = match[2].replace(/^[*_~]+|[*_~]+$/g, "").trim();
    const detalhes = match[3];

    // Quantidade: busca variações de formatação e remove marcadores de negrito/itálico
    let quantidade = 0;
    const matchQtd = detalhes.match(/(?:quantidade|qtd|volume|unidades?|pe[çc]as?)[:*\s~_]*([0-9]+)/i);
    if (matchQtd) {
      quantidade = parseInt(matchQtd[1], 10);
    }

    // Grade de Tamanhos / Variações
    const matchGrade = detalhes.match(/Grade\s*(?:de\s*Tamanhos(?:\/Varia[cç][oõ]es)?)?[:*\s~_]*([^\n\r]+)/i);
    const grade = matchGrade ? matchGrade[1].replace(/^[•\-\s*~_]+|[•\-\s*~_]+$/g, "").trim() : "";

    // Se a quantidade veio zerada ou não foi identificada, calcula somando a grade de tamanhos (ex: "M: 30 | G: 20" -> 50 un)
    if (!quantidade || quantidade === 0) {
      if (grade) {
        const matchesGradeNums = grade.matchAll(/:\s*([0-9]+)|([0-9]+)\s*(?:un|pe[çc]as?)/gi);
        let somaGrade = 0;
        for (const gMatch of matchesGradeNums) {
          const valor = parseInt(gMatch[1] || gMatch[2], 10);
          if (valor > 0) somaGrade += valor;
        }
        if (somaGrade > 0) {
          quantidade = somaGrade;
        }
      }
    }

    // Se ainda não achou, busca qualquer número com unidades nas linhas do item
    if (!quantidade || quantidade === 0) {
      const matchAvulso = detalhes.match(/([0-9]+)\s*(?:unidades?|unids?|un|pe[çc]as?|pcs?)\b/i);
      if (matchAvulso) {
        quantidade = parseInt(matchAvulso[1], 10);
      }
    }

    // Fallback para 1 unidade caso não tenha nenhuma menção
    if (!quantidade || quantidade <= 0) {
      quantidade = 1;
    }

    // Preço Estimado unitário do site (ex: "• Preço Estimado: R$ 45,80 / un")
    let precoEstimadoSite = null;
    const matchPrecoSite = detalhes.match(/Pre[çc]o\s*Estimado[:*\s~_]*R\$\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    if (matchPrecoSite) {
      precoEstimadoSite = parseFloat(matchPrecoSite[1].replace(",", "."));
    }

    // Estampa
    const matchEstampa = detalhes.match(/Estampa[:*\s~_]*([^\n\r]+)/i);
    const estampa = matchEstampa ? matchEstampa[1].replace(/^[•\-\s*~_]+|[•\-\s*~_]+$/g, "").trim() : "";

    // Locais
    const matchLocais = detalhes.match(/Locais[:*\s~_]*([^\n\r]+)/i);
    const locais = matchLocais ? matchLocais[1].replace(/^[•\-\s*~_]+|[•\-\s*~_]+$/g, "").trim() : "";

    dados.itens.push({
      numero,
      nome,
      quantidade,
      grade,
      estampa,
      locais,
      precoEstimadoSite,
    });
  }

  // Fallback caso não tenha conseguido usar o regex de enumeração
  if (dados.itens.length === 0 && blocoItens.trim().length > 0) {
    let quantidade = 0;
    const matchQtd = blocoItens.match(/(?:quantidade|qtd|volume|unidades?|pe[çc]as?)[:*\s~_]*([0-9]+)/i) ||
                     blocoItens.match(/([0-9]+)\s*(?:unidades?|unids?|un|pe[çc]as?|pcs?)\b/i);
    if (matchQtd) {
      quantidade = parseInt(matchQtd[1], 10);
    }
    if (!quantidade || quantidade <= 0) quantidade = 1;

    dados.itens.push({
      numero: "1",
      nome: "Produto Personalizado",
      quantidade,
      grade: "",
      estampa: "",
      locais: "",
      precoEstimadoSite: null,
    });
  }

  return dados;
}

/**
 * Busca preço unitário base e adicionais para um produto (considerando possíveis variações e faixas de quantidade / pricingTiers)
 */
function obterPrecoUnitario(item, tabela) {
  const nomeLimpo = (item.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const textoParaVariacao = `${item.nome || ""} ${item.grade || ""} ${item.estampa || ""} ${item.locais || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let precoEncontrado = null;
  let nomeOficial = item.nome;
  let prazoConfeccao = null;
  let produtoEncontrado = null;
  let variacaoIdentificada = null;

  for (const prod of (tabela.produtos || [])) {
    for (const termo of (prod.termos || [])) {
      const termoLimpo = termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (nomeLimpo.includes(termoLimpo)) {
        produtoEncontrado = prod;
        precoEncontrado = prod.precoBase;
        nomeOficial = prod.nome;
        prazoConfeccao = prod.prazoConfeccao;
        break;
      }
    }
    if (produtoEncontrado) break;
  }

  // Se o produto foi identificado e possui variações de preço cadastradas
  if (produtoEncontrado && Array.isArray(produtoEncontrado.variacoes) && produtoEncontrado.variacoes.length > 0) {
    // Mapeia todas as opções de variações e seus termos, ordenando termos mais longos primeiro
    const listaVariacoes = [];
    for (const v of produtoEncontrado.variacoes) {
      if (Array.isArray(v.termos)) {
        for (const t of v.termos) {
          listaVariacoes.push({
            nome: v.nome,
            preco: v.preco,
            pricingTiers: v.pricingTiers || v.faixasPreco,
            termo: t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          });
        }
      }
    }

    listaVariacoes.sort((a, b) => b.termo.length - a.termo.length);

    for (const itemVar of listaVariacoes) {
      // Verifica se o termo está contido no texto
      const regexTermo = new RegExp(`(?:^|[^a-z0-9])${itemVar.termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`, "i");
      if (regexTermo.test(textoParaVariacao) || textoParaVariacao.includes(itemVar.termo)) {
        precoEncontrado = itemVar.preco;
        variacaoIdentificada = itemVar.nome;

        if (itemVar.pricingTiers) {
          const tierPrice = resolverPrecoPorFaixa(itemVar.pricingTiers, item.quantidade);
          if (tierPrice !== null && tierPrice > 0) {
            precoEncontrado = tierPrice;
          }
        }
        break;
      }
    }
  }

  // Aplica cálculo de faixas de preço / pricingTiers do produto (ex: 1 a 10 un -> R$ 49,90 | 11+ un -> R$ 45,80)
  if (produtoEncontrado) {
    if (produtoEncontrado.pricingTiers || produtoEncontrado.faixasPreco) {
      const tiers = produtoEncontrado.pricingTiers || produtoEncontrado.faixasPreco;
      const tierPrice = resolverPrecoPorFaixa(tiers, item.quantidade);
      if (tierPrice !== null && tierPrice > 0) {
        precoEncontrado = tierPrice;
      }
    } else if (produtoEncontrado.pricingConfig && produtoEncontrado.pricingConfig.mode === "by_variant" && variacaoIdentificada) {
      const vTiers = produtoEncontrado.pricingConfig.variantTiers?.[variacaoIdentificada];
      if (vTiers) {
        const tierPrice = resolverPrecoPorFaixa(vTiers, item.quantidade);
        if (tierPrice !== null && tierPrice > 0) {
          precoEncontrado = tierPrice;
        }
      }
    }
  }

  // Se o site enviou um Preço Estimado explícito e não encontramos regra conflitante, adota o valor do site
  if (precoEncontrado === null && item.precoEstimadoSite && item.precoEstimadoSite > 0) {
    precoEncontrado = item.precoEstimadoSite;
  }

  if (precoEncontrado === null) {
    precoEncontrado = tabela.precoPadrao || 39.9;
  }
  if (!prazoConfeccao) {
    prazoConfeccao = tabela.prazoPadrao || "7 a 12 dias úteis";
  }

  const permiteDescontoProgressivo = produtoEncontrado
    ? produtoEncontrado.permiteDescontoProgressivo !== false && !produtoEncontrado.semDescontoProgressivo
    : true;

  const quantidadeMinima = produtoEncontrado ? produtoEncontrado.quantidadeMinima || null : null;
  const quantidadeMinimaPorVariacao = produtoEncontrado ? produtoEncontrado.quantidadeMinimaPorVariacao || null : null;

  // Adicional de locais extras de estampa (ex: "Frente e Costas", "Frente, Manga" = locais adicionais além do primeiro)
  let adicionalLocais = 0;
  if (item.locais) {
    const locaisSeparados = item.locais
      .split(/\s+(?:e|\+)\s+|[,&/|]/i)
      .map((l) => l.trim())
      .filter(Boolean);
    if (locaisSeparados.length > 1) {
      const locaisExtras = locaisSeparados.length - 1;
      adicionalLocais = locaisExtras * (tabela.custoAdicionalPorLocalExtra || 5.0);
    }
  }

  return {
    nomeOficial,
    precoBase: precoEncontrado,
    variacaoIdentificada,
    permiteDescontoProgressivo,
    quantidadeMinima,
    quantidadeMinimaPorVariacao,
    adicionalLocais,
    precoUnitarioBruto: precoEncontrado + adicionalLocais,
    prazoConfeccao,
  };
}

/**
 * Calcula os valores de todos os itens aplicando desconto progressivo nos elegíveis
 */
function calcularOrcamento(dados) {
  const tabela = carregarTabelaPrecos();

  // Contagem total de peças no pedido para aplicar a faixa de desconto por volume
  const totalPecas = dados.itens.reduce((acc, item) => acc + (item.quantidade || 0), 0) || 1;

  // Encontra a faixa de desconto progressivo correspondente
  let faixaDesconto = { min: 1, max: 99999, percentual: 0, descricao: "Sem desconto" };
  for (const faixa of tabela.descontoProgressivo) {
    if (totalPecas >= faixa.min && totalPecas <= faixa.max) {
      faixaDesconto = faixa;
      break;
    }
  }

  const itensCalculados = dados.itens.map((item) => {
    const precificacao = obterPrecoUnitario(item, tabela);
    const precoUnitarioBruto = precificacao.precoUnitarioBruto;
    const permiteDesconto = precificacao.permiteDescontoProgressivo !== false;
    const fatorDesconto = (permiteDesconto && faixaDesconto.percentual > 0)
      ? (1 - faixaDesconto.percentual / 100)
      : 1;
    const precoUnitarioLiquido = precoUnitarioBruto * fatorDesconto;
    const subtotalBruto = precoUnitarioBruto * item.quantidade;
    const subtotalLiquido = precoUnitarioLiquido * item.quantidade;

    const minQtd = precificacao.quantidadeMinimaPorVariacao || precificacao.quantidadeMinima || 0;
    const abaixoDoMinimo = minQtd > 0 && item.quantidade < minQtd;

    return {
      ...item,
      nomeOficial: precificacao.nomeOficial,
      precoBase: precificacao.precoBase,
      variacaoIdentificada: precificacao.variacaoIdentificada,
      permiteDescontoProgressivo: permiteDesconto,
      quantidadeMinima: precificacao.quantidadeMinima,
      quantidadeMinimaPorVariacao: precificacao.quantidadeMinimaPorVariacao,
      abaixoDoMinimo,
      adicionalLocais: precificacao.adicionalLocais,
      precoUnitarioBruto,
      precoUnitarioLiquido,
      subtotalBruto,
      subtotalLiquido,
      prazoConfeccao: precificacao.prazoConfeccao,
    };
  });

  const totalBruto = itensCalculados.reduce((acc, i) => acc + i.subtotalBruto, 0);
  const totalLiquido = itensCalculados.reduce((acc, i) => acc + i.subtotalLiquido, 0);
  const economiaTotal = totalBruto - totalLiquido;

  return {
    dados,
    tabela,
    totalPecas,
    faixaDesconto,
    itens: itensCalculados,
    totalBruto,
    totalLiquido,
    economiaTotal,
  };
}

/**
 * Formata um número para moeda brasileira (R$ XX,XX)
 */
function formatarMoeda(valor) {
  return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");
}

/**
 * Constrói a mensagem final formatada para envio no WhatsApp
 */
function gerarRespostaOrcamento(calculo) {
  const { dados, itens, totalPecas, faixaDesconto, totalBruto, totalLiquido, economiaTotal, tabela } = calculo;

  const nomeCliente = dados.cliente ? dados.cliente.split(" ")[0] : "Cliente";
  const saudacaoHora = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bom dia";
    if (h >= 12 && h < 18) return "Boa tarde";
    return "Boa noite";
  };

  let msg = `👋 *${saudacaoHora()}, ${nomeCliente}! Tudo bem?*\n`;
  msg += `Recebemos sua solicitação de orçamento direto do site com sucesso! 🧵✨\n\n`;

  if (dados.codigo) {
    msg += `📋 *CÓDIGO DO ORÇAMENTO:* \`${dados.codigo}\`\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Detalhamento dos itens
  msg += `📦 *RESUMO DOS PRODUTOS & VALORES:*\n\n`;

  itens.forEach((item, idx) => {
    const num = item.numero || idx + 1;
    msg += `*${num}. ${item.nome}*\n`;
    msg += `   • *Quantidade:* ${item.quantidade} unidade${item.quantidade > 1 ? "s" : ""}\n`;
    if (item.grade) {
      msg += `   • *Grade / Tamanhos:* ${item.grade}\n`;
    }
    if (item.estampa) {
      msg += `   • *Estampa:* ${item.estampa}\n`;
    }
    if (item.locais) {
      msg += `   • *Locais:* ${item.locais}\n`;
    }
    if (item.prazoConfeccao) {
      msg += `   • *Prazo Estimado:* ${item.prazoConfeccao}\n`;
    }

    if (faixaDesconto.percentual > 0 && item.permiteDescontoProgressivo) {
      msg += `   • *Valor Unitário:* ~${formatarMoeda(item.precoUnitarioBruto)}~ por *${formatarMoeda(item.precoUnitarioLiquido)}/un* (${faixaDesconto.percentual}% OFF)\n`;
    } else {
      msg += `   • *Valor Unitário:* *${formatarMoeda(item.precoUnitarioBruto)}/un*\n`;
    }

    msg += `   • *Subtotal do Item:* *${formatarMoeda(item.subtotalLiquido)}*\n`;

    if (item.abaixoDoMinimo) {
      const textoMin = item.quantidadeMinimaPorVariacao
        ? `${item.quantidadeMinimaPorVariacao} unidades por variação`
        : `${item.quantidadeMinima} unidades`;
      msg += `   ⚠️ _*Nota:* O pedido mínimo para este produto é de ${textoMin}._\n`;
    }

    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *RESUMO FINANCEIRO DO PEDIDO:*\n`;
  msg += `• *Total de Peças:* ${totalPecas} unidades\n`;

  if (faixaDesconto.percentual > 0 && economiaTotal > 0) {
    msg += `• *Valor sem desconto:* ~${formatarMoeda(totalBruto)}~\n`;
    const itensComDesconto = itens.filter((i) => i.permiteDescontoProgressivo);
    if (itensComDesconto.length === itens.length) {
      msg += `• *Desconto Progressivo por Quantidade:* ${faixaDesconto.percentual}% (-${formatarMoeda(economiaTotal)})\n`;
    } else {
      msg += `• *Desconto Progressivo por Quantidade:* ${faixaDesconto.percentual}% nos itens elegíveis (-${formatarMoeda(economiaTotal)})\n`;
    }
  }

  msg += `\n💰 *VALOR TOTAL DO PEDIDO: ${formatarMoeda(totalLiquido)}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Informações adicionais do cliente
  let temInfoExtra = false;
  let infoExtraTexto = `ℹ️ *DETALHES REGISTRADOS:*\n`;

  if (dados.observacoes) {
    infoExtraTexto += `• *Observações:* _"${dados.observacoes}"_\n`;
    temInfoExtra = true;
  }
  if (dados.prazoDesejado) {
    infoExtraTexto += `• *Prazo Desejado pelo Cliente:* ${dados.prazoDesejado}\n`;
    temInfoExtra = true;
  }
  if (dados.localizacao) {
    infoExtraTexto += `• *Local de Entrega:* ${dados.localizacao}\n`;
    temInfoExtra = true;
  }

  if (temInfoExtra) {
    msg += `${infoExtraTexto}\n`;
  }

  // Informações de pagamento e prazos de produção
  const infoPag = tabela.informacoesPagamento || {};
  msg += `📌 *INFORMAÇÕES IMPORTANTES:*\n`;

  // Agrupa prazos distintos por produto
  const prazosPorProduto = [
    ...new Map(itens.map((i) => [i.nome, i.prazoConfeccao])).entries(),
  ];

  if (prazosPorProduto.length === 1) {
    msg += `⏱️ *Prazo de Confecção:* ${prazosPorProduto[0][1]} após aprovação do layout virtual.\n`;
  } else {
    msg += `⏱️ *Prazos de Confecção (por modelo):*\n`;
    prazosPorProduto.forEach(([nome, prazo]) => {
      msg += `   • *${nome}:* ${prazo}\n`;
    });
    msg += `   _(Contados após aprovação do layout virtual)_\n`;
  }

  // Regras de Pedido Mínimo específicas por produto
  const itensComRegraMinima = itens.filter((i) => i.quantidadeMinimaPorVariacao || i.quantidadeMinima);
  if (itensComRegraMinima.length > 0) {
    const regrasUnicas = [
      ...new Set(
        itensComRegraMinima.map((i) => {
          if (i.quantidadeMinimaPorVariacao) {
            return `📦 *Pedido Mínimo (${i.nome}):* ${i.quantidadeMinimaPorVariacao} unidades por variação.`;
          }
          return `📦 *Pedido Mínimo (${i.nome}):* ${i.quantidadeMinima} unidades.`;
        })
      ),
    ];
    regrasUnicas.forEach((regra) => {
      msg += `${regra}\n`;
    });
  }

  msg += `💳 *Forma de Pagamento:* ${infoPag.forma || "PIX"} (${infoPag.condicao || "50% de sinal e 50% na entrega"}).\n`;
  msg += `🎨 *Layout Virtual:* Criamos e enviamos uma simulação digital completa da sua peça para você aprovar antes de iniciar a confecção!\n\n`;

  msg += `🤝 *Próximo Passo:*\n`;
  msg += `Nosso setor de atendimento já foi notificado sobre o seu orçamento e um consultor humano vai dar continuidade no seu atendimento aqui em instantes para tirar qualquer dúvida e acertar a arte! 🚀\n\n`;
  msg += `_Se você já tiver o arquivo da sua arte ou logotipo em boa qualidade, pode enviar aqui no chat enquanto isso!_`;

  return msg;
}

/**
 * Interpreta a resposta enviada pelo cliente ao questionário da Opção 1
 */
function interpretarRespostaQuestionario(textoOriginal, nomeContato) {
  const tabela = carregarTabelaPrecos();
  const textoLimpo = textoOriginal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Identifica o Produto
  let produtoEncontrado = null;
  for (const prod of tabela.produtos) {
    for (const termo of prod.termos) {
      const termoLimpo = termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (textoLimpo.includes(termoLimpo)) {
        produtoEncontrado = prod;
        break;
      }
    }
    if (produtoEncontrado) break;
  }

  // Se não encontrou termo específico nos termos oficiais, analisa palavras-chave comuns
  let nomeProduto = "Camiseta Personalizada 100% Algodão";
  if (produtoEncontrado) {
    nomeProduto = produtoEncontrado.nome;
  } else if (
    textoLimpo.includes("dry") ||
    textoLimpo.includes("dryfit") ||
    textoLimpo.includes("dry-fit") ||
    textoLimpo.includes("esport") ||
    textoLimpo.includes("interclasse") ||
    textoLimpo.includes("time") ||
    textoLimpo.includes("futebol") ||
    textoLimpo.includes("corrida") ||
    textoLimpo.includes("atlet")
  ) {
    nomeProduto = "Camiseta Dry-Fit Personalizada";
  } else if (textoLimpo.includes("polo") || textoLimpo.includes("piquet")) {
    nomeProduto = "Camisa Polo Personalizada";
  } else if (textoLimpo.includes("moletom") || textoLimpo.includes("casaco") || textoLimpo.includes("canguru")) {
    nomeProduto = "Moletom Canguru Personalizado";
  } else if (textoLimpo.includes("caneca") || textoLimpo.includes("tirante")) {
    nomeProduto = "Caneca de Alumínio Personalizada";
  } else if (textoLimpo.includes("abada") || textoLimpo.includes("abadá")) {
    nomeProduto = "Abadá Personalizado";
  } else if (textoLimpo.includes("banner") || textoLimpo.includes("wind")) {
    nomeProduto = "Wind Banner Personalizado";
  } else if (textoLimpo.includes("bandeira")) {
    nomeProduto = "Bandeira Personalizada";
  }

  // 2. Identifica Quantidade
  let quantidade = 20; // Padrão razoável caso não informado
  // Tenta extrair explicitamente se tiver número da linha 3 (ex: 3. 20, 3: 50 un)
  const matchLinha3 = textoOriginal.match(/(?:^|\n)\s*3\s*[\.\:\-\)]\s*(\d+)/m);
  if (matchLinha3) {
    quantidade = parseInt(matchLinha3[1], 10);
  } else {
    // Tenta encontrar "X peças", "X unidades", "X camisas" etc.
    const matchQtdTexto = textoOriginal.match(
      /(\d+)\s*(?:unidades?|unids?|un|pe[çc]as?|pcs?|camisetas?|camisas?|polos?|moletons?|jalecos?|bon[ée]s?)/i
    );
    if (matchQtdTexto) {
      quantidade = parseInt(matchQtdTexto[1], 10);
    } else {
      // Procura por qualquer número isolado entre 1 e 9999
      const matchQualquerNumero = textoOriginal.match(/\b([1-9]\d{0,3})\b/);
      if (matchQualquerNumero) {
        quantidade = parseInt(matchQualquerNumero[1], 10);
      }
    }
  }

  // 3. Segmento (Escolar, Corporativo, Evento, etc.)
  let segmento = "";
  const matchLinha2 = textoOriginal.match(/(?:^|\n)\s*2\s*[\.\:\-\)]\s*([^\n\r]+)/m);
  if (matchLinha2) {
    segmento = matchLinha2[1].replace(/[*_~]/g, "").trim();
  } else {
    if (textoLimpo.includes("escolar") || textoLimpo.includes("escola") || textoLimpo.includes("colegio")) segmento = "Escolar";
    else if (textoLimpo.includes("interclasse")) segmento = "Interclasse Escolar";
    else if (textoLimpo.includes("terceirao") || textoLimpo.includes("terceirão")) segmento = "Terceirão / Formatura";
    else if (textoLimpo.includes("faculdade") || textoLimpo.includes("universit")) segmento = "Universitário";
    else if (textoLimpo.includes("empresa") || textoLimpo.includes("corporativo")) segmento = "Corporativo / Empresarial";
    else if (textoLimpo.includes("evento")) segmento = "Evento";
    else if (textoLimpo.includes("igreja") || textoLimpo.includes("retiro")) segmento = "Igreja / Religioso";
    else if (textoLimpo.includes("esport") || textoLimpo.includes("corrida") || textoLimpo.includes("academia")) segmento = "Esportivo";
  }

  // 4. Personalização / Locais de estampa
  let estampa = "Silk Screen / Personalização Têxtil";
  const matchLinha4 = textoOriginal.match(/(?:^|\n)\s*4\s*[\.\:\-\)]\s*([^\n\r]+)/m);
  if (matchLinha4) {
    estampa = matchLinha4[1].replace(/[*_~]/g, "").trim();
  } else {
    if (textoLimpo.includes("bordado")) estampa = "Bordado Computadorizado";
    else if (textoLimpo.includes("sublimacao") || textoLimpo.includes("sublimação")) estampa = "Sublimação Total";
    else if (textoLimpo.includes("dtf")) estampa = "Estampa DTF";
    else if (textoLimpo.includes("silk")) estampa = "Silk Screen";
  }

  // Locais de estampa
  let locais = "Frente";
  if (
    textoLimpo.includes("frente e costas") ||
    textoLimpo.includes("frente e verso") ||
    (textoLimpo.includes("frente") && textoLimpo.includes("costas"))
  ) {
    locais = "Frente e Costas";
  } else if (textoLimpo.includes("costas")) {
    locais = "Costas";
  } else if (textoLimpo.includes("peito")) {
    locais = "Peito";
  } else if (textoLimpo.includes("manga")) {
    locais = "Manga";
  }

  // 5. Logo / Arte ou Personalização Individual
  let temArte = "A confirmar";
  const matchLinha5 = textoOriginal.match(/(?:^|\n)\s*5\s*[\.\:\-\)]\s*([^\n\r]+)/m);
  if (matchLinha5) {
    const respLinha5 = matchLinha5[1].replace(/[*_~]/g, "").trim();
    if (/^(sim|s|quero|vai ter|com certeza|positivo)/i.test(respLinha5)) {
      temArte = "Com Nome e Número Individual";
    } else if (/^(não|nao|n|sem)/i.test(respLinha5)) {
      temArte = "Sem Nome/Número Individual";
    } else {
      temArte = respLinha5;
    }
  } else {
    if (textoLimpo.includes("nome e numero") || textoLimpo.includes("nome e número") || textoLimpo.includes("nome individual")) {
      temArte = "Com Nome e Número Individual";
    } else if (textoLimpo.includes("sim") || textoLimpo.includes("tenho") || textoLimpo.includes("ja tenho")) {
      temArte = "Cliente já possui a arte";
    } else if (textoLimpo.includes("nao") || textoLimpo.includes("não") || textoLimpo.includes("criar")) {
      temArte = "Necessário criar layout";
    }
  }

  // Grade de tamanhos se mencionada
  let grade = "A definir na confirmação do pedido";
  const matchGrade = textoOriginal.match(/(?:grade|tamanhos?)[:\s]*([^\n\r]+)/i);
  if (matchGrade) {
    grade = matchGrade[1].replace(/[*_~]/g, "").trim();
  }

  // Observações
  let obs = [];
  if (segmento) obs.push(`Segmento: ${segmento}`);
  if (temArte && temArte !== "A confirmar") obs.push(`Personalização: ${temArte}`);
  const observacoes = obs.length > 0 ? obs.join(" | ") : "Solicitação respondida via WhatsApp";

  // Gera código único
  const anoAtual = new Date().getFullYear();
  const codigoRandom = Math.floor(100000 + Math.random() * 900000);
  const codigo = `ORC-${anoAtual}-${codigoRandom}`;

  return {
    codigo,
    cliente: nomeContato || "Cliente",
    whatsapp: "",
    email: "",
    localizacao: "",
    prazoDesejado: "",
    observacoes,
    itens: [
      {
        numero: "1",
        nome: nomeProduto,
        quantidade,
        grade,
        estampa,
        locais,
      },
    ],
  };
}

module.exports = {
  identificarOrcamento,
  parseOrcamento,
  interpretarRespostaQuestionario,
  calcularOrcamento,
  gerarRespostaOrcamento,
  carregarTabelaPrecos,
};

