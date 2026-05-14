// ============================================================
//  script.js — Exercícios de JavaScript
//
//  Conteúdo deste arquivo:
//  [A] Navegação entre abas
//  [B] Exercício 01 — Validador de CPF
//  [C] Exercício 02 — Conversor de Temperatura
//  [D] Exercício 03 — Média Escolar
//  [E] Exercício 04 — Infinity Bank
// ============================================================


// ============================================================
//  [A] NAVEGAÇÃO ENTRE ABAS
// ============================================================

// Pega todos os botões de aba e todos os painéis do HTML
var botoesAba = document.querySelectorAll(".aba");
var paineis   = document.querySelectorAll(".ex");

// Para cada botão, escuta o clique e troca o painel visível
botoesAba.forEach(function (botao) {
  botao.addEventListener("click", function () {
    var alvo = botao.getAttribute("data-alvo"); // ex: "ex01"

    // Remove a classe ativa de todos os botões e painéis
    botoesAba.forEach(function (b) { b.classList.remove("aba--ativa"); });
    paineis.forEach(function (p)   { p.classList.remove("ex--ativo"); });

    // Ativa apenas o botão clicado e o painel correspondente
    botao.classList.add("aba--ativa");
    document.getElementById(alvo).classList.add("ex--ativo");
  });
});


// ============================================================
//  FUNÇÃO UTILITÁRIA — Exibir resultado
//
//  Usada em todos os exercícios para mostrar o retorno
//  na caixa colorida de resultado.
//
//  Parâmetros:
//  - idResultado : id da div de resultado no HTML
//  - cor         : "verde", "azul" ou "vermelho"
//  - titulo      : texto grande em negrito
//  - texto       : detalhes adicionais (aceita \n para quebra de linha)
// ============================================================

function mostrarResultado(idResultado, cor, titulo, texto) {
  var caixa = document.getElementById(idResultado);

  // Remove classes de cor anteriores para não acumular
  caixa.classList.remove("resultado--verde", "resultado--azul", "resultado--vermelho");

  // Monta o HTML interno
  caixa.innerHTML =
    '<p class="resultado__titulo">' + titulo + '</p>' +
    '<p class="resultado__texto">'  + texto  + '</p>';

  // Aplica a cor e torna a caixa visível
  caixa.classList.add("resultado--" + cor);
  caixa.classList.add("resultado--visivel");
  caixa.style.display = "block";
}


// ============================================================
//  [B] EXERCÍCIO 01 — VALIDADOR DE CPF
// ============================================================

// -- Verificações auxiliares --

// Retorna true se o texto contiver SOMENTE dígitos (0–9)
function soTemNumeros(texto) {
  for (var i = 0; i < texto.length; i++) {
    if (texto[i] < "0" || texto[i] > "9") {
      return false;
    }
  }
  return true;
}

// Retorna true se todos os caracteres forem iguais (ex: 11111111111)
function todosIguais(texto) {
  for (var i = 1; i < texto.length; i++) {
    if (texto[i] !== texto[0]) return false;
  }
  return true;
}

// Calcula o 1º dígito verificador
// Pesos: os 9 primeiros dígitos × 10, 9, 8 ... 2
function calcularDigito1(cpf) {
  var soma = 0;
  var peso = 10;
  for (var i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * peso;
    peso--;
  }
  var resto = (soma * 10) % 11;
  return (resto === 10) ? 0 : resto;
}

// Calcula o 2º dígito verificador
// Pesos: os 10 primeiros dígitos × 11, 10, 9 ... 2
function calcularDigito2(cpf) {
  var soma = 0;
  var peso = 11;
  for (var i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * peso;
    peso--;
  }
  var resto = (soma * 10) % 11;
  return (resto === 10) ? 0 : resto;
}

