const {
  identificarOrcamento,
  parseOrcamento,
  calcularOrcamento,
  gerarRespostaOrcamento,
} = require("./orcamentoService");

const mensagemExemplo = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-976875
----------------------------------------
*Cliente:* Anne Amarys
*WhatsApp:* 18991176006
*E-mail:* a@gmail.com
*Localização:* Andradina - SP
*Prazo Desejado:* 2026-10-15
----------------------------------------

*ITENS DO PEDIDO (1):*

*1. Camiseta Personalizada 100% Algodão*
   • Quantidade: 20 unidades
   • Grade de Tamanhos/Variações: M: 10 | G: 10
   • Estampa: EST-001 (Estampa EST-001)
   • Locais: Frente

*OBSERVAÇÕES GERAIS:* Para o Interclasse

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

console.log("=== TESTE DE RECONHECIMENTO ===");
const ehOrcamento = identificarOrcamento(mensagemExemplo);
console.log("É orçamento do site?", ehOrcamento ? "✅ SIM" : "❌ NÃO");

console.log("\n=== TESTE DE PARSING ===");
const parsed = parseOrcamento(mensagemExemplo);
console.log(JSON.stringify(parsed, null, 2));

console.log("\n=== TESTE DE CÁLCULO COM DESCONTO PROGRESSIVO ===");
const calculo = calcularOrcamento(parsed);
console.log({
  totalPecas: calculo.totalPecas,
  faixaDesconto: calculo.faixaDesconto,
  totalBruto: calculo.totalBruto,
  totalLiquido: calculo.totalLiquido,
  economiaTotal: calculo.economiaTotal,
});

console.log("\n=== RESPOSTA FINAL GERADA (1 ITEM) ===");
const resposta = gerarRespostaOrcamento(calculo);
console.log(resposta);

console.log("\n========================================================");
console.log("=== TESTE COM MÚLTIPLOS ITENS (CAMISETA + POLO) ===");
console.log("========================================================");

const mensagemMultiplosItens = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-123456
----------------------------------------
*Cliente:* Carlos Eduardo
*WhatsApp:* 11988776655
*E-mail:* carlos@empresa.com.br
*Localização:* São Paulo - SP
*Prazo Desejado:* 2026-11-20
----------------------------------------

*ITENS DO PEDIDO (2):*

*1. Camiseta Personalizada 100% Algodão*
   • Quantidade: 30 unidades
   • Grade de Tamanhos/Variações: P: 10 | M: 10 | G: 10
   • Estampa: Logo Empresa Frente e Costas
   • Locais: Frente e Costas

*2. Camisa Polo Piquet Personalizada*
   • Quantidade: 20 unidades
   • Grade de Tamanhos/Variações: M: 10 | GG: 10
   • Estampa: DTF Peito
   • Locais: Frente

*OBSERVAÇÕES GERAIS:* Entrega urgente para feira empresarial

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

const parsedMulti = parseOrcamento(mensagemMultiplosItens);
const calculoMulti = calcularOrcamento(parsedMulti);
const respostaMulti = gerarRespostaOrcamento(calculoMulti);
console.log(respostaMulti);

console.log("\n========================================================");
console.log("=== TESTE DE RESPOSTA DO CLIENTE AO QUESTIONÁRIO (OPÇÃO 1) ===");
console.log("========================================================");

const { interpretarRespostaQuestionario } = require("./orcamentoService");

const respostaCliente1 = `1. Camisetas algodão
2. Interclasse
3. 25 peças
4. Estampa frente e costas
5. Sim, já tenho a arte pronta`;

console.log("-> Mensagem enviada pelo cliente:");
console.log(respostaCliente1);

const parsedQuestionario = interpretarRespostaQuestionario(respostaCliente1, "Mariana Lima");
console.log("\n-> Dados interpretados pelo robô:");
console.log(JSON.stringify(parsedQuestionario, null, 2));

const calculoQuestionario = calcularOrcamento(parsedQuestionario);
const respostaRoboQuestionario = gerarRespostaOrcamento(calculoQuestionario);
console.log("\n-> Resposta final gerada pelo robô:");
console.log(respostaRoboQuestionario);

console.log("\n========================================================");
console.log("=== TESTE COM PRODUTO COM VARIAÇÃO E SEM DESCONTO PROGRESSIVO (CANECA) ===");
console.log("========================================================");

