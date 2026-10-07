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
 * Interpreta a resposta enviada pelo cliente ao questionário (tanto de campanhas/anúncios quanto do menu geral)
 */
function interpretarRespostaQuestionario(textoOriginal, nomeContato) {
  const tabela = carregarTabelaPrecos();
  const textoBruto = (textoOriginal || "").trim();
  const textoLimpo = textoBruto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // =====================================
  // 1. EXTRAÇÃO DE RESPOSTAS POR ÍNDICE / LINHA ENUMERADA
  // =====================================
  // Mapeia respostas como "1. ...", "1- ...", "1) ...", "1: ...", "1️⃣ ...", etc.
  const respostasPorIndice = {};
  const linhas = textoBruto.split(/\r?\n/);

  // Regex para identificar prefixo de questão (1 a 9 ou emojis 1️⃣..9️⃣)
  const regexPrefixoLinha = /^\s*(?:([1-9])\s*[\.\:\-\)\–\—]\s*|(?:1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)\s*[:\-\.]?\s*)/i;

  let indiceAtual = null;
  for (const linha of linhas) {
    const linhaTrim = linha.trim();
    if (!linhaTrim) continue;

    // Converte emoji para dígito se presente
    let linhaNorm = linhaTrim
      .replace(/^1️⃣/i, "1.")
      .replace(/^2️⃣/i, "2.")
      .replace(/^3️⃣/i, "3.")
      .replace(/^4️⃣/i, "4.")
      .replace(/^5️⃣/i, "5.");

    const matchPrefixo = linhaNorm.match(/^\s*([1-9])\s*[\.\:\-\)\–\—]\s*(.*)$/);
    if (matchPrefixo) {
      indiceAtual = parseInt(matchPrefixo[1], 10);
      respostasPorIndice[indiceAtual] = (matchPrefixo[2] || "").trim();
    } else if (indiceAtual !== null) {
      respostasPorIndice[indiceAtual] = (respostasPorIndice[indiceAtual] + " " + linhaTrim).trim();
    }
  }

  // Se não foi encontrada enumeração explícita com "1.", mas há múltiplas linhas, mapeia por linha sequencial
  if (Object.keys(respostasPorIndice).length === 0 && linhas.length >= 2) {
    let idx = 1;
    for (const l of linhas) {
      const lTrim = l.trim();
      if (lTrim && idx <= 5) {
        respostasPorIndice[idx] = lTrim;
        idx++;
      }
    }
  }

  // =====================================
  // 2. EXTRAÇÃO DE QUANTIDADE (ALTA PRECISÃO)
  // =====================================
  let quantidade = null;

  // Função auxiliar para extrair número de um texto específico
  const extrairNumeroDeTexto = (str) => {
    if (!str) return null;
    const s = String(str).replace(/\b100\s*%/g, "").replace(/\b(202[0-9]|2030)\b/g, "");
    
    // 1. Procura número acompanhado de unidade/peça/camisa
    const mUnit = s.match(/(\d+)\s*(?:unidades?|unids?|un|pe[çc]as?|pecas?|pcs?|camisetas?|camisas?|polos?|moletons?|jogos?|conjuntos?|kit[s]?)\b/i);
    if (mUnit) return parseInt(mUnit[1], 10);

    // 2. Procura números com palavras aproximativas (ex: "umas 30", "cerca de 50", "20 ou 30")
    const mAprox = s.match(/(?:aproximadamente|aprox|cerca de|mais ou menos|umas?|uns?|total de|volume de)?\s*(\d+)/i);
    if (mAprox && mAprox[1]) {
      const num = parseInt(mAprox[1], 10);
      if (num > 0) return num;
    }

    // 3. Procura qualquer número puro na string
    const mPuro = s.match(/\b([1-9]\d{0,4})\b/);
    if (mPuro) return parseInt(mPuro[1], 10);

    return null;
  };

  // Prioridade A: Pergunta 2 (Padrão em Fluxos de Anúncios / Ads: "2. Quantas peças você precisa?")
  if (respostasPorIndice[2]) {
    const numQ2 = extrairNumeroDeTexto(respostasPorIndice[2]);
    if (numQ2 !== null && numQ2 > 0) {
      quantidade = numQ2;
    }
  }

  // Prioridade B: Pergunta 3 (Padrão no Menu Geral: "3. Quantidade estimada") se a pergunta 2 não continha quantidade
  if (quantidade === null && respostasPorIndice[3]) {
    const numQ3 = extrairNumeroDeTexto(respostasPorIndice[3]);
    if (numQ3 !== null && numQ3 > 0) {
      quantidade = numQ3;
    }
  }

  // Prioridade C: Expressões explícitas no texto completo ("quantidade: 30", "30 peças", "50 camisas")
  if (quantidade === null) {
    const matchQtdRotulo = textoBruto.match(/(?:quantidade|qtd|volume|total)[:\s]*([0-9]+)/i);
    if (matchQtdRotulo) {
      quantidade = parseInt(matchQtdRotulo[1], 10);
    }
  }

  if (quantidade === null) {
    const matchQtdUnidade = textoBruto.match(/(\d+)\s*(?:unidades?|unids?|un|pe[çc]as?|pecas?|pcs?|camisetas?|camisas?|polos?|moletons?|jogos?|conjuntos?|kit[s]?)\b/i);
    if (matchQtdUnidade) {
      quantidade = parseInt(matchQtdUnidade[1], 10);
    }
  }

  // Prioridade D: Se o cliente digitou apenas um número isolado na mensagem
  if (quantidade === null) {
    const textoSemConflito = textoBruto
      .replace(/\b100\s*%/gi, "") // Remove "100%" (ex: 100% algodão)
      .replace(/\b(202[0-9]|2030)\b/g, "") // Remove anos ("2026", "2025")
      .replace(/(?:^|\n)\s*[1-9]\s*[\.\:\-\)\–\—]\s*/g, " ") // Remove número de índice da pergunta
      .replace(/(?:1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)/g, " ");

    const matchRestante = textoSemConflito.match(/\b([1-9]\d{0,3})\b/);
    if (matchRestante) {
      quantidade = parseInt(matchRestante[1], 10);
    }
  }

  // Fallback padrão se nenhuma quantidade for identificada
  if (!quantidade || quantidade <= 0) {
    quantidade = 20;
  }

  // =====================================
  // 3. IDENTIFICAÇÃO DO PRODUTO
  // =====================================
  let produtoEncontrado = null;
  const textoParaBuscaProduto = (respostasPorIndice[1] ? respostasPorIndice[1] + " " : "") + textoLimpo;

  // Busca na tabela oficial de produtos com match de termos
  for (const prod of (tabela.produtos || [])) {
    if (Array.isArray(prod.termos)) {
      for (const termo of prod.termos) {
        const termoLimpo = termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (textoParaBuscaProduto.includes(termoLimpo)) {
          produtoEncontrado = prod;
          break;
        }
      }
    }
    if (produtoEncontrado) break;
  }

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
    textoLimpo.includes("volei") ||
    textoLimpo.includes("vôlei") ||
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

  // =====================================
  // 4. SEGMENTO (ESCOLAR, CORPORATIVO, EVENTO, INTERCLASSE, ETC.)
  // =====================================
  let segmento = "";
  // Em fluxos de anúncio: pergunta 3 é time/evento. No menu: pergunta 2 é segmento.
  const respSeg = respostasPorIndice[3] || respostasPorIndice[2] || "";
  if (respSeg && !/^\d+$/.test(respSeg.trim())) {
    segmento = respSeg.replace(/[*_~]/g, "").trim();
  }

  if (!segmento) {
    if (textoLimpo.includes("interclasse")) segmento = "Interclasse Escolar";
    else if (textoLimpo.includes("terceirao") || textoLimpo.includes("terceirão")) segmento = "Terceirão / Formatura";
    else if (textoLimpo.includes("escolar") || textoLimpo.includes("escola") || textoLimpo.includes("colegio")) segmento = "Escolar";
    else if (textoLimpo.includes("faculdade") || textoLimpo.includes("universit")) segmento = "Universitário";
    else if (textoLimpo.includes("empresa") || textoLimpo.includes("corporativo") || textoLimpo.includes("firma")) segmento = "Corporativo / Empresarial";
    else if (textoLimpo.includes("igreja") || textoLimpo.includes("retiro") || textoLimpo.includes("culto")) segmento = "Igreja / Religioso";
    else if (textoLimpo.includes("futebol") || textoLimpo.includes("volei") || textoLimpo.includes("time") || textoLimpo.includes("esport") || textoLimpo.includes("corrida")) segmento = "Time Esportivo";
    else if (textoLimpo.includes("evento")) segmento = "Evento";
  }

  // =====================================
  // 5. ESTAMPA / PERSONALIZAÇÃO
  // =====================================
  let estampa = "Silk Screen / Personalização Têxtil";
  if (respostasPorIndice[4] && (respostasPorIndice[4].toLowerCase().includes("silk") || respostasPorIndice[4].toLowerCase().includes("bordad") || respostasPorIndice[4].toLowerCase().includes("sublim"))) {
    estampa = respostasPorIndice[4].replace(/[*_~]/g, "").trim();
  } else {
    if (textoLimpo.includes("bordado")) estampa = "Bordado Computadorizado";
    else if (textoLimpo.includes("sublimacao") || textoLimpo.includes("sublimação") || textoLimpo.includes("total")) estampa = "Sublimação Total";
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

  // =====================================
  // 6. LOGO / ARTE E NOME/NÚMERO INDIVIDUAL
  // =====================================
  let temArte = "A confirmar";
  let temNomeNumero = false;

  // Analisa resposta da Pergunta 5 (Nome e número individual) ou 4 (Logo/Arte)
  const resp5 = respostasPorIndice[5] ? respostasPorIndice[5].toLowerCase() : "";
  const resp4 = respostasPorIndice[4] ? respostasPorIndice[4].toLowerCase() : "";

  if (/^(sim|s|quero|vai ter|com certeza|positivo|preciso)/i.test(resp5) || textoLimpo.includes("com nome") || textoLimpo.includes("nome e numero") || textoLimpo.includes("nome e número")) {
    temNomeNumero = true;
  }

  if (/^(sim|s|tenho|ja tenho|já tenho|vou mandar|mandei)/i.test(resp4) || textoLimpo.includes("tenho a logo") || textoLimpo.includes("tenho a arte") || textoLimpo.includes("tenho o logo")) {
    temArte = "Cliente já possui a arte/logotipo";
  } else if (/^(não|nao|n|sem|criar)/i.test(resp4) || textoLimpo.includes("nao tenho") || textoLimpo.includes("não tenho") || textoLimpo.includes("criar arte")) {
    temArte = "Necessário criar layout";
  }

  // Grade de tamanhos se mencionada
  let grade = "A definir na confirmação do pedido";
  const matchGrade = textoBruto.match(/(?:grade|tamanhos?)[:\s]*([^\n\r]+)/i);
  if (matchGrade) {
    grade = matchGrade[1].replace(/[*_~]/g, "").trim();
  }

  // Observações
  let obs = [];
  if (segmento) obs.push(`Segmento: ${segmento}`);
  if (temNomeNumero) obs.push(`Com Nome e Número Individual`);
  if (temArte && temArte !== "A confirmar") obs.push(`Arte: ${temArte}`);
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