// -- Função principal do CPF --
function validarCPF() {
  var cpf = document.getElementById("cpf-campo").value;

  // 1. Deve conter apenas números
  if (!soTemNumeros(cpf)) {
    mostrarResultado("cpf-resultado", "vermelho",
      "CPF Inválido",
      "Digite apenas os 11 números, sem pontos (.) ou traço (-)."
    );
    return;
  }

  // 2. Deve ter exatamente 11 dígitos
  if (cpf.length !== 11) {
    mostrarResultado("cpf-resultado", "vermelho",
      "CPF Inválido",
      "O CPF precisa ter 11 dígitos. Você digitou " + cpf.length + "."
    );
    return;
  }

  // 3. Não pode ser uma sequência repetida (ex: 00000000000)
  if (todosIguais(cpf)) {
    mostrarResultado("cpf-resultado", "vermelho",
      "CPF Inválido",
      "CPFs com todos os dígitos iguais não são válidos."
    );
    return;
  }

  // 4. Verifica os dois dígitos verificadores
  var d1Calculado = calcularDigito1(cpf);
  var d2Calculado = calcularDigito2(cpf);
  var d1Informado = Number(cpf[9]);
  var d2Informado = Number(cpf[10]);

  if (d1Calculado !== d1Informado || d2Calculado !== d2Informado) {
    mostrarResultado("cpf-resultado", "vermelho",
      "CPF Inválido",
      "Os dígitos verificadores não conferem com o algoritmo da Receita Federal."
    );
    return;
  }

  // Passou em todas as verificações!
  mostrarResultado("cpf-resultado", "verde",
    "CPF Válido ✓",
    "O CPF " + cpf + " é matematicamente válido."
  );
}

// Conecta o botão e o Enter ao validador
document.getElementById("cpf-btn").addEventListener("click", validarCPF);
document.getElementById("cpf-campo").addEventListener("keydown", function (e) {
  if (e.key === "Enter") validarCPF();
});


// ============================================================
//  [C] EXERCÍCIO 02 — CONVERSOR DE TEMPERATURA
// ============================================================

// Guarda referências aos elementos usados com frequência
var inputCelsius    = document.getElementById("campo-celsius");
var inputFahrenheit = document.getElementById("campo-fahrenheit");
var gradeConv       = document.getElementById("conv-grade");
var blocoC          = document.getElementById("bloco-c");
var blocoF          = document.getElementById("bloco-f");
var centroConv      = document.getElementById("conv-centro");
var btnInverter     = document.getElementById("btn-inverter");

// Controla se os blocos estão trocados de lugar ou não
var camposInvertidos = false;

// -- Fórmulas --
function cParaF(celsius)    { return (celsius * 9 / 5) + 32; }
function fParaC(fahrenheit) { return (fahrenheit - 32) * 5 / 9; }

// -- Atualiza os destaques das referências --
function atualizarRefs(celsius) {
  var pontos = [
    { id: "ref-gelo",    valor: 0   },
    { id: "ref-corpo",   valor: 37  },
    { id: "ref-fervura", valor: 100 }
  ];
  pontos.forEach(function (p) {
    var el = document.getElementById(p.id);
    if (Math.abs(celsius - p.valor) <= 5) {
      el.classList.add("conv-ref--ativa");
    } else {
      el.classList.remove("conv-ref--ativa");
    }
  });
}

function limparRefs() {
  ["ref-gelo", "ref-corpo", "ref-fervura"].forEach(function (id) {
    document.getElementById(id).classList.remove("conv-ref--ativa");
  });
}

// -- Evento: digitou em Celsius → atualiza Fahrenheit --
inputCelsius.addEventListener("input", function () {
  if (inputCelsius.value === "") {
    inputFahrenheit.value = "";
    limparRefs();
    return;
  }
  var resultado = cParaF(Number(inputCelsius.value));
  inputFahrenheit.value = resultado.toFixed(2);
  atualizarRefs(Number(inputCelsius.value));
});

// -- Evento: digitou em Fahrenheit → atualiza Celsius --
inputFahrenheit.addEventListener("input", function () {
  if (inputFahrenheit.value === "") {
    inputCelsius.value = "";
    limparRefs();
    return;
  }
  var resultado = fParaC(Number(inputFahrenheit.value));
  inputCelsius.value = resultado.toFixed(2);
  atualizarRefs(resultado);
});

