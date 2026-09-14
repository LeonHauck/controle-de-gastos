(function () {
  "use strict";

  const STORAGE_KEY = "expense-tracker-transactions";
  const STORAGE_KEY_GOAL = "expense-tracker-goal";
  const STORAGE_KEY_GOAL_HISTORY = "expense-tracker-goal-history";
  const STORAGE_KEY_ACHIEVEMENTS = "expense-tracker-achievements";
  const STORAGE_KEY_THEME = "expense-tracker-theme";

  const CATEGORIES = {
    despesa: [
      { id: "alimentacao", label: "Alimentação", color: "var(--cat-1)" },
      { id: "transporte", label: "Transporte", color: "var(--cat-2)" },
      { id: "moradia", label: "Moradia", color: "var(--cat-3)" },
      { id: "saude", label: "Saúde", color: "var(--cat-4)" },
      { id: "lazer", label: "Lazer", color: "var(--cat-5)" },
      { id: "educacao", label: "Educação", color: "var(--cat-6)" },
      { id: "compras", label: "Compras", color: "var(--cat-7)" },
      { id: "outros_despesa", label: "Outros", color: "var(--cat-8)" },
    ],
    receita: [
      { id: "salario", label: "Salário", color: "var(--cat-1)" },
      { id: "freelance", label: "Freelance", color: "var(--cat-2)" },
      { id: "investimentos", label: "Investimentos", color: "var(--cat-3)" },
      { id: "outros_receita", label: "Outros", color: "var(--cat-8)" },
    ],
  };

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const TROPHY_ICON =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const TRENDING_ICON =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-8M21 7h-5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const FLAME_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22c4.4 0 7-2.7 7-6.5 0-3-2-5-3-7-.3 2-1.5 3-2.5 2 1-2.5-1-4.5-2.5-6.5-.5 3-3 5-4.5 7.5C5.3 13.5 5 14.7 5 15.5 5 19.3 7.6 22 12 22Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  const GEM_ICON =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 3h12l4 6-10 12L2 9l4-6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

  const MEDAL_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 2 6 9m9-7 3 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="m6 9 2.5 5M18 9l-2.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="15" r="7" stroke="currentColor" stroke-width="1.6"/><path d="m12 11.3 1.1 2.2 2.5.35-1.8 1.75.4 2.4-2.2-1.15-2.2 1.15.4-2.4-1.8-1.75 2.5-.35 1.1-2.2Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>';

  // Marcos de superação: quanto acima da própria meta o usuário fechou o mês.
  const OVERACHIEVE_TIERS = [
    { threshold: 0.4, gem: "diamond", label: "Diamante" },
    { threshold: 0.25, gem: "ruby", label: "Rubi" },
    { threshold: 0.15, gem: "emerald", label: "Esmeralda" },
  ];

  // O troféu da sequência atual é só sobre consistência (tempo seguido).
  // As pedras (esmeralda/rubi/diamante) não entram aqui — elas são
  // conquistas vitalícias por superar a própria meta num mês (ver
  // OVERACHIEVE_TIERS e updateAchievements).
  const STREAK_MILESTONES = [
    { months: 12, label: "Ouro", tier: "gold" },
    { months: 6, label: "Prata", tier: "silver" },
    { months: 3, label: "Bronze", tier: "bronze" },
  ];

  const RECAP_SUCCESS_MESSAGES = [
    (month, saved, goal) =>
      `Mandou bem em ${month}! Você economizou ${currencyFormatter.format(saved)}, passando da meta de ${currencyFormatter.format(goal)}. Bora manter o ritmo!`,
    (month, saved, goal) =>
      `${month} fechou no azul: ${currencyFormatter.format(saved)} guardados, meta de ${currencyFormatter.format(goal)} batida com folga. Você tá voando!`,
    (month, saved, goal) =>
      `Meta batida em ${month}! ${currencyFormatter.format(saved)} no bolso, acima dos ${currencyFormatter.format(goal)} planejados. Se continuar assim, vira hábito.`,
  ];

  const RECAP_MISS_MESSAGES = [
    (month, saved, goal) =>
      `Em ${month} você economizou ${currencyFormatter.format(saved)}, um pouco abaixo da meta de ${currencyFormatter.format(goal)}. Mês novo, chance nova — bora tentar de novo?`,
    (month, saved, goal) =>
      `Quase lá! ${currencyFormatter.format(saved)} guardados em ${month}, faltou um pouco pra bater os ${currencyFormatter.format(goal)} da meta. Ajusta o cinto esse mês?`,
    (month, saved, goal) =>
      `${month} não bateu a meta (${currencyFormatter.format(saved)} de ${currencyFormatter.format(goal)}), mas cada real economizado conta. Vamos com tudo nesse mês!`,
  ];

  // ---- State ----

  let transactions = loadTransactions();
  let currentType = "despesa";
  let selectedPeriod = "all";
  let cloudUser = null;
  let unsubscribeCloud = null;
  let monthlyGoal = loadGoalLocal();
  let goalHistory = loadGoalHistoryLocal();
  let achievements = loadAchievementsLocal();

  // ---- DOM refs ----

  const form = document.getElementById("transaction-form");
  const typeButtons = document.querySelectorAll(".type-btn");
  const typeInput = document.getElementById("type");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categorySelect = document.getElementById("category");
  const periodSelect = document.getElementById("period-select");

  const statIncome = document.getElementById("stat-income");
  const statExpense = document.getElementById("stat-expense");
  const statBalance = document.getElementById("stat-balance");
  const statCount = document.getElementById("stat-count");

  const chartContainer = document.getElementById("chart-container");
  const chartEmpty = document.getElementById("chart-empty");

  const tbody = document.getElementById("transactions-body");
  const tableEmpty = document.getElementById("table-empty");

  const syncBtn = document.getElementById("sync-btn");
  const syncLabel = document.getElementById("sync-label");
  const syncStatus = document.getElementById("sync-status");

  const themeSwatches = document.querySelectorAll(".theme-swatch");

  const monthBanner = document.getElementById("month-banner");
  const monthBannerIcon = document.getElementById("month-banner-icon");
  const monthBannerTitle = document.getElementById("month-banner-title");
  const monthBannerMessage = document.getElementById("month-banner-message");
  const monthBannerClose = document.getElementById("month-banner-close");

  const goalInput = document.getElementById("goal-input");
  const goalProgressValue = document.getElementById("goal-progress-value");
  const goalProgressFill = document.getElementById("goal-progress-fill");
  const goalProgressNote = document.getElementById("goal-progress-note");
  const forecastValue = document.getElementById("forecast-value");
  const forecastNote = document.getElementById("forecast-note");
  const requiredIncomeValue = document.getElementById("required-income-value");
  const requiredIncomeNote = document.getElementById("required-income-note");

  const streakBadge = document.getElementById("streak-badge");
  const streakIcon = document.getElementById("streak-icon");
  const streakText = document.getElementById("streak-text");

  const achievementsSection = document.getElementById("achievements-section");
  const achvMedal = document.getElementById("achv-medal");
  const achvEmerald = document.getElementById("achv-emerald");
  const achvRuby = document.getElementById("achv-ruby");
  const achvDiamond = document.getElementById("achv-diamond");

  // ---- Init ----

  dateInput.value = toISODate(new Date());
  populateCategorySelect();
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  render();

  // ---- Events ----

  const typeSlider = document.querySelector(".type-slider");

  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      typeInput.value = currentType;
      typeButtons.forEach((b) => b.classList.toggle("active", b === btn));
      typeSlider.classList.toggle("slider-receita", currentType === "receita");
      populateCategorySelect();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) return;

    const data = {
      type: currentType,
      description: descriptionInput.value.trim(),
      amount: amount,
      category: categorySelect.value,
      date: dateInput.value,
    };

    if (cloudUser) {
      userCollection(cloudUser.uid)
        .add(data)
        .catch((err) => {
          console.warn("Erro ao salvar na nuvem:", err);
          alert("Não foi possível salvar. Verifique sua conexão e tente novamente.");
        });
    } else {
      transactions.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        ...data,
      });
      saveTransactions();
      render();
    }

    form.reset();
    dateInput.value = toISODate(new Date());
    typeButtons[0].click();
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const id = btn.dataset.id;

    if (cloudUser) {
      userCollection(cloudUser.uid)
        .doc(id)
        .delete()
        .catch((err) => console.warn("Erro ao excluir na nuvem:", err));
    } else {
      transactions = transactions.filter((t) => t.id !== id);
      saveTransactions();
      render();
    }
  });

  periodSelect.addEventListener("change", () => {
    selectedPeriod = periodSelect.value;
    render();
  });

  goalInput.addEventListener("change", () => {
    const amount = Math.max(0, parseFloat(goalInput.value) || 0);
    monthlyGoal = amount;

    if (cloudUser) {
      goalDoc(cloudUser.uid)
        .set({ amount }, { merge: true })
        .catch((err) => console.warn("Erro ao salvar meta na nuvem:", err));
    } else {
      saveGoalLocal(amount);
    }

    renderGoals();
  });

  monthBannerClose.addEventListener("click", () => {
    monthBanner.hidden = true;
  });

  themeSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      applyTheme(swatch.dataset.theme);
      try {
        localStorage.setItem(STORAGE_KEY_THEME, swatch.dataset.theme);
      } catch (err) {
        console.warn("Não foi possível salvar o tema:", err);
      }
    });
  });

  function applyTheme(theme) {
    if (theme && theme !== "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      theme = "dark";
    }
    themeSwatches.forEach((swatch) => {
      swatch.classList.toggle("active", swatch.dataset.theme === theme);
    });
  }

  syncBtn.addEventListener("click", () => {
    if (cloudUser) {
      auth.signOut();
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    syncBtn.disabled = true;
    auth
      .signInWithPopup(provider)
      .catch((err) => {
        console.warn("Falha no login:", err);
        alert("Não foi possível entrar com o Google. Tente novamente.");
      })
      .finally(() => {
        syncBtn.disabled = false;
      });
  });

  // ---- Cloud sync (Firebase) ----

  function userCollection(uid) {
    return db.collection("users").doc(uid).collection("transactions");
  }

  function goalDoc(uid) {
    return db.collection("users").doc(uid).collection("settings").doc("goal");
  }

  function achievementsDoc(uid) {
    return db.collection("users").doc(uid).collection("settings").doc("achievements");
  }

  function subscribeCloud(uid) {
    unsubscribeCloud = userCollection(uid).onSnapshot(
      (snapshot) => {
        transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        render();
      },
      (err) => console.warn("Erro ao sincronizar:", err)
    );
  }

  auth.onAuthStateChanged(async (user) => {
    if (unsubscribeCloud) {
      unsubscribeCloud();
      unsubscribeCloud = null;
    }

    if (user) {
      const localBackup = transactions;
      cloudUser = user;
      syncBtn.classList.add("active");
      syncLabel.textContent = "Sair";
      syncStatus.hidden = false;
      syncStatus.textContent = `Sincronizado como ${user.email}`;

      try {
        const snapshot = await userCollection(user.uid).limit(1).get();
        if (snapshot.empty && localBackup.length > 0) {
          const batch = db.batch();
          localBackup.forEach((t) => {
            const { id, ...data } = t;
            batch.set(userCollection(user.uid).doc(), data);
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn("Erro ao migrar dados locais para a nuvem:", err);
      }

      try {
        const goalSnap = await goalDoc(user.uid).get();
        if (goalSnap.exists) {
          const data = goalSnap.data();
          monthlyGoal = data.amount || 0;
          goalHistory = data.history || {};
        } else if (monthlyGoal > 0 || Object.keys(goalHistory).length > 0) {
          await goalDoc(user.uid).set({ amount: monthlyGoal, history: goalHistory });
        }
      } catch (err) {
        console.warn("Erro ao carregar meta da nuvem:", err);
      }

      try {
        const achvSnap = await achievementsDoc(user.uid).get();
        if (achvSnap.exists) {
          achievements = normalizeAchievements(achvSnap.data());
        } else if (hasAnyAchievement(achievements)) {
          await achievementsDoc(user.uid).set(achievements);
        }
      } catch (err) {
        console.warn("Erro ao carregar conquistas da nuvem:", err);
      }

      subscribeCloud(user.uid);
    } else {
      cloudUser = null;
      syncBtn.classList.remove("active");
      syncLabel.textContent = "Sincronizar";
      syncStatus.hidden = true;
      transactions = loadTransactions();
      monthlyGoal = loadGoalLocal();
      goalHistory = loadGoalHistoryLocal();
      achievements = loadAchievementsLocal();
      render();
    }
  });

  // ---- Rendering ----

  function render() {
    renderPeriodOptions();
    const filtered = getFilteredTransactions();
    renderStats(filtered);
    renderChart(filtered);
    renderTable(filtered);
    renderGoals();
    renderStreakBadge();
    updateAchievements();
    renderAchievements();
    checkMonthlyRecap();
  }

  function renderPeriodOptions() {
    const periods = new Set(transactions.map((t) => t.date.slice(0, 7)));
    const sorted = Array.from(periods).sort().reverse();

    const previousValue = periodSelect.value || selectedPeriod;
    periodSelect.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "Todos os períodos";
    periodSelect.appendChild(allOpt);

    sorted.forEach((period) => {
      const opt = document.createElement("option");
      opt.value = period;
      opt.textContent = capitalize(monthFormatter.format(new Date(period + "-02T00:00:00Z")));
      periodSelect.appendChild(opt);
    });

    if (sorted.includes(previousValue) || previousValue === "all") {
      periodSelect.value = previousValue;
      selectedPeriod = previousValue;
    } else {
      periodSelect.value = "all";
      selectedPeriod = "all";
    }
  }

  function getFilteredTransactions() {
    if (selectedPeriod === "all") return transactions;
    return transactions.filter((t) => t.date.slice(0, 7) === selectedPeriod);
  }

  function renderStats(list) {
    const income = sumBy(list, "receita");
    const expense = sumBy(list, "despesa");

    statIncome.textContent = currencyFormatter.format(income);
    statExpense.textContent = currencyFormatter.format(expense);
    statBalance.textContent = currencyFormatter.format(income - expense);
    statBalance.classList.toggle("balance-negative", income - expense < 0);
    statCount.textContent = String(list.length);
  }

  function sumBy(list, type) {
    return list.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);
  }

  function renderChart(list) {
    const despesas = list.filter((t) => t.type === "despesa");
    chartContainer.querySelectorAll(".chart-row").forEach((el) => el.remove());

    if (despesas.length === 0) {
      chartEmpty.hidden = false;
      return;
    }
    chartEmpty.hidden = true;

    const totals = {};
    despesas.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    const maxValue = Math.max(...Object.values(totals));
    const totalDespesas = Object.values(totals).reduce((acc, v) => acc + v, 0);
    const rows = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId, value]) => {
        const meta = findCategory(categoryId) || { label: categoryId, color: "var(--cat-8)" };
        const percent = totalDespesas > 0 ? Math.round((value / totalDespesas) * 100) : 0;
        const row = document.createElement("div");
        row.className = "chart-row";
        row.innerHTML = `
          <span class="cat-label">${escapeHtml(meta.label)}</span>
          <span class="chart-track">
            <span class="chart-fill" style="width:${(value / maxValue) * 100}%; background:${meta.color};"></span>
          </span>
          <span class="cat-value">${currencyFormatter.format(value)} <span class="cat-percent">· ${percent}%</span></span>
        `;
        return row;
      });

    rows.forEach((row) => chartContainer.appendChild(row));
  }

  function renderTable(list) {
    tbody.innerHTML = "";

    if (list.length === 0) {
      tableEmpty.hidden = false;
      return;
    }
    tableEmpty.hidden = true;

    const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

    sorted.forEach((t) => {
      const meta = findCategory(t.category) || { label: t.category, color: "var(--cat-8)" };
      const tr = document.createElement("tr");
      const sign = t.type === "receita" ? "+" : "−";
      const amountClass = t.type === "receita" ? "amount-receita" : "amount-despesa";

      tr.innerHTML = `
        <td data-label="Data">${dateFormatter.format(new Date(t.date + "T00:00:00Z"))}</td>
        <td data-label="Descrição">${escapeHtml(t.description || "(sem descrição)")}</td>
        <td data-label="Categoria"><span class="cat-badge"><span class="cat-dot" style="background:${meta.color}; color:${meta.color};"></span>${escapeHtml(meta.label)}</span></td>
        <td data-label="Valor" class="amount-cell ${amountClass}">${sign} ${currencyFormatter.format(t.amount)}</td>
        <td class="col-actions">
          <button class="delete-btn" data-id="${t.id}" aria-label="Excluir transação">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ---- Metas & previsão ----

  function computeMonthlyExpenseTotals() {
    const totals = {};
    transactions
      .filter((t) => t.type === "despesa")
      .forEach((t) => {
        const key = t.date.slice(0, 7);
        totals[key] = (totals[key] || 0) + t.amount;
      });
    return totals;
  }

  function getForecastExpense() {
    const totals = computeMonthlyExpenseTotals();
    const currentKey = toISODate(new Date()).slice(0, 7);
    const completedMonths = Object.keys(totals)
      .filter((key) => key < currentKey)
      .sort()
      .reverse()
      .slice(0, 3);

    if (completedMonths.length === 0) return null;

    const sum = completedMonths.reduce((acc, key) => acc + totals[key], 0);
    return { value: sum / completedMonths.length, monthsUsed: completedMonths.length };
  }

  function getCurrentMonthBalance() {
    const currentKey = toISODate(new Date()).slice(0, 7);
    const monthTx = transactions.filter((t) => t.date.slice(0, 7) === currentKey);
    return sumBy(monthTx, "receita") - sumBy(monthTx, "despesa");
  }

  function renderGoals() {
    goalInput.value = monthlyGoal > 0 ? monthlyGoal.toFixed(2) : "";

    const balance = getCurrentMonthBalance();
    const pct = monthlyGoal > 0 ? Math.max(0, Math.min(100, (balance / monthlyGoal) * 100)) : 0;

    goalProgressValue.innerHTML = `${currencyFormatter.format(balance)} <span class="goal-card-sub">de ${currencyFormatter.format(monthlyGoal)}</span>`;
    goalProgressFill.style.width = pct + "%";

    if (monthlyGoal <= 0) {
      goalProgressNote.textContent = "Defina uma meta acima para acompanhar seu progresso.";
    } else if (balance >= monthlyGoal) {
      goalProgressNote.textContent = "Meta batida neste mês.";
    } else {
      goalProgressNote.textContent = `Faltam ${currencyFormatter.format(monthlyGoal - balance)} para bater a meta.`;
    }

    const forecast = getForecastExpense();
    if (!forecast) {
      forecastValue.textContent = "—";
      forecastNote.textContent = "Sem dados suficientes ainda (precisa de pelo menos 1 mês fechado).";
      requiredIncomeValue.textContent = "—";
      requiredIncomeNote.textContent = "";
      return;
    }

    forecastValue.textContent = currencyFormatter.format(forecast.value);
    forecastNote.textContent = `Média dos últimos ${forecast.monthsUsed} ${forecast.monthsUsed === 1 ? "mês fechado" : "meses fechados"}.`;

    const requiredIncome = forecast.value + Math.max(monthlyGoal, 0);
    requiredIncomeValue.textContent = currencyFormatter.format(requiredIncome);
    requiredIncomeNote.textContent =
      monthlyGoal > 0
        ? `Para cobrir a previsão de gastos e economizar ${currencyFormatter.format(monthlyGoal)}.`
        : "Para cobrir a previsão de gastos (defina uma meta para incluir economia).";
  }

  function loadGoalLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GOAL);
      return raw ? parseFloat(raw) || 0 : 0;
    } catch (err) {
      console.warn("Não foi possível carregar a meta salva:", err);
      return 0;
    }
  }

  function saveGoalLocal(amount) {
    try {
      localStorage.setItem(STORAGE_KEY_GOAL, String(amount));
    } catch (err) {
      console.warn("Não foi possível salvar a meta:", err);
    }
  }

  function loadGoalHistoryLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GOAL_HISTORY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn("Não foi possível carregar o histórico de metas:", err);
      return {};
    }
  }

  function saveGoalHistoryLocal(history) {
    try {
      localStorage.setItem(STORAGE_KEY_GOAL_HISTORY, JSON.stringify(history));
    } catch (err) {
      console.warn("Não foi possível salvar o histórico de metas:", err);
    }
  }

  function persistGoalHistory() {
    if (cloudUser) {
      goalDoc(cloudUser.uid)
        .set({ history: goalHistory }, { merge: true })
        .catch((err) => console.warn("Erro ao salvar histórico de metas na nuvem:", err));
    } else {
      saveGoalHistoryLocal(goalHistory);
    }
  }

  function normalizeAchievements(data) {
    data = data || {};
    const gems = data.gems || {};
    return {
      medals: data.medals || 0,
      gems: {
        emerald: gems.emerald || 0,
        ruby: gems.ruby || 0,
        diamond: gems.diamond || 0,
      },
      lastCountedMonth: data.lastCountedMonth || null,
    };
  }

  function hasAnyAchievement(a) {
    return a.medals > 0 || a.gems.emerald > 0 || a.gems.ruby > 0 || a.gems.diamond > 0;
  }

  function loadAchievementsLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      return normalizeAchievements(raw ? JSON.parse(raw) : null);
    } catch (err) {
      console.warn("Não foi possível carregar as conquistas:", err);
      return normalizeAchievements(null);
    }
  }

  function saveAchievementsLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(data));
    } catch (err) {
      console.warn("Não foi possível salvar as conquistas:", err);
    }
  }

  function persistAchievements() {
    if (cloudUser) {
      achievementsDoc(cloudUser.uid)
        .set(achievements)
        .catch((err) => console.warn("Erro ao salvar conquistas na nuvem:", err));
    } else {
      saveAchievementsLocal(achievements);
    }
  }

  // Percorre os meses fechados ainda não contabilizados (desde a última
  // contagem) e soma +1 medalha para cada meta batida, além da pedra de
  // superação correspondente (se aplicável). Contadores vitalícios: não
  // resetam quando a sequência atual quebra.
  function updateAchievements() {
    const balances = getMonthlyBalances();
    const prevKey = getPrevMonthKey();
    const lastCounted = achievements.lastCountedMonth;

    const pending = Object.keys(balances)
      .filter((key) => key <= prevKey && (!lastCounted || key > lastCounted))
      .sort();

    if (pending.length === 0) return;

    pending.forEach((key) => {
      const goalForMonth = lockGoalForMonth(key);
      if (goalForMonth === null) return;

      const balance = balances[key].income - balances[key].expense;
      if (balance < goalForMonth) return;

      achievements.medals++;

      const overRatio = (balance - goalForMonth) / goalForMonth;
      const tier = OVERACHIEVE_TIERS.find((t) => overRatio >= t.threshold);
      if (tier) achievements.gems[tier.gem]++;
    });

    achievements.lastCountedMonth = pending[pending.length - 1];
    persistAchievements();
  }

  function renderAchievements() {
    const { medals, gems } = achievements;
    const any = hasAnyAchievement(achievements);
    achievementsSection.hidden = !any;
    if (!any) return;

    setAchvPill(achvMedal, medals, MEDAL_ICON, "Medalha");
    setAchvPill(achvEmerald, gems.emerald, GEM_ICON, "Esmeralda");
    setAchvPill(achvRuby, gems.ruby, GEM_ICON, "Rubi");
    setAchvPill(achvDiamond, gems.diamond, GEM_ICON, "Diamante");
  }

  function setAchvPill(el, count, icon, label) {
    if (count <= 0) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML = `${icon} ${label} <b>×${count}</b>`;
  }

  // A meta usada para avaliar um mês fica travada na primeira vez que esse mês
  // é avaliado (quando ele já fechou). Mudar a meta atual não altera meses
  // antigos já travados.
  function lockGoalForMonth(monthKey) {
    if (goalHistory[monthKey] !== undefined) return goalHistory[monthKey];
    if (monthlyGoal <= 0) return null;
    goalHistory[monthKey] = monthlyGoal;
    persistGoalHistory();
    return monthlyGoal;
  }

  // ---- Recap mensal & sequência ----

  function shiftMonthKey(key, delta) {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return d.toISOString().slice(0, 7);
  }

  function getPrevMonthKey() {
    return shiftMonthKey(toISODate(new Date()).slice(0, 7), -1);
  }

  function getMonthlyBalances() {
    const map = {};
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (t.type === "receita") map[key].income += t.amount;
      else map[key].expense += t.amount;
    });
    return map;
  }

  // Percorre os meses fechados, mais recente primeiro, travando a meta de
  // cada um e contando quantos seguidos bateram a meta (e quanto foi
  // economizado nesses meses). `fromKey` permite recalcular "o estado antes
  // deste mês" para detectar quando um marco novo foi desbloqueado.
  function getStreakInfo(fromKey) {
    const balances = getMonthlyBalances();
    let cursor = fromKey || getPrevMonthKey();
    let months = 0;
    let savings = 0;

    while (balances[cursor]) {
      const goalForMonth = lockGoalForMonth(cursor);
      if (goalForMonth === null) break;

      const balance = balances[cursor].income - balances[cursor].expense;
      if (balance < goalForMonth) break;

      months++;
      savings += balance;
      cursor = shiftMonthKey(cursor, -1);
    }

    return { months, savings };
  }

  function getMilestone(months, savings) {
    return STREAK_MILESTONES.find((m) => months >= m.months || (m.amount !== undefined && savings >= m.amount)) || null;
  }

  function renderStreakBadge() {
    const { months, savings } = getStreakInfo();
    if (months <= 0) {
      streakBadge.hidden = true;
      return;
    }

    const milestone = getMilestone(months, savings);
    streakBadge.hidden = false;
    streakBadge.classList.remove("tier-bronze", "tier-silver", "tier-gold");

    if (milestone) {
      streakBadge.classList.add("tier-" + milestone.tier);
      streakIcon.innerHTML = TROPHY_ICON;
      streakText.textContent = `${months} meses · ${milestone.label}`;
    } else {
      streakIcon.innerHTML = FLAME_ICON;
      streakText.textContent = `${months} ${months === 1 ? "mês seguido" : "meses seguidos"}`;
    }
  }

  function getTopCategoryInsight(monthTx) {
    const despesas = monthTx.filter((t) => t.type === "despesa");
    if (despesas.length === 0) return null;

    const totals = {};
    despesas.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    const totalDespesa = Object.values(totals).reduce((a, b) => a + b, 0);
    const [topCatId, topVal] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    const meta = findCategory(topCatId);
    const percent = totalDespesa > 0 ? Math.round((topVal / totalDespesa) * 100) : 0;

    return { label: meta ? meta.label : topCatId, percent };
  }

  function checkMonthlyRecap() {
    const prevKey = getPrevMonthKey();
    const prevTx = transactions.filter((t) => t.date.slice(0, 7) === prevKey);
    if (prevTx.length === 0) return;

    const noticeKey = "expense-tracker-recap-" + prevKey;
    let alreadyShown;
    try {
      alreadyShown = localStorage.getItem(noticeKey);
    } catch (err) {
      alreadyShown = null;
    }
    if (alreadyShown) return;

    const goalForMonth = lockGoalForMonth(prevKey);
    if (goalForMonth === null) return;

    const income = sumBy(prevTx, "receita");
    const expense = sumBy(prevTx, "despesa");
    const saved = income - expense;
    const hit = saved >= goalForMonth;
    const monthLabel = capitalize(monthFormatter.format(new Date(prevKey + "-02T00:00:00Z")));
    const pool = hit ? RECAP_SUCCESS_MESSAGES : RECAP_MISS_MESSAGES;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    const parts = [pick(monthLabel, saved, goalForMonth)];

    const topCategory = getTopCategoryInsight(prevTx);
    if (topCategory) {
      parts.push(
        hit
          ? `Mesmo com ${topCategory.percent}% dos gastos em ${topCategory.label}, você fechou dentro da meta.`
          : `Categoria que mais pesou: ${topCategory.label} (${topCategory.percent}% dos gastos) — bom lugar pra cortar esse mês.`
      );
    }

    const beforeKey = shiftMonthKey(prevKey, -1);
    const beforeExpense = sumBy(
      transactions.filter((t) => t.date.slice(0, 7) === beforeKey),
      "despesa"
    );
    if (beforeExpense > 0) {
      const diffPct = Math.round(((expense - beforeExpense) / beforeExpense) * 100);
      if (diffPct <= -5) {
        parts.push(`Você gastou ${Math.abs(diffPct)}% a menos que no mês anterior — ótimo sinal!`);
      } else if (diffPct >= 5) {
        parts.push(`Você gastou ${diffPct}% a mais que no mês anterior.`);
      }
    }

    let earnedGem = null;
    if (hit && goalForMonth > 0) {
      const overRatio = (saved - goalForMonth) / goalForMonth;
      earnedGem = OVERACHIEVE_TIERS.find((t) => overRatio >= t.threshold) || null;
      if (earnedGem) {
        const overPct = Math.round(overRatio * 100);
        parts.push(
          `E olha só: você superou a sua própria meta em ${overPct}% esse mês — ganhou uma pedra de ${earnedGem.label}!`
        );
      }
    }

    let milestone = null;
    if (hit) {
      const current = getStreakInfo(prevKey);
      const prior = getStreakInfo(beforeKey);
      const currentMilestone = getMilestone(current.months, current.savings);
      const priorMilestone = getMilestone(prior.months, prior.savings);

      if (currentMilestone && currentMilestone !== priorMilestone) {
        milestone = currentMilestone;
        parts.push(`Você desbloqueou o troféu ${milestone.label}: ${current.months} meses seguidos batendo a meta!`);
      } else if (current.months > 1) {
        parts.push(`Essa já é sua ${current.months}ª meta seguida — sequência em chamas!`);
      }
    }

    monthBanner.classList.toggle("success", hit);
    monthBanner.classList.toggle("miss", !hit);
    monthBannerIcon.innerHTML = hit ? (earnedGem ? GEM_ICON : TROPHY_ICON) : TRENDING_ICON;
    monthBannerTitle.textContent = hit ? "Meta batida!" : "Quase lá!";
    monthBannerMessage.textContent = parts.join(" ");
    monthBanner.hidden = false;

    try {
      localStorage.setItem(noticeKey, "1");
    } catch (err) {
      console.warn("Não foi possível salvar o aviso do mês:", err);
    }
  }

  // ---- Helpers ----

  function populateCategorySelect() {
    categorySelect.innerHTML = "";
    CATEGORIES[currentType].forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.label;
      categorySelect.appendChild(opt);
    });
  }

  function findCategory(id) {
    return CATEGORIES.despesa.find((c) => c.id === id) || CATEGORIES.receita.find((c) => c.id === id);
  }

  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Não foi possível carregar os dados salvos:", err);
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (err) {
      console.warn("Não foi possível salvar os dados:", err);
    }
  }

  function toISODate(d) {
    return d.toISOString().slice(0, 10);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
