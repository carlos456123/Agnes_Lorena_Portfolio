/* =========================================================
   Agnes Lorena · Media Kit — comportamento da página
   1. Conteúdo vindo do config.js (contatos, botões "copiar", crédito, métricas)
   2. Títulos em arco (o texto sempre cabe na curva)
   3. Cabeçalho (fundo ao rolar) e menu do celular
   4. Link ativo no menu (scrollspy)
   5. Revelação ao rolar
   6. Parallax leve nos decorativos
   7. Botão flutuante "Contrate"
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temIO = "IntersectionObserver" in window;

  /* ---------- 1. Conteúdo vindo do config.js ---------- */
  function aplicarContatos() {
    var c = cfg.contatos;
    if (!c) return;
    var wa = "https://wa.me/" + c.whatsapp +
      (c.whatsappMensagem ? "?text=" + encodeURIComponent(c.whatsappMensagem) : "");
    var links = {
      email: "mailto:" + c.email,
      whatsapp: wa,
      instagram: "https://instagram.com/" + c.instagram
    };
    var textos = {
      email: c.email,
      whatsapp: c.whatsappTexto,
      instagram: "@" + c.instagram
    };

    // data-contato = o link (href); data-contato-texto = o texto escrito na tela
    document.querySelectorAll("[data-contato]").forEach(function (el) {
      var link = links[el.getAttribute("data-contato")];
      if (link) el.href = link;
    });
    document.querySelectorAll("[data-contato-texto]").forEach(function (el) {
      var texto = textos[el.getAttribute("data-contato-texto")];
      if (texto) el.textContent = texto;
    });
  }

  /* Copia para a área de transferência. Se o navegador (ou a prévia) não permitir
     a API moderna, cai no método antigo com um campo de texto temporário. */
  function copiarTexto(texto) {
    function metodoAntigo() {
      return new Promise(function (ok, erro) {
        var campo = document.createElement("textarea");
        campo.value = texto;
        campo.setAttribute("readonly", "");
        campo.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(campo);
        campo.select();
        var deu = false;
        try { deu = document.execCommand("copy"); } catch (e) { /* segue sem copiar */ }
        document.body.removeChild(campo);
        deu ? ok() : erro();
      });
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(metodoAntigo);
    }
    return metodoAntigo();
  }

  function iniciarCopiar() {
    var c = cfg.contatos || {};
    var valores = { email: c.email, whatsapp: c.whatsappTexto };

    document.querySelectorAll("[data-copiar]").forEach(function (botao) {
      var texto = valores[botao.getAttribute("data-copiar")];
      if (!texto) return;
      var rotulo = botao.textContent;

      botao.addEventListener("click", function () {
        copiarTexto(texto).then(function () {
          botao.textContent = "Copiado!";
          botao.setAttribute("data-estado", "ok");
          setTimeout(function () {
            botao.textContent = rotulo;
            botao.removeAttribute("data-estado");
          }, 1800);
        }, function () { /* sem permissão: o botão continua como está */ });
      });
    });
  }

  /* ---------- Crédito do criador (rodapé) ---------- */
  function aplicarCriador() {
    var criador = cfg.criador || {};
    var link = document.getElementById("criador-link");
    if (!link) return;
    if (criador.nome) link.textContent = criador.nome;
    if (criador.instagram) {
      link.href = "https://instagram.com/" + criador.instagram;
    } else {
      // Sem usuário definido: mostra só o nome, sem link
      var span = document.createElement("span");
      span.textContent = link.textContent;
      link.parentNode.replaceChild(span, link);
    }
  }

  /* ---------- Métricas (cards do Engajamento) ---------- */
  function aplicarMetricas() {
    var lista = cfg.metricas;
    var alvo = document.getElementById("metricas");
    if (!alvo || !Array.isArray(lista) || !lista.length) return;

    var rotacoes = ["-1.2deg", ".8deg", "-.5deg", "1.1deg", "-.9deg", ".6deg"];
    alvo.innerHTML = "";
    lista.forEach(function (m, i) {
      var card = document.createElement("article");
      card.className = "metrica";
      card.style.setProperty("--r", rotacoes[i % rotacoes.length]);
      card.innerHTML =
        '<p class="metrica__valor"></p><p class="metrica__rotulo"></p><p class="metrica__periodo"></p>';
      card.children[0].textContent = m.valor || "—";
      card.children[1].textContent = m.rotulo || "";
      card.children[2].textContent = m.periodo || "";
      alvo.appendChild(card);
    });

    var nota = document.getElementById("metricas-atualizacao");
    if (nota) {
      nota.textContent = cfg.metricasAtualizadoEm ? "Atualizado em " + cfg.metricasAtualizadoEm : "";
    }
  }

  /* ---------- 2. Títulos em arco: o texto sempre cabe na curva ----------
     Se a fonte deixar o texto mais largo que o caminho do arco, as pontas ficam cortadas.
     Aqui reduzimos o tamanho só o necessário. O espaçamento entre letras é fixo, então o
     cálculo pode errar um pouco: repete até caber (no máximo 4 vezes). */
  function ajustarArcos() {
    document.querySelectorAll(".arco text").forEach(function (texto) {
      var tp = texto.querySelector("textPath");
      var ref = tp && tp.getAttribute("href");
      var caminho = ref && document.querySelector(ref);
      if (!caminho || !caminho.getTotalLength) return;

      texto.style.fontSize = ""; // volta ao tamanho do CSS antes de medir
      var cabe = caminho.getTotalLength() * 0.92;
      for (var i = 0; i < 4; i++) {
        var largura;
        try { largura = texto.getComputedTextLength(); } catch (e) { return; } // arco oculto no celular
        if (largura <= cabe) return;
        var atual = parseFloat(getComputedStyle(texto).fontSize);
        texto.style.fontSize = (atual * cabe / largura).toFixed(1) + "px";
      }
    });
  }
  function iniciarArcos() {
    var espera;
    function reajustar() { // junta vários avisos seguidos; espera um quadro para o navegador aplicar a fonte
      clearTimeout(espera);
      espera = setTimeout(function () { requestAnimationFrame(ajustarArcos); }, 100);
    }
    ajustarArcos(); // 1ª tentativa, possivelmente ainda com a fonte reserva
    if (document.fonts) {
      // Pede a fonte dos títulos e refaz o ajuste quando ela chegar: só com ela a medida é a de verdade
      if (document.fonts.load) document.fonts.load('700 64px "Noto Serif Display"').then(reajustar, reajustar);
      if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", reajustar);
    }
    window.addEventListener("load", reajustar);
    window.addEventListener("resize", reajustar); // o arco só aparece de 768px em diante
  }

  /* ---------- 3. Cabeçalho e menu ---------- */
  var topo = document.getElementById("topo");
  var botaoMenu = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");

  function cabecalhoAoRolar() {
    topo.classList.toggle("topo--rolado", window.scrollY > 40);
  }

  function abrirMenu(abrir) {
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.querySelector(".visualmente-oculto").textContent = abrir ? "Fechar menu" : "Abrir menu";
    document.body.classList.toggle("menu-aberto", abrir);
  }

  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", function () {
      abrirMenu(botaoMenu.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) abrirMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-aberto")) {
        abrirMenu(false);
        botaoMenu.focus();
      }
    });
  }

  /* ---------- 4. Scrollspy ---------- */
  function iniciarScrollspy() {
    if (!temIO) return;
    var links = document.querySelectorAll(".menu__lista a");
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("ativo"); a.removeAttribute("aria-current"); });
        var link = mapa[en.target.id];
        if (link) { link.classList.add("ativo"); link.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (s) { obs.observe(s); });
  }

  /* ---------- 5. Revelação ao rolar ----------
     O conteúdo só fica escondido se o JS rodar e o movimento estiver liberado.
     Sem JS (ou com movimento reduzido), tudo aparece normalmente. */
  function iniciarRevelacao() {
    if (reduzMovimento || !temIO) return;
    var itens = document.querySelectorAll(".revela");
    var alturaTela = window.innerHeight;

    document.documentElement.classList.add("anima");
    itens.forEach(function (el) {
      // Quem já está na tela ao carregar aparece direto
      if (el.getBoundingClientRect().top < alturaTela * 0.9) el.classList.add("visivel");
    });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visivel");
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });

    itens.forEach(function (el) { if (!el.classList.contains("visivel")) obs.observe(el); });
  }

  /* ---------- 6. Parallax nos decorativos ---------- */
  function iniciarParallax() {
    if (reduzMovimento) return;
    var desktop = window.matchMedia("(min-width: 768px)");
    var itens = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    var pendente = false;
    var LIMITE = 40; // deslocamento máximo em px

    function atualizar() {
      pendente = false;
      if (!desktop.matches) {
        itens.forEach(function (el) { el.style.translate = ""; });
        return;
      }
      var meio = window.innerHeight / 2;
      itens.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var fator = parseFloat(el.getAttribute("data-parallax")) || 0;
        var d = (r.top + r.height / 2 - meio) * fator;
        d = Math.max(-LIMITE, Math.min(LIMITE, d));
        el.style.translate = "0 " + d.toFixed(1) + "px";
      });
    }
    function pedir() { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }

    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    atualizar();
  }

  /* ---------- 7. Botão flutuante ---------- */
  function iniciarFab() {
    var fab = document.getElementById("fab");
    var capa = document.getElementById("inicio");
    var contrate = document.getElementById("contrate");
    if (!fab || !capa || !contrate || !temIO) return;

    var capaVisivel = true, contrateVisivel = false;
    function atualizar() { fab.classList.toggle("fab--visivel", !capaVisivel && !contrateVisivel); }

    new IntersectionObserver(function (e) { capaVisivel = e[0].isIntersecting; atualizar(); }).observe(capa);
    new IntersectionObserver(function (e) { contrateVisivel = e[0].isIntersecting; atualizar(); },
      { threshold: 0.15 }).observe(contrate);
  }

  /* ---------- Início ---------- */
  aplicarContatos();
  iniciarCopiar();
  aplicarCriador();
  aplicarMetricas();
  iniciarArcos();
  cabecalhoAoRolar();
  window.addEventListener("scroll", cabecalhoAoRolar, { passive: true });
  iniciarScrollspy();
  iniciarRevelacao();
  iniciarParallax();
  iniciarFab();

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