// -- Evento: clicou no botão ⇄ → troca os blocos de lugar --
btnInverter.addEventListener("click", function () {
  // 1. Limpa os dois campos e as referências
  inputCelsius.value    = "";
  inputFahrenheit.value = "";
  limparRefs();

  // 2. Anima o giro do botão
  btnInverter.classList.remove("girando");
  void btnInverter.offsetWidth;   // truque para reiniciar a animação CSS
  btnInverter.classList.add("girando");

  // 3. Move o bloco para antes do centro (troca de lado)
  if (!camposInvertidos) {
    gradeConv.insertBefore(blocoF, centroConv); // Fahrenheit vai para a esquerda
    camposInvertidos = true;
  } else {
    gradeConv.insertBefore(blocoC, centroConv); // Celsius volta para a esquerda
    camposInvertidos = false;
  }
});


// ============================================================
//  [D] EXERCÍCIO 03 — MÉDIA ESCOLAR
// ============================================================

function calcularMedia() {
  var nome  = document.getElementById("aluno-nome").value.trim();

  // Converte os valores para Number conforme exigido
  var nota1 = Number(document.getElementById("nota-1").value);
  var nota2 = Number(document.getElementById("nota-2").value);
  var nota3 = Number(document.getElementById("nota-3").value);

  // Validações básicas
  if (nome === "") {
    mostrarResultado("media-resultado", "vermelho",
      "Campo obrigatório",
      "Digite o nome do aluno antes de calcular."
    );
    return;
  }

  var campoN1 = document.getElementById("nota-1").value;
  var campoN2 = document.getElementById("nota-2").value;
  var campoN3 = document.getElementById("nota-3").value;

  if (campoN1 === "" || campoN2 === "" || campoN3 === "") {
    mostrarResultado("media-resultado", "vermelho",
      "Notas incompletas",
      "Preencha as três notas antes de calcular."
    );
    return;
  }

  // Calcula a média aritmética e formata com toFixed(2)
  var media = (nota1 + nota2 + nota3) / 3;
  var mediaTexto = media.toFixed(2);

  // Determina a situação com condicionais
  if (media >= 7.0 && media <= 10.0) {
    // APROVADO → azul
    mostrarResultado("media-resultado", "azul",
      "✓ Aprovado — " + nome,
      "Média final: " + mediaTexto +
      "\nNotas: " + nota1.toFixed(1) + " | " + nota2.toFixed(1) + " | " + nota3.toFixed(1)
    );

  } else if (media >= 4.0 && media < 7.0) {
    // EXAME → verde + quanto falta para 10
    var faltaParaDez = (10 - media).toFixed(2);
    mostrarResultado("media-resultado", "verde",
      "⚠ Exame Final — " + nome,
      "Média atual: " + mediaTexto +
      "\nNotas: " + nota1.toFixed(1) + " | " + nota2.toFixed(1) + " | " + nota3.toFixed(1) +
      "\nFaltam " + faltaParaDez + " pontos para atingir média 10."
    );

  } else {
    // REPROVADO → vermelho
    mostrarResultado("media-resultado", "vermelho",
      "✗ Reprovado — " + nome,
      "Média final: " + mediaTexto +
      "\nNotas: " + nota1.toFixed(1) + " | " + nota2.toFixed(1) + " | " + nota3.toFixed(1)
    );
  }
}

// Conecta o botão ao cálculo
document.getElementById("media-btn").addEventListener("click", calcularMedia);


// ============================================================
//  [E] EXERCÍCIO 04 — INFINITY BANK
// ============================================================

