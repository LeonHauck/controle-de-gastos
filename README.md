# 💰 Controle de Gastos

Rastreador de despesas e receitas pessoais, com visual moderno e 5 temas à escolha. Feito em HTML, CSS e JavaScript puros (sem build tools), rodando 100% no navegador.

🔗 **Acesse online:** https://leonhauck.github.io/controle-de-gastos/

## ✨ Funcionalidades

- Cadastro de despesas e receitas (descrição, valor, categoria, data)
- Filtro por período (mês)
- Resumo do período: receitas, despesas, saldo e número de transações
- Gráfico de despesas por categoria, com percentual sobre o total
- Painel de metas e previsão: meta de economia mensal, previsão de gastos do próximo mês (média dos últimos meses fechados) e receita necessária para cobrir gastos + bater a meta
- Recap do mês fechado: aviso descontraído dizendo se você bateu ou não a meta do mês anterior
- Exclusão de transações
- 5 temas de cores (Dark, Claro, Meia-noite, Floresta, Pôr do sol), salvos por dispositivo
- Sincronização entre dispositivos com login do Google (Firebase Auth + Firestore)
- Funciona offline com `localStorage` quando não está logado

## 🚀 Como usar

Basta abrir o arquivo [index.html](index.html) diretamente no navegador — não é necessário instalar nada ou rodar um servidor.

## 📁 Estrutura

```
index.html            # marcação e estrutura da página
css/style.css         # tema dark e layout
js/app.js             # lógica da aplicação (estado, persistência, renderização)
js/firebase-config.js # chaves e inicialização do Firebase
```

## 🌐 Hospedagem

Publicado via [GitHub Pages](https://pages.github.com/), a partir da branch `master`.

## ☁️ Sincronização

Clique em **"Sincronizar"** no topo do app e entre com sua conta Google para ter os dados disponíveis em qualquer dispositivo (PC, celular etc.), em tempo real, via [Firebase](https://firebase.google.com/) (Auth + Firestore). Sem login, os dados ficam salvos apenas no navegador atual (`localStorage`).

---

👤 Desenvolvido por **Leon Hauck**