const mensagemCaneca = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-888999
----------------------------------------
*Cliente:* Atlética Medicina
*WhatsApp:* 1799887766
*E-mail:* atletica@med.com
*Localização:* São José do Rio Preto - SP
*Prazo Desejado:* 2026-11-10
----------------------------------------

*ITENS DO PEDIDO (1):*

*1. Caneca de Alumínio Personalizada*
   • Quantidade: 50 unidades
   • Grade de Tamanhos/Variações: 700ml
   • Estampa: Tirante e Caneca com Logo da Atlética
   • Locais: Frente

*OBSERVAÇÕES GERAIS:* Variação de 700ml para evento universitário

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

const parsedCaneca = parseOrcamento(mensagemCaneca);
const calculoCaneca = calcularOrcamento(parsedCaneca);
const respostaCaneca = gerarRespostaOrcamento(calculoCaneca);
console.log(respostaCaneca);

console.log("\n========================================================");
console.log("=== TESTE COM WIND BANNER (VARIAÇÃO 3M DUPLA FACE) ===");
console.log("========================================================");

const mensagemWindBanner = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-555444
----------------------------------------
*Cliente:* Loja Auto Peças
*WhatsApp:* 11999998888
*E-mail:* contato@autopecas.com
*Localização:* Campinas - SP
*Prazo Desejado:* 2026-10-30
----------------------------------------

*ITENS DO PEDIDO (1):*

*1. Wind Banner Personalizado*
   • Quantidade: 15 unidades
   • Grade de Tamanhos/Variações: 3m Dupla Face
   • Estampa: Logo frente e verso
   • Locais: Frente

*OBSERVAÇÕES GERAIS:* Modelo gota 3m dupla face

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

const parsedWind = parseOrcamento(mensagemWindBanner);
const calculoWind = calcularOrcamento(parsedWind);
const respostaWind = gerarRespostaOrcamento(calculoWind);
console.log(respostaWind);

console.log("\n========================================================");
console.log("=== TESTE COM PEDIDO MISTO (CAMISETA COM DESCONTO + CANECA FIXA) ===");
console.log("========================================================");

const mensagemMisto = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-777111
----------------------------------------
*Cliente:* Festival Universitário
*WhatsApp:* 1999112233
*E-mail:* festival@unievents.com
*Localização:* Ribeirão Preto - SP
*Prazo Desejado:* 2026-12-01
----------------------------------------

*ITENS DO PEDIDO (2):*

*1. Camiseta Personalizada 100% Algodão*
   • Quantidade: 40 unidades
   • Grade de Tamanhos/Variações: M: 20 | G: 20
   • Estampa: Logo Frente
   • Locais: Frente

*2. Caneca de Alumínio Personalizada*
   • Quantidade: 40 unidades
   • Grade de Tamanhos/Variações: 500ml
   • Estampa: Silk 1 cor
   • Locais: Frente

*OBSERVAÇÕES GERAIS:* Kit para o evento

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

const parsedMisto = parseOrcamento(mensagemMisto);
const calculoMisto = calcularOrcamento(parsedMisto);
const respostaMisto = gerarRespostaOrcamento(calculoMisto);
console.log(respostaMisto);

console.log("\n========================================================");
console.log("=== TESTE COM NOVO PRODUTO CADASTRADO (ABADÁ) ===");
console.log("========================================================");

const mensagemAbada = `*SOLICITAÇÃO DE ORÇAMENTO — TENÓRIO CONFECÇÕES*
*Código do Orçamento:* ORC-2026-333222
----------------------------------------
*Cliente:* Bloco Carnavalesco
*WhatsApp:* 71988887777
*E-mail:* bloco@carnaval.com
*Localização:* Salvador - BA
*Prazo Desejado:* 2026-11-30
----------------------------------------

*ITENS DO PEDIDO (1):*

*1. Abadá Personalizado*
   • Quantidade: 50 unidades
   • Grade de Tamanhos/Variações: P: 10 | M: 25 | G: 15
   • Estampa: Sublimação Total
   • Locais: Frente e Costas

*OBSERVAÇÕES GERAIS:* Abadá para o bloco

Olá! Vim pelo site da Tenório Confecções e gostaria de confirmar esse orçamento.`;

const parsedAbada = parseOrcamento(mensagemAbada);
const calculoAbada = calcularOrcamento(parsedAbada);
const respostaAbada = gerarRespostaOrcamento(calculoAbada);
console.log(respostaAbada);




