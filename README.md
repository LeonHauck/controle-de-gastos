# 💰 Controle de Gastos

Rastreador de despesas e receitas pessoais, com visual moderno e 5 temas à escolha. Feito em HTML, CSS e JavaScript puros (sem build tools), rodando 100% no navegador.

🔗 **Acesse online:** https://leonhauck.github.io/controle-de-gastos/

## ✨ Funcionalidades

- Cadastro de despesas e receitas (descrição, valor, categoria, data)
- Filtro por período (mês)
- Resumo do período: receitas, despesas, saldo e número de transações
- Gráfico de despesas por categoria, com percentual sobre o total
- Painel de metas e previsão: meta de economia mensal, previsão de gastos do próximo mês (média dos últimos meses fechados) e receita necessária para cobrir gastos + bater a meta
- Recap do mês fechado: aviso descontraído com a categoria que mais pesou, comparação com o mês anterior, dica de melhoria e aviso quando você supera bastante a própria meta
- Sequência de metas (streak) com marcos Bronze (3 meses), Prata (6) e Ouro (12) seguidos batendo a meta
- Conquistas vitalícias (não resetam com a sequência): Medalha a cada meta batida, e pedras Esmeralda/Rubi/Diamante quando você supera a própria meta em 15%/25%/40% num mês
- A meta usada para avaliar um mês fica travada assim que esse mês fecha — mudar a meta depois não altera a avaliação de meses antigos
- Modal "fim de mês" animado (estilo game): abre sozinho no dia 1 do mês seguinte mostrando meta, % batida, conquistas do mês e despesas/receitas por categoria — também acessível a qualquer momento pelo botão "Histórico", navegando por qualquer mês fechado
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