// Função auxiliar: formata número para moeda brasileira (R$ 1.234,56)
function formatarMoeda(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function simularVenda() {
  var bandeira = document.getElementById("banco-bandeira").value;
  var valor    = Number(document.getElementById("banco-valor").value);
  var parcelas = Number(document.getElementById("banco-parcelas").value);

  // Validações
  if (bandeira === "") {
    mostrarResultado("banco-resultado", "vermelho",
      "Selecione a bandeira",
      "Escolha Visa, Mastercard ou Elo para continuar."
    );
    return;
  }

  if (!valor || valor <= 0) {
    mostrarResultado("banco-resultado", "vermelho",
      "Valor inválido",
      "Digite um valor de venda maior que zero."
    );
    return;
  }

  // -- Taxa da bandeira (usando switch conforme solicitado) --
  var taxaBandeiraPct;   // percentual em decimal (ex: 0.02 para 2%)
  var nomeBandeira;

  switch (bandeira) {
    case "visa":
      taxaBandeiraPct = 0.02;     // Visa: 2%
      nomeBandeira    = "Visa";
      break;
    case "master":
      taxaBandeiraPct = 0.0185;   // Mastercard: 1,85%
      nomeBandeira    = "Mastercard";
      break;
    case "elo":
      taxaBandeiraPct = 0.03;     // Elo: 3%
      nomeBandeira    = "Elo";
      break;
  }

  // -- Cálculos financeiros --

  // Valor da taxa da bandeira em reais
  var valorTaxaBandeira = valor * taxaBandeiraPct;

  // Juros totais: Valor × (0.015 × número de parcelas)
  var jurosTotais = valor * (0.015 * parcelas);

  // Taxa mensal fixa de R$ 12,50 por mês (multiplicada pelas parcelas)
  var taxaMensalFixa = 12.50 * parcelas;

  // Valor total = venda + taxa bandeira + juros + taxa mensal
  var valorTotal = valor + valorTaxaBandeira + jurosTotais + taxaMensalFixa;

  // Valor de cada parcela
  var valorParcela = valorTotal / parcelas;

  // Percentual da bandeira formatado para exibição
  var pctExibido = (taxaBandeiraPct * 100).toFixed(2).replace(".", ",") + "%";

  // -- Monta o HTML do resultado com a tabela de resumo --
  var caixa = document.getElementById("banco-resultado");

  caixa.classList.remove("resultado--verde", "resultado--azul", "resultado--vermelho");
  caixa.classList.add("resultado--azul", "resultado--visivel");
  caixa.style.display = "block";

  caixa.innerHTML =
    '<p class="resultado__titulo">Resumo da Simulação — ' + nomeBandeira + '</p>' +
    '<div class="banco-tabela">' +

      '<div class="banco-linha">' +
        '<span class="banco-linha__desc">Valor da venda</span>' +
        '<span class="banco-linha__valor">' + formatarMoeda(valor) + '</span>' +
      '</div>' +

      '<div class="banco-linha">' +
        '<span class="banco-linha__desc">Taxa da bandeira (' + pctExibido + ')</span>' +
        '<span class="banco-linha__valor">' + formatarMoeda(valorTaxaBandeira) + '</span>' +
      '</div>' +

      '<div class="banco-linha">' +
        '<span class="banco-linha__desc">Juros totais (' + parcelas + 'x de 1,5%)</span>' +
        '<span class="banco-linha__valor">' + formatarMoeda(jurosTotais) + '</span>' +
      '</div>' +

      '<div class="banco-linha">' +
        '<span class="banco-linha__desc">Taxa mensal fixa (R$ 12,50 × ' + parcelas + ')</span>' +
        '<span class="banco-linha__valor">' + formatarMoeda(taxaMensalFixa) + '</span>' +
      '</div>' +

      '<div class="banco-linha banco-linha--destaque">' +
        '<span class="banco-linha__desc">Valor total</span>' +
        '<span class="banco-linha__valor">' + formatarMoeda(valorTotal) + '</span>' +
      '</div>' +

      '<div class="banco-linha banco-linha--destaque">' +
        '<span class="banco-linha__desc">Valor de cada parcela</span>' +
        '<span class="banco-linha__valor">' + parcelas + 'x de ' + formatarMoeda(valorParcela) + '</span>' +
      '</div>' +

    '</div>';
}

// Conecta o botão à simulação
document.getElementById("banco-btn").addEventListener("click", simularVenda);