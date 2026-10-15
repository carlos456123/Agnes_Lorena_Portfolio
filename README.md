# Agnes Lorena · Media Kit

Site one page em HTML, CSS e JavaScript puro, sem build e sem dependências. Para ver, abra o `index.html` no navegador.

## Estrutura
```
index.html        a página (7 seções: capa, sobre, rotina, conteúdo, público, números, contrate)
css/style.css     estilos, mobile-first, com índice no topo do arquivo
js/config.js      ← o que você edita: contatos, métricas e crédito do criador
js/script.js      comportamento (menu, arcos, revelação ao rolar, parallax, botão flutuante)
img/fotos/        fotos da Agnes (WebP)
img/decor/        decorativos soltos (WebP com transparência)
img/textura/      papel de fundo
```

## Editar sem mexer no código
Tudo em `js/config.js`:
- **Números do Engajamento:** `metricas` (valor, rótulo, período) e `metricasAtualizadoEm`.
- **Contatos:** `contatos` (Instagram, e-mail, WhatsApp e a mensagem que já vem escrita no WhatsApp; apague o texto para não ter mensagem).
- **Crédito do rodapé:** `criador` (nome e usuário do Instagram; deixe o usuário vazio para mostrar só o nome, sem link).

## Trocar uma foto
Coloque o novo arquivo WebP em `img/fotos/` com o **mesmo nome** da foto antiga. Fotos de polaroid são recortadas em 4:5 automaticamente; os recortes soltos (hero, dança, sentada, público) mantêm a proporção do arquivo.

Se trocar o recorte da dançarina (`danca.webp`), a coroa e o girassol são posicionados em % da própria imagem (`.rotina__coroa` e `.rotina__girassol` no CSS) e precisam ser reajustados.

## Pontos de atenção
- As fontes vêm do Google Fonts (precisa de internet): Noto Serif Display, Lekton e Mrs Saint Delafield.
- Os valores escritos direto no HTML (contatos e cards) são só a reserva para quando o JavaScript não carrega; os oficiais ficam no `config.js`.
