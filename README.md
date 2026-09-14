# Controle de Gastos

Rastreador de despesas e receitas pessoais, com visual moderno em dark mode. Feito em HTML, CSS e JavaScript puros (sem build tools), rodando 100% no navegador.

## Funcionalidades

- Cadastro de despesas e receitas (descrição, valor, categoria, data)
- Filtro por período (mês)
- Resumo do período: receitas, despesas, saldo e número de transações
- Gráfico de despesas por categoria
- Exclusão de transações
- Dados salvos localmente no navegador (`localStorage`)

## Como usar

Basta abrir o arquivo [index.html](index.html) diretamente no navegador — não é necessário instalar nada ou rodar um servidor.

## Estrutura

```
index.html      # marcação e estrutura da página
css/style.css   # tema dark e layout
js/app.js       # lógica da aplicação (estado, persistência, renderização)
```

## Hospedagem

Este é um projeto estático, então pode ser publicado gratuitamente via [GitHub Pages](https://pages.github.com/): Settings → Pages → Deploy from branch `main` / root.

⚠️ Os dados ficam salvos apenas no navegador de cada dispositivo (não há backend/sincronização entre dispositivos nesta versão).
