/**
 * OmniLedger Pro - 超級記帳王 (五大頂尖記帳軟體終極融合版 - 記帳達人出國七天實戰優化版)
 */

const STORAGE_KEY = 'OMNILEDGER_PRO_STATE_V2';

const DEFAULT_FX_RATES = {
  TWD: 1,
  JPY: 0.215,
  THB: 0.94,
  USD: 32.2,
  EUR: 34.8,
  HKD: 4.12
};

const CATEGORIES = {
  expense: [
    { id: 'food', name: '餐飲美食', icon: '🍜', color: '#f43f5e', building: '星級美食廣場', bEmoji: '🍱', defaultBudget: 12000 },
    { id: 'transport', name: '交通通勤', icon: '🚇', color: '#3b82f6', building: '高鐵轉運樞紐', bEmoji: '🚄', defaultBudget: 3500 },
    { id: 'shopping', name: '購物消費', icon: '🛍️', color: '#ec4899', building: '國際精品百貨', bEmoji: '🏬', defaultBudget: 8000 },
    { id: 'home', name: '居家住宿', icon: '🏠', color: '#8b5cf6', building: '綠能智慧社區', bEmoji: '🏢', defaultBudget: 16000 },
    { id: 'entertainment', name: '休閒門票', icon: '🎮', color: '#f59e0b', building: '環球影城樂園', bEmoji: '🎡', defaultBudget: 5000 },
    { id: 'medical', name: '醫療藥妝', icon: '💊', color: '#10b981', building: '未來生技醫療院', bEmoji: '🏥', defaultBudget: 2500 },
    { id: 'education', name: '進修學習', icon: '📚', color: '#06b6d4', building: '國家數位圖書館', bEmoji: '🏛️', defaultBudget: 3000 },
    { id: 'other_exp', name: '其他支出', icon: '📦', color: '#64748b', building: '市民服務中心', bEmoji: '🏤', defaultBudget: 2000 }
  ],
  income: [
    { id: 'salary', name: '薪資收入', icon: '💼', color: '#10b981', building: '跨國金融雙子星', bEmoji: '🏙️' },
    { id: 'bonus', name: '獎金與退稅', icon: '🧧', color: '#34d399', building: '市政榮譽金庫', bEmoji: '🏦' },
    { id: 'invest_inc', name: '投資股息/利得', icon: '📈', color: '#38bdf8', building: '證券交易中心', bEmoji: '💹' },
    { id: 'side_hustle', name: '副業與代墊收回', icon: '🚀', color: '#a855f7', building: '新創科技育成塔', bEmoji: '🗼' }
  ],
  transfer: [
    { id: 'transfer', name: '轉帳 / 換匯 / 繳卡費', icon: '🔄', color: '#3b82f6', building: '跨行清算中心', bEmoji: '🏧' }
  ]
};

const App = {
  state: null,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  selectedCalendarDate: null,
  currentTxType: 'expense',
  expandedProjectId: null,

  init() {
    this.loadState();
    this.bindEvents();
    this.initInlineBlankBar();
    this.updateIosClock();
    setInterval(() => this.updateIosClock(), 30000);
    this.populateSelects();
    this.renderAll();
  },

  updateIosClock() {
    const el = document.getElementById('iosClock');
    if (!el) return;
    const now = new Date();
    el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  },

  setDeviceMode(mode) {
    const isIphone = mode === 'iphone';
    document.body.classList.toggle('iphone-sim-mode', isIphone);
    document.getElementById('btnModeIphone').classList.toggle('active', isIphone);
    document.getElementById('btnModeDesktop').classList.toggle('active', !isIphone);
    if (!isIphone) {
      document.getElementById('inlineBlankBar').style.display = 'grid';
      document.getElementById('smartBarSection').style.display = 'flex';
    } else {
      this.switchEntryMode('blank');
    }
    this.toast(isIphone ? '📱 已切換至 iPhone 實機模擬模式' : '💻 已切換至電腦全寬模式');
  },

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.saveState();
    this.renderAll();
    this.toast(`已切換至${this.state.theme === 'dark' ? '深色專業' : '淺色清爽'}主題`);
  },

  switchEntryMode(mode) {
    const isBlank = mode === 'blank';
    document.getElementById('segBtnBlank').classList.toggle('active', isBlank);
    document.getElementById('segBtnSmart').classList.toggle('active', !isBlank);
    document.getElementById('inlineBlankBar').style.display = isBlank ? 'grid' : 'none';
    document.getElementById('smartBarSection').style.display = isBlank ? 'none' : 'flex';
  },

  getTodayDateStr() {
    if (this.selectedCalendarDate) return this.selectedCalendarDate;
    return `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(Math.min(28, new Date().getDate())).padStart(2, '0')}`;
  },

  getFxRate(currency) {
    const rates = (this.state && this.state.fxRates) ? this.state.fxRates : DEFAULT_FX_RATES;
    return Number(rates[currency] || DEFAULT_FX_RATES[currency] || 1);
  },

  getDefaultDemoState() {
    const y = this.currentYear;
    const m = String(this.currentMonth).padStart(2, '0');
    const padDay = (d) => `${y}-${m}-${String(Math.min(28, Math.max(1, d))).padStart(2, '0')}`;

    return {
      theme: 'dark',
      streakDays: 14,
      excludeProjectFromBudget: true,
      fxRates: { ...DEFAULT_FX_RATES },
      customCategories: [],
      accounts: [
        { id: 'acc_cash', name: '隨身台幣現金', type: 'cash', balance: 6800, limit: 0 },
        { id: 'acc_jpy_cash', name: '日幣現鈔信封 (折合TWD)', type: 'cash', balance: 12900, limit: 0 },
        { id: 'acc_taishin', name: '台新 Richart 數位帳戶', type: 'bank', balance: 185400, limit: 0 },
        { id: 'acc_cathay', name: '國泰世華 CUBE 薪轉戶', type: 'bank', balance: 420000, limit: 0 },
        { id: 'acc_linepay', name: 'LINE Pay / Suica 交通卡', type: 'epay', balance: 4350, limit: 0 },
        { id: 'acc_etf', name: '元大台灣50 (0050) 證券戶', type: 'investment', balance: 860000, limit: 0 },
        { id: 'acc_ctbc_card', name: '中信 LINE Pay 信用卡', type: 'credit', balance: -18420, limit: 150000 },
        { id: 'acc_fubon_j', name: '富邦 J 卡 (旅日3%回饋)', type: 'credit', balance: -24680, limit: 180000 }
      ],
      budgets: {
        food: 12000,
        transport: 3500,
        shopping: 8000,
        home: 16000,
        entertainment: 5000,
        medical: 2500,
        education: 3000,
        other_exp: 2000
      },
      goals: [
        { id: 'g1', name: '六個月緊急預備金', icon: '🛡️', target: 300000, current: 245000 },
        { id: 'g2', name: '日本關西關東七日遊基金', icon: '🍁', target: 65000, current: 65000 },
        { id: 'g3', name: '升級 MacBook Pro M4', icon: '💻', target: 72900, current: 38000 }
      ],
      projects: [
        { id: 'proj_japan7', name: '🇯🇵 日本東京京都七天六夜自由行', budget: 65000 },
        { id: 'proj_home', name: '🛋️ 書房人體工學改造', budget: 35000 },
        { id: 'proj_ai', name: '🤖 AI 工程師年度進修計畫', budget: 15000 }
      ],
      subscriptions: [
        { id: 'sub_1', name: 'Netflix 4K 家庭方案', amount: 390, cycle: 'monthly', day: 5, accountId: 'acc_ctbc_card' },
        { id: 'sub_2', name: 'ChatGPT Plus 專業訂閱', amount: 650, cycle: 'monthly', day: 12, accountId: 'acc_ctbc_card' },
        { id: 'sub_3', name: 'Spotify Premium 雙人', amount: 198, cycle: 'monthly', day: 18, accountId: 'acc_ctbc_card' },
        { id: 'sub_4', name: 'World Gym 健身房月費', amount: 1088, cycle: 'monthly', day: 1, accountId: 'acc_ctbc_card' }
      ],
      transactions: [
        // 一般日常帳務
        { id: 'tx_1', type: 'income', amount: 68500, currency: 'TWD', twdAmount: 68500, category: 'salary', accountId: 'acc_cathay', date: padDay(1), note: '本月本薪與伙食津貼 #固定收入', projectId: '', invoice: '' },
        { id: 'tx_2', type: 'income', amount: 12400, currency: 'TWD', twdAmount: 12400, category: 'invest_inc', accountId: 'acc_etf', date: padDay(1), note: '0050 ETF 季配息入帳 #被動收入', projectId: '', invoice: '' },
        { id: 'tx_3', type: 'expense', amount: 12500, currency: 'TWD', twdAmount: 12500, category: 'home', accountId: 'acc_taishin', date: padDay(1), note: '公寓房租與管理費 #固定開銷', projectId: '', invoice: '' },
        { id: 'tx_4', type: 'expense', amount: 185, currency: 'TWD', twdAmount: 185, category: 'food', accountId: 'acc_linepay', date: padDay(1), note: '星巴克燕麥拿鐵 #咖啡', projectId: '', invoice: 'AB-38014925' },
        // 出國七天自由行 (Day 1 ~ Day 7) 實戰紀錄
        { id: 'tx_j1', type: 'expense', amount: 13800, currency: 'TWD', twdAmount: 13800, category: 'transport', accountId: 'acc_fubon_j', date: padDay(2), note: '[Day1 出發] 桃園飛關西來回機票與機場捷運 #機票 #日本七日遊', projectId: 'proj_japan7', invoice: 'EF-59283741' },
        { id: 'tx_j2', type: 'expense', amount: 58000, currency: 'JPY', twdAmount: 12470, category: 'home', accountId: 'acc_fubon_j', date: padDay(2), note: '[Day1 京都] 京都四條精品飯店 3晚住宿 (含1.5%手續費) #住宿', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j3', type: 'expense', amount: 2450, currency: 'JPY', twdAmount: 527, category: 'food', accountId: 'acc_jpy_cash', date: padDay(2), note: '[Day1 晚餐] 京都拉麵小路 濃厚豚骨拉麵+煎餃 #晚餐', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j4', type: 'expense', amount: 4200, currency: 'JPY', twdAmount: 903, category: 'food', accountId: 'acc_jpy_cash', date: padDay(3), note: '[Day2 清水寺] 嵐山豆腐料理與中村藤吉抹茶パフェ #美食', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j5', type: 'expense', amount: 13600, currency: 'JPY', twdAmount: 2924, category: 'food', accountId: 'acc_fubon_j', date: padDay(3), note: '[Day2 晚餐] 弘燒肉 京都市集和牛套餐 #燒肉 #聚餐', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j6', type: 'expense', amount: 18500, currency: 'JPY', twdAmount: 3978, category: 'entertainment', accountId: 'acc_fubon_j', date: padDay(4), note: '[Day3 大阪] 日本環球影城 USJ 門票+瑪利歐手環 #樂園', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j7', type: 'expense', amount: 14200, currency: 'JPY', twdAmount: 3053, category: 'transport', accountId: 'acc_fubon_j', date: padDay(5), note: '[Day4 移動] 東海道新幹線 Nozomi 京都➔東京車票+駅弁 #新幹線', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j8', type: 'expense', amount: 64000, currency: 'JPY', twdAmount: 13760, category: 'home', accountId: 'acc_fubon_j', date: padDay(5), note: '[Day4 東京] 新宿歌舞伎町景觀飯店 3晚住宿 #住宿', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j9', type: 'expense', amount: 22500, currency: 'JPY', twdAmount: 4838, category: 'medical', accountId: 'acc_fubon_j', date: padDay(6), note: '[Day5 採買] 澀谷大國藥妝合利他命與保養品 (已扣10%退稅) #藥妝 #代墊', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j10', type: 'income', amount: 2400, currency: 'TWD', twdAmount: 2400, category: 'side_hustle', accountId: 'acc_linepay', date: padDay(6), note: '[Day5 拆帳] 朋友 LINE Pay 歸還藥妝代墊款 #代墊收回', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j11', type: 'expense', amount: 9800, currency: 'JPY', twdAmount: 2107, category: 'entertainment', accountId: 'acc_jpy_cash', date: padDay(7), note: '[Day6 富士山] 河口湖纜車+天上山公園抹茶糰子 #景點', projectId: 'proj_japan7', invoice: '' },
        { id: 'tx_j12', type: 'expense', amount: 15800, currency: 'JPY', twdAmount: 3397, category: 'shopping', accountId: 'acc_fubon_j', date: padDay(8), note: '[Day7 返台] 成田機場免稅店 東京芭娜娜與清酒伴手禮 #伴手禮', projectId: 'proj_japan7', invoice: '' }
      ]
    };
  },

  getBlankCleanState() {
    return {
      theme: this.state ? this.state.theme : 'dark',
      streakDays: 1,
      excludeProjectFromBudget: true,
      fxRates: { ...DEFAULT_FX_RATES },
      customCategories: [],
      accounts: [
        { id: 'acc_cash', name: '現金錢包', type: 'cash', balance: 0, limit: 0 },
        { id: 'acc_bank', name: '主要銀行帳戶', type: 'bank', balance: 0, limit: 0 },
        { id: 'acc_card', name: '主力信用卡', type: 'credit', balance: 0, limit: 100000 }
      ],
      budgets: {
        food: 10000,
        transport: 3000,
        shopping: 5000,
        home: 10000,
        entertainment: 3000,
        medical: 2000,
        education: 2000,
        other_exp: 2000
      },
      goals: [],
      projects: [],
      subscriptions: [],
      transactions: []
    };
  },

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.state = JSON.parse(raw);
        if (!Array.isArray(this.state.customCategories)) this.state.customCategories = [];
        if (!this.state.fxRates) this.state.fxRates = { ...DEFAULT_FX_RATES };
        if (typeof this.state.excludeProjectFromBudget !== 'boolean') this.state.excludeProjectFromBudget = true;
      } else {
        this.state = this.getDefaultDemoState();
        this.saveState();
      }
    } catch (e) {
      this.state = this.getDefaultDemoState();
    }
    document.documentElement.setAttribute('data-theme', this.state.theme || 'dark');
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  },

  getAllCategoriesByType(type) {
    const base = CATEGORIES[type] || [];
    const custom = (this.state.customCategories || []).filter(c => c.type === type);
    return [...base, ...custom];
  },

  bindEvents() {
    document.querySelectorAll('#sidebarNav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.state.theme);
      this.saveState();
      this.renderAll();
      this.toast(`已切換至${this.state.theme === 'dark' ? '深色專業' : '淺色清爽'}主題`);
    });

    const smartInput = document.getElementById('smartInput');
    smartInput.addEventListener('input', () => this.updateSmartPreview());
    smartInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitSmartInput();
      }
    });

    ['inlineAmount', 'inlineNote', 'inlineCustomCat'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.submitInlineBlankRow();
          }
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.openTxModal('expense', true);
      }
    });
  },

  // ================= INLINE BLANK ROW CREATOR =================
  initInlineBlankBar() {
    document.getElementById('inlineDate').value = this.getTodayDateStr();
    this.syncInlineCategories();
  },

  toggleInlineBlankBar() {
    const bar = document.getElementById('inlineBlankBar');
    const isHidden = bar.style.display === 'none';
    bar.style.display = isHidden ? 'grid' : 'none';
  },

  syncInlineCategories() {
    const type = document.getElementById('inlineType').value || 'expense';
    const cats = this.getAllCategoriesByType(type);
    const sel = document.getElementById('inlineCategory');
    sel.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('') +
      `<option value="__custom__">➕ 自訂新分類...</option>`;
    document.getElementById('inlineCustomCat').style.display = 'none';
    document.getElementById('inlineCustomCat').value = '';
  },

  handleInlineCatChange() {
    const val = document.getElementById('inlineCategory').value;
    const customInput = document.getElementById('inlineCustomCat');
    if (val === '__custom__') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
    }
  },

  clearInlineBlankBar() {
    document.getElementById('inlineDate').value = this.getTodayDateStr();
    document.getElementById('inlineType').value = 'expense';
    document.getElementById('inlineCurrency').value = 'TWD';
    document.getElementById('inlineProject').value = '';
    this.syncInlineCategories();
    document.getElementById('inlineAmount').value = '';
    document.getElementById('inlineNote').value = '';
    document.getElementById('inlineCustomCat').value = '';
    document.getElementById('inlineAmount').focus();
    this.toast('🧹 已清空直填列欄位');
  },

  submitInlineBlankRow() {
    const date = document.getElementById('inlineDate').value || this.getTodayDateStr();
    const type = document.getElementById('inlineType').value || 'expense';
    let category = document.getElementById('inlineCategory').value;
    const customCatName = document.getElementById('inlineCustomCat').value.trim();
    const accountId = document.getElementById('inlineAccount').value;
    const rawAmount = document.getElementById('inlineAmount').value;
    const amount = this.evalMath(rawAmount);
    const currency = document.getElementById('inlineCurrency').value || 'TWD';
    const twdAmount = Math.round(amount * this.getFxRate(currency));
    const projectId = document.getElementById('inlineProject').value || '';
    const noteInput = document.getElementById('inlineNote').value.trim();

    if (amount <= 0) {
      this.toast('⚠️ 請輸入大於 0 的金額或算式');
      document.getElementById('inlineAmount').focus();
      return;
    }

    if (category === '__custom__') {
      if (!customCatName) {
        this.toast('⚠️ 請輸入自訂分類名稱');
        document.getElementById('inlineCustomCat').focus();
        return;
      }
      category = this.registerCustomCategory(type, customCatName);
    }

    const catMeta = this.getCategoryMeta(category);
    const newTx = {
      id: 'tx_' + Date.now(),
      type,
      amount,
      currency,
      twdAmount,
      category,
      accountId,
      toAccountId: '',
      date,
      note: noteInput || catMeta.name,
      projectId,
      invoice: ''
    };

    this.applyTxAccountBalance(newTx, 1);
    this.state.transactions.unshift(newTx);
    this.saveState();

    document.getElementById('inlineAmount').value = '';
    document.getElementById('inlineNote').value = '';
    document.getElementById('inlineCustomCat').value = '';
    document.getElementById('inlineCustomCat').style.display = 'none';

    this.renderAll();
    this.toast(`✅ 已新增：${catMeta.icon} ${newTx.note} (${this.formatCurrency(twdAmount)})`);
  },

  registerCustomCategory(type, name) {
    const newId = 'custom_' + Date.now();
    const newCat = {
      id: newId,
      type,
      name,
      icon: type === 'income' ? '🌟' : '🏷️',
      color: type === 'income' ? '#10b981' : '#ec4899',
      building: `${name}中心`,
      bEmoji: '🏛️',
      defaultBudget: 3000
    };
    if (!Array.isArray(this.state.customCategories)) {
      this.state.customCategories = [];
    }
    this.state.customCategories.push(newCat);
    if (type === 'expense') {
      this.state.budgets[newId] = 3000;
    }
    return newId;
  },

  switchTab(tabId) {
    document.querySelectorAll('#sidebarNav .nav-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-${tabId}`);
    });

    const titles = {
      dashboard: ['📊 全方位財務總覽儀表板', '多帳戶淨值整合、視覺圖表與零基預算追蹤'],
      ledger: ['📅 收支明細與互動日曆熱力圖', '支援單日熱力篩選、專案檢索、外幣折算與標籤管理'],
      accounts: ['🏦 多帳戶與資產負債中樞', '全資產淨值計算、外幣現鈔與信用卡待繳管理'],
      budgets: ['✉️ YNAB 零基信封預算 & 夢想儲蓄池', '分類預算水位控管與專案獨立核算'],
      projects: ['✈️ 專案獨立記帳 & 週期訂閱管家', '跨分類旅遊/裝潢預算分析與固定扣款追蹤'],
      invoices: ['🧾 台灣雲端發票載具 & 自動對獎中心', '載具發票歸檔與統一發票開獎號碼自動比對'],
      city: ['🏙️ 記帳城市養成與市民理財成就', '分類產業建築升級、市長等級 EXP 與成就圖鑑'],
      settings: ['⚙️ 帳本模式切換、多幣匯率與備份中心', '全新空白帳本、出國七日範例、自訂匯率與 CSV/JSON 備份']
    };
    if (titles[tabId]) {
      document.getElementById('pageTitle').textContent = titles[tabId][0];
      document.getElementById('pageSubtitle').textContent = titles[tabId][1];
    }
  },

  changeMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.selectedCalendarDate = null;
    this.renderAll();
  },

  evalMath(expr) {
    if (typeof expr === 'number') return expr;
    const cleaned = String(expr || '').replace(/[^0-9+\-*/.()]/g, '');
    if (!cleaned) return 0;
    try {
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${cleaned})`)();
      return Number.isFinite(val) ? Math.round(val * 100) / 100 : 0;
    } catch {
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  },

  formatCurrency(num) {
    const n = Math.round(Number(num) || 0);
    const sign = n < 0 ? '-' : '';
    return `${sign}$${Math.abs(n).toLocaleString('en-US')}`;
  },

  getCategoryMeta(catId) {
    for (const group of Object.values(CATEGORIES)) {
      const found = group.find(c => c.id === catId);
      if (found) return found;
    }
    if (Array.isArray(this.state.customCategories)) {
      const customFound = this.state.customCategories.find(c => c.id === catId);
      if (customFound) return customFound;
    }
    return { id: 'other_exp', name: '其他', icon: '📌', color: '#64748b', building: '市民中心', bEmoji: '🏤' };
  },

  getAccountById(accId) {
    return this.state.accounts.find(a => a.id === accId) || this.state.accounts[0] || { id: 'acc_cash', name: '預設現金', balance: 0 };
  },

  getMonthTransactions() {
    const prefix = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
    return this.state.transactions
      .filter(t => t.date && t.date.startsWith(prefix))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  // ================= SMART NATURAL LANGUAGE PARSER (支援外幣/日圓/美金/專案) =================
  parseSmartInput(rawText) {
    const text = (rawText || '').trim();
    if (!text) return null;

    // 1. Detect Currency (JPY, THB, USD, EUR, HKD, TWD)
    let currency = 'TWD';
    if (/JPY|日幣|日圓|円|yen/i.test(text)) currency = 'JPY';
    else if (/THB|泰銖|泰幣|銖|baht/i.test(text)) currency = 'THB';
    else if (/USD|美金|美元/i.test(text)) currency = 'USD';
    else if (/EUR|歐元/i.test(text)) currency = 'EUR';
    else if (/HKD|港幣/i.test(text)) currency = 'HKD';

    // 2. Extract math/amount token
    const mathMatch = text.match(/(\d+(?:[+\-*/]\d+)*(?:\.\d+)?)/);
    const amount = mathMatch ? this.evalMath(mathMatch[1]) : 0;
    const twdAmount = Math.round(amount * this.getFxRate(currency));

    // 3. Detect type & category by keywords
    let type = 'expense';
    let category = 'food';

    if (/薪水|薪資|本薪|獎金|年終|股息|配息|接案|外快|兼職|退稅入帳|代墊收回|歸還|收入/.test(text)) {
      type = 'income';
      if (/股息|配息|股票|ETF/i.test(text)) category = 'invest_inc';
      else if (/獎金|年終|紅包|退稅/.test(text)) category = 'bonus';
      else if (/接案|外快|兼職|代墊收回|歸還/.test(text)) category = 'side_hustle';
      else category = 'salary';
    } else if (/轉帳|繳卡費|換匯/.test(text)) {
      type = 'transfer';
      category = 'transfer';
    } else {
      if (/捷運|高鐵|公車|計程車|Uber|加油|停車|悠遊卡|TPASS|火車|機票|新幹線|Haruka|Suica|纜車/i.test(text)) category = 'transport';
      else if (/全聯|蝦皮|網購|衣服|鞋子|百貨|日用品|IKEA|momo|伴手禮|免稅店|唐吉訶德/i.test(text)) category = 'shopping';
      else if (/房租|水電|電費|水費|瓦斯|管理費|網路|電話費|家具|飯店|住宿|Hotel|Airbnb/i.test(text)) category = 'home';
      else if (/電影|Netflix|Spotify|遊戲|Steam|唱歌|門票|展覽|健身|環球影城|USJ|迪士尼|樂園/i.test(text)) category = 'entertainment';
      else if (/看診|掛號|醫院|診所|藥局|牙醫|保健|藥妝|合利他命/i.test(text)) category = 'medical';
      else if (/書|課程|學費|進修|考照|ChatGPT/i.test(text)) category = 'education';
      else category = 'food';
    }

    // 4. Detect account
    let account = this.state.accounts[0] || { id: 'acc_cash', name: '現金錢包' };
    if (currency === 'JPY') {
      const jpyAcc = this.state.accounts.find(a => a.name.includes('日幣') || a.name.includes('J 卡'));
      if (jpyAcc) account = jpyAcc;
    }
    for (const acc of this.state.accounts) {
      const shortKeywords = [acc.name];
      if (acc.name.includes('日幣')) shortKeywords.push('日幣現金', '日幣現鈔', '日幣');
      if (acc.name.includes('富邦')) shortKeywords.push('富邦J卡', '富邦', 'J卡');
      if (acc.name.includes('LINE')) shortKeywords.push('LINE Pay', 'linepay', 'Suica');
      if (acc.name.includes('中信')) shortKeywords.push('中信卡', '中信');
      if (acc.name.includes('台新')) shortKeywords.push('台新', 'Richart');
      if (acc.name.includes('國泰')) shortKeywords.push('國泰', 'CUBE');
      if (acc.name.includes('現金')) shortKeywords.push('現金');
      if (shortKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
        account = acc;
        break;
      }
    }

    // 5. Detect @project
    let project = null;
    const projMatch = text.match(/@([^\s#]+)/);
    if (projMatch) {
      const key = projMatch[1];
      project = this.state.projects.find(p => p.name.includes(key));
    }

    return {
      type,
      amount,
      currency,
      twdAmount,
      category,
      catMeta: this.getCategoryMeta(category),
      account,
      project,
      note: text
    };
  },

  updateSmartPreview() {
    const val = document.getElementById('smartInput').value;
    const previewEl = document.getElementById('smartPreview');
    const parsed = this.parseSmartInput(val);
    if (!parsed || !parsed.amount) {
      previewEl.innerHTML = '';
      return;
    }
    const badgeClass = parsed.type === 'income' ? 'badge-income' : 'badge-expense';
    const fxLabel = parsed.currency !== 'TWD' ? `${parsed.currency} ${parsed.amount} (≈${this.formatCurrency(parsed.twdAmount)})` : this.formatCurrency(parsed.twdAmount);
    previewEl.innerHTML = `
      <span class="${badgeClass}">${parsed.type === 'income' ? '收入' : '支出'} ${fxLabel}</span>
      <span class="tag">${parsed.catMeta.icon} ${parsed.catMeta.name}</span>
      <span class="tag">🏦 ${parsed.account.name}</span>
      ${parsed.project ? `<span class="tag">✈️ ${parsed.project.name}</span>` : ''}
    `;
  },

  submitSmartInput() {
    const input = document.getElementById('smartInput');
    const parsed = this.parseSmartInput(input.value);
    if (!parsed || parsed.amount <= 0) {
      this.toast('請輸入包含金額的描述，例如：一蘭拉麵 1280 JPY');
      input.focus();
      return;
    }

    const todayStr = this.getTodayDateStr();
    const newTx = {
      id: 'tx_' + Date.now(),
      type: parsed.type,
      amount: parsed.amount,
      currency: parsed.currency,
      twdAmount: parsed.twdAmount,
      category: parsed.category,
      accountId: parsed.account.id,
      date: todayStr,
      note: parsed.note,
      projectId: parsed.project ? parsed.project.id : '',
      invoice: ''
    };

    this.applyTxAccountBalance(newTx, 1);
    this.state.transactions.unshift(newTx);
    this.saveState();
    input.value = '';
    this.updateSmartPreview();
    this.renderAll();
    this.toast(`⚡ 已秒速入帳：${parsed.catMeta.icon} ${parsed.catMeta.name} ${this.formatCurrency(parsed.twdAmount)}`);
  },

  applyTxAccountBalance(tx, direction = 1) {
    const amt = Number(tx.twdAmount || tx.amount || 0) * direction;
    const acc = this.state.accounts.find(a => a.id === tx.accountId);
    if (!acc) return;

    if (tx.type === 'income') {
      acc.balance += amt;
    } else if (tx.type === 'expense') {
      acc.balance -= amt;
    } else if (tx.type === 'transfer') {
      acc.balance -= amt;
      const toAcc = this.state.accounts.find(a => a.id === tx.toAccountId);
      if (toAcc) toAcc.balance += amt;
    }
  },

  // ================= RENDER ALL SECTIONS =================
  renderAll() {
    document.getElementById('currentMonthLabel').textContent = `${this.currentYear} 年 ${String(this.currentMonth).padStart(2, '0')} 月`;
    document.getElementById('navTxCount').textContent = this.getMonthTransactions().length;
    document.getElementById('sidebarStreak').textContent = `${this.state.streakDays || 1} 天`;

    const chk = document.getElementById('excludeProjectFromBudgetChk');
    if (chk) chk.checked = Boolean(this.state.excludeProjectFromBudget);

    this.populateSelects();
    this.renderDashboard();
    this.renderCalendarAndLedger();
    this.renderAccounts();
    this.renderBudgetsAndGoals();
    this.renderProjectsAndSubscriptions();
    this.renderInvoices();
    this.renderFortuneCity();
    this.renderFxRatesSettings();
  },

  populateSelects() {
    // Filter Category Select
    const filterCat = document.getElementById('filterCategory');
    const prevCatVal = filterCat.value || 'all';
    const allCats = [
      ...this.getAllCategoriesByType('expense'),
      ...this.getAllCategoriesByType('income'),
      ...CATEGORIES.transfer
    ];
    filterCat.innerHTML = `<option value="all">所有分類</option>` +
      allCats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    filterCat.value = prevCatVal;

    // Filter Account Select
    const filterAcc = document.getElementById('filterAccount');
    const prevAccVal = filterAcc.value || 'all';
    filterAcc.innerHTML = `<option value="all">所有帳戶</option>` +
      this.state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    filterAcc.value = prevAccVal;

    // Filter Project Select
    const filterProj = document.getElementById('filterProject');
    if (filterProj) {
      const prevProjVal = filterProj.value || 'all';
      filterProj.innerHTML = `<option value="all">所有專案</option><option value="__none__">一般日常 (無專案)</option>` +
        this.state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      filterProj.value = prevProjVal;
    }

    // Modal & Inline Account Selects
    const accOptions = this.state.accounts.map(a => `<option value="${a.id}">${a.name} (${this.formatCurrency(a.balance)})</option>`).join('');
    document.getElementById('txAccount').innerHTML = accOptions + `<option value="__custom_acc__">➕ 自訂全新帳戶...</option>`;
    document.getElementById('txToAccount').innerHTML = accOptions;
    document.getElementById('subAccount').innerHTML = accOptions;
    document.getElementById('inlineAccount').innerHTML = this.state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

    // Modal & Inline Project Selects
    const projOptions = `<option value="">一般日常 (無專案)</option>` +
      this.state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    document.getElementById('txProject').innerHTML = projOptions;
    document.getElementById('inlineProject').innerHTML = projOptions;

    this.updateTxFormCategoryOptions();
    this.syncInlineCategories();
  },

  updateTxFormCategoryOptions() {
    const list = this.getAllCategoriesByType(this.currentTxType);
    const customOpt = this.currentTxType !== 'transfer' ? `<option value="__custom_cat__">➕ 自訂全新分類...</option>` : '';
    document.getElementById('txCategory').innerHTML = list
      .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
      .join('') + customOpt;
    document.getElementById('txCustomCategory').style.display = 'none';
  },

  handleModalCatChange() {
    const val = document.getElementById('txCategory').value;
    const customEl = document.getElementById('txCustomCategory');
    if (val === '__custom_cat__') {
      customEl.style.display = 'block';
      customEl.focus();
    } else {
      customEl.style.display = 'none';
    }
  },

  handleModalAccChange() {
    const val = document.getElementById('txAccount').value;
    const customEl = document.getElementById('txCustomAccount');
    if (val === '__custom_acc__') {
      customEl.style.display = 'block';
      customEl.focus();
    } else {
      customEl.style.display = 'none';
    }
  },

  // ================= 1. DASHBOARD RENDERING =================
  renderDashboard() {
    const monthTxs = this.getMonthTransactions();
    let monthIncome = 0;
    let monthExpense = 0;
    let budgetTrackedExpense = 0;
    const catTotals = {};
    const budgetCatTotals = {};

    monthTxs.forEach(t => {
      const val = Number(t.twdAmount || t.amount || 0);
      if (t.type === 'income') monthIncome += val;
      if (t.type === 'expense') {
        monthExpense += val;
        catTotals[t.category] = (catTotals[t.category] || 0) + val;

        if (!this.state.excludeProjectFromBudget || !t.projectId) {
          budgetTrackedExpense += val;
          budgetCatTotals[t.category] = (budgetCatTotals[t.category] || 0) + val;
        }
      }
    });

    let totalAssets = 0;
    let totalLiabilities = 0;
    this.state.accounts.forEach(a => {
      if (a.balance >= 0) totalAssets += a.balance;
      else totalLiabilities += Math.abs(a.balance);
    });
    const netWorth = totalAssets - totalLiabilities;

    const totalBudget = Object.values(this.state.budgets).reduce((s, v) => s + Number(v || 0), 0);
    const budgetRatio = totalBudget > 0 ? Math.round((budgetTrackedExpense / totalBudget) * 100) : 0;

    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const todayDate = new Date().getDate();
    const remainingDays = Math.max(1, daysInMonth - todayDate + 1);
    const remainingBudget = Math.max(0, totalBudget - budgetTrackedExpense);
    const safeDaily = Math.round(remainingBudget / remainingDays);

    const monthBalance = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? Math.round((monthBalance / monthIncome) * 100) : 0;

    document.getElementById('kpiNetWorth').textContent = this.formatCurrency(netWorth);
    document.getElementById('kpiNetWorthSub').innerHTML = `總資產 <strong class="font-mono-num" style="color:var(--color-income)">${this.formatCurrency(totalAssets)}</strong> ｜ 總負債 <strong class="font-mono-num" style="color:var(--color-expense)">${this.formatCurrency(totalLiabilities)}</strong>`;

    document.getElementById('kpiMonthExpense').textContent = this.formatCurrency(monthExpense);
    document.getElementById('kpiExpenseRatio').textContent = `日常預算已用 ${budgetRatio}%`;
    document.getElementById('kpiMonthIncomeSub').innerHTML = `本月總收入：<strong class="font-mono-num" style="color: var(--color-income);">${this.formatCurrency(monthIncome)}</strong>`;

    document.getElementById('kpiSafeDaily').textContent = this.formatCurrency(safeDaily);
    document.getElementById('kpiSafeDailySub').textContent = `日常剩餘預算 ${this.formatCurrency(remainingBudget)} ÷ 剩餘 ${remainingDays} 天`;

    document.getElementById('kpiMonthBalance').textContent = this.formatCurrency(monthBalance);
    document.getElementById('kpiMonthBalance').style.color = monthBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)';
    document.getElementById('kpiSavingsRate').textContent = `儲蓄率 ${savingsRate}%`;

    this.renderTrendChart(monthTxs, daysInMonth);
    this.renderCategoryChart(catTotals, monthExpense);
    this.renderDashboardRecentTx(monthTxs.slice(0, 6));
    this.renderDashboardBudgets(budgetCatTotals);
  },

  renderTrendChart(monthTxs, daysInMonth) {
    const container = document.getElementById('trendChartContainer');
    const dailyExp = new Array(daysInMonth).fill(0);
    const dailyInc = new Array(daysInMonth).fill(0);

    monthTxs.forEach(t => {
      const day = parseInt((t.date || '').split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        if (t.type === 'expense') dailyExp[day - 1] += Number(t.twdAmount || t.amount || 0);
        if (t.type === 'income') dailyInc[day - 1] += Number(t.twdAmount || t.amount || 0);
      }
    });

    const maxVal = Math.max(5000, ...dailyExp, ...dailyInc);
    const w = 640;
    const h = 210;
    const padL = 48;
    const padR = 16;
    const padT = 18;
    const padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const barW = Math.max(6, Math.floor(chartW / daysInMonth) - 5);

    let barsSvg = '';
    let cumPoints = [];
    let cumSum = 0;
    const totalExp = Math.max(1, dailyExp.reduce((a, b) => a + b, 0));

    for (let i = 0; i < daysInMonth; i++) {
      const x = padL + (i / daysInMonth) * chartW + 4;
      const expH = (dailyExp[i] / maxVal) * chartH;
      const yExp = padT + chartH - expH;
      cumSum += dailyExp[i];
      const cumY = padT + chartH - (cumSum / totalExp) * (chartH * 0.88);
      cumPoints.push(`${x + barW / 2},${cumY.toFixed(1)}`);

      if (dailyExp[i] > 0) {
        barsSvg += `<rect x="${x.toFixed(1)}" y="${yExp.toFixed(1)}" width="${barW}" height="${Math.max(3, expH).toFixed(1)}" rx="3" fill="#f43f5e" opacity="0.85">
          <title>${i + 1}日 支出：${this.formatCurrency(dailyExp[i])}</title>
        </rect>`;
      }
      if ((i + 1) % 5 === 0 || i === 0 || i === daysInMonth - 1) {
        barsSvg += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 6}" font-size="10" fill="var(--text-secondary)" text-anchor="middle">${i + 1}日</text>`;
      }
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width: 100%; height: 100%; overflow: visible;">
        <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="var(--border-color)" stroke-dasharray="3,3" />
        <line x1="${padL}" y1="${padT + chartH / 2}" x2="${w - padR}" y2="${padT + chartH / 2}" stroke="var(--border-color)" stroke-dasharray="3,3" />
        <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border-color)" />
        <text x="${padL - 6}" y="${padT + 4}" font-size="10" fill="var(--text-secondary)" text-anchor="end">${this.formatCurrency(maxVal)}</text>
        <text x="${padL - 6}" y="${padT + chartH / 2 + 4}" font-size="10" fill="var(--text-secondary)" text-anchor="end">${this.formatCurrency(maxVal / 2)}</text>
        <text x="${padL - 6}" y="${padT + chartH}" font-size="10" fill="var(--text-secondary)" text-anchor="end">$0</text>
        ${barsSvg}
        <polyline fill="none" stroke="#818cf8" stroke-width="2.5" points="${cumPoints.join(' ')}" />
      </svg>
    `;
  },

  renderCategoryChart(catTotals, totalExpense) {
    const container = document.getElementById('categoryChartContainer');
    const entries = Object.entries(catTotals)
      .map(([catId, amount]) => ({ meta: this.getCategoryMeta(catId), amount }))
      .sort((a, b) => b.amount - a.amount);

    if (entries.length === 0 || totalExpense <= 0) {
      container.innerHTML = `
        <div style="color: var(--text-secondary); padding: 1.5rem 0; display: flex; flex-direction: column; gap: 0.6rem; align-items: flex-start;">
          <span>本月尚無支出紀錄</span>
          <button class="btn btn-primary btn-sm" onclick="App.openTxModal('expense', true)">➕ 新增空白記帳</button>
        </div>
      `;
      return;
    }

    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const circles = entries.map(item => {
      const ratio = item.amount / totalExpense;
      const strokeLen = ratio * circumference;
      const seg = `<circle cx="85" cy="85" r="${radius}" fill="transparent" stroke="${item.meta.color}" stroke-width="22"
        stroke-dasharray="${strokeLen.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}" />`;
      offset += strokeLen;
      return seg;
    }).join('');

    const legendHtml = entries.map(item => {
      const pct = Math.round((item.amount / totalExpense) * 100);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.35rem 0.5rem; border-radius: 8px; cursor: pointer;"
             onclick="App.filterByCategoryFromChart('${item.meta.id}')">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${item.meta.color}; display: inline-block;"></span>
            <span style="font-size: 0.85rem; font-weight: 600;">${item.meta.icon} ${item.meta.name}</span>
          </div>
          <div class="font-mono-num" style="font-size: 0.84rem;">
            <strong>${this.formatCurrency(item.amount)}</strong>
            <span style="color: var(--text-secondary); margin-left: 0.35rem;">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="position: relative; width: 170px; height: 170px; flex-shrink: 0; margin: 0 auto;">
        <svg viewBox="0 0 170 170" style="transform: rotate(-90deg); width: 170px; height: 170px;">
          ${circles}
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-secondary);">總支出</span>
          <strong class="font-mono-num" style="font-size: 0.98rem;">${this.formatCurrency(totalExpense)}</strong>
        </div>
      </div>
      <div style="flex: 1; min-width: 210px;">
        ${legendHtml}
      </div>
    `;
  },

  filterByCategoryFromChart(catId) {
    document.getElementById('filterCategory').value = catId;
    this.switchTab('ledger');
    this.renderLedger();
  },

  renderDashboardRecentTx(txList) {
    const el = document.getElementById('dashboardRecentTx');
    if (!txList.length) {
      el.innerHTML = `
        <div style="color: var(--text-secondary); padding: 1.5rem 0; text-align: center;">
          <div style="margin-bottom: 0.6rem;">尚無收支紀錄</div>
          <button class="btn btn-primary btn-sm" onclick="App.openTxModal('expense', true)">➕ 新增空白紀錄</button>
        </div>
      `;
      return;
    }
    el.innerHTML = txList.map(t => this.buildTxRowHtml(t, true)).join('');
  },

  renderDashboardBudgets(catTotals) {
    const el = document.getElementById('dashboardBudgetOverview');
    const expCats = this.getAllCategoriesByType('expense').slice(0, 5);
    const items = expCats.map(cat => {
      const budget = Number(this.state.budgets[cat.id] || cat.defaultBudget || 5000);
      const spent = Number(catTotals[cat.id] || 0);
      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      const barColor = pct >= 95 ? '#f43f5e' : pct >= 75 ? '#f59e0b' : '#10b981';

      return `
        <div style="margin-bottom: 0.8rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.83rem; margin-bottom: 0.25rem;">
            <span style="font-weight: 600;">${cat.icon} ${cat.name}</span>
            <span class="font-mono-num">${this.formatCurrency(spent)} / <span style="color: var(--text-secondary);">${this.formatCurrency(budget)} (${pct}%)</span></span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%; background: ${barColor};"></div>
          </div>
        </div>
      `;
    });
    el.innerHTML = items.join('');
  },

  buildTxRowHtml(t, allowActions = true) {
    const cat = this.getCategoryMeta(t.category);
    const acc = this.getAccountById(t.accountId);
    const proj = t.projectId ? this.state.projects.find(p => p.id === t.projectId) : null;
    const isInc = t.type === 'income';
    const isTrans = t.type === 'transfer';
    const sign = isInc ? '+' : isTrans ? '⇄' : '-';
    const amtColor = isInc ? 'var(--color-income)' : isTrans ? 'var(--color-transfer)' : 'var(--color-expense)';

    const formattedNote = (t.note || cat.name).replace(/#([^\s#]+)/g, '<span class="tag">#$1</span>');

    return `
      <div class="tx-row">
        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
          <div class="cat-icon" style="background: ${cat.color}22; color: ${cat.color};">${cat.icon}</div>
          <div style="min-width: 0;">
            <div style="font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${formattedNote}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-top: 0.15rem;">
              <span class="font-mono-num">📅 ${t.date}</span>
              <span>• 🏦 ${acc.name}</span>
              ${proj ? `<span class="tag">✈️ ${proj.name}</span>` : ''}
              ${t.invoice ? `<span class="tag font-mono-num">🧾 ${t.invoice}</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
          <div style="text-align: right; margin-right: 0.25rem;">
            <div class="font-mono-num" style="font-weight: 700; font-size: 0.98rem; color: ${amtColor};">
              ${sign}${this.formatCurrency(t.twdAmount || t.amount)}
            </div>
            ${t.currency && t.currency !== 'TWD' ? `<div class="font-mono-num" style="font-size: 0.72rem; color: #38bdf8;">${t.currency} ${Number(t.amount).toLocaleString()}</div>` : ''}
          </div>
          ${allowActions ? `
            <button class="btn btn-ghost btn-sm" onclick="App.editTransaction('${t.id}')">✏️</button>
            <button class="btn btn-ghost btn-sm" onclick="App.deleteTransaction('${t.id}')">🗑️</button>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ================= 2. CALENDAR HEATMAP & LEDGER =================
  renderCalendarAndLedger() {
    this.renderCalendarHeatmap();
    this.renderLedger();
  },

  renderCalendarHeatmap() {
    const grid = document.getElementById('calendarHeatmapGrid');
    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const firstDayWeek = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
    const monthTxs = this.getMonthTransactions();

    const dayTotals = {};
    monthTxs.forEach(t => {
      if (!dayTotals[t.date]) dayTotals[t.date] = { exp: 0, inc: 0, count: 0 };
      dayTotals[t.date].count++;
      if (t.type === 'expense') dayTotals[t.date].exp += Number(t.twdAmount || t.amount || 0);
      if (t.type === 'income') dayTotals[t.date].inc += Number(t.twdAmount || t.amount || 0);
    });

    let html = '';
    for (let i = 0; i < firstDayWeek; i++) {
      html += `<div style="visibility: hidden;"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const info = dayTotals[dateStr] || { exp: 0, inc: 0, count: 0 };
      let heatClass = '';
      if (info.exp > 5000) heatClass = 'cal-heat-4';
      else if (info.exp > 1500) heatClass = 'cal-heat-3';
      else if (info.exp > 400) heatClass = 'cal-heat-2';
      else if (info.exp > 0 || info.inc > 0) heatClass = 'cal-heat-1';

      const isSelected = this.selectedCalendarDate === dateStr ? 'selected' : '';
      html += `
        <div class="cal-day ${heatClass} ${isSelected}" onclick="App.selectCalendarDate('${dateStr}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="font-mono-num" style="font-size: 0.78rem; font-weight: 700;">${d}</span>
            ${info.count > 0 ? `<span style="font-size: 0.62rem; color: var(--text-secondary);">${info.count}筆</span>` : ''}
          </div>
          <div style="font-size: 0.68rem; text-align: right; line-height: 1.25;">
            ${info.inc > 0 ? `<div class="font-mono-num" style="color: var(--color-income);">+${Math.round(info.inc)}</div>` : ''}
            ${info.exp > 0 ? `<div class="font-mono-num" style="color: var(--color-expense);">-${Math.round(info.exp)}</div>` : ''}
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;
    document.getElementById('clearDateFilterBtn').style.display = this.selectedCalendarDate ? 'inline-flex' : 'none';
  },

  selectCalendarDate(dateStr) {
    this.selectedCalendarDate = (this.selectedCalendarDate === dateStr) ? null : dateStr;
    if (this.selectedCalendarDate) {
      document.getElementById('inlineDate').value = this.selectedCalendarDate;
    }
    this.renderCalendarAndLedger();
  },

  renderLedger() {
    const keyword = (document.getElementById('filterKeyword').value || '').trim().toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const catFilter = document.getElementById('filterCategory').value;
    const accFilter = document.getElementById('filterAccount').value;
    const projFilterEl = document.getElementById('filterProject');
    const projFilter = projFilterEl ? projFilterEl.value : 'all';

    const filtered = this.getMonthTransactions().filter(t => {
      if (this.selectedCalendarDate && t.date !== this.selectedCalendarDate) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (catFilter !== 'all' && t.category !== catFilter) return false;
      if (accFilter !== 'all' && t.accountId !== accFilter) return false;
      if (projFilter !== 'all') {
        if (projFilter === '__none__' && t.projectId) return false;
        if (projFilter !== '__none__' && t.projectId !== projFilter) return false;
      }
      if (keyword) {
        const hay = `${t.note || ''} ${t.invoice || ''} ${t.currency || ''} ${this.getCategoryMeta(t.category).name}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
    document.getElementById('filteredSummaryBadge').textContent =
      `${this.selectedCalendarDate ? `📅 ${this.selectedCalendarDate} ｜ ` : ''}共 ${filtered.length} 筆 ｜ 支出合計 ${this.formatCurrency(totalExp)}`;

    const container = document.getElementById('ledgerListContainer');
    if (!filtered.length) {
      container.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-secondary);">
          <div style="margin-bottom: 0.6rem;">無符合條件的帳務紀錄</div>
          <button class="btn btn-primary btn-sm" onclick="App.openTxModal('expense', true)">➕ 新增空白紀錄</button>
        </div>
      `;
      return;
    }
    container.innerHTML = filtered.map(t => this.buildTxRowHtml(t, true)).join('');
  },

  editTransaction(id) {
    const tx = this.state.transactions.find(t => t.id === id);
    if (!tx) return;
    this.setTxFormType(tx.type);
    document.getElementById('txModalTitle').textContent = '✏️ 編輯修改收支紀錄';
    document.getElementById('txId').value = tx.id;
    document.getElementById('txAmount').value = tx.amount;
    document.getElementById('txCurrency').value = tx.currency || 'TWD';
    document.getElementById('txCategory').value = tx.category;
    document.getElementById('txAccount').value = tx.accountId;
    if (tx.toAccountId) document.getElementById('txToAccount').value = tx.toAccountId;
    document.getElementById('txDate').value = tx.date;
    document.getElementById('txProject').value = tx.projectId || '';
    document.getElementById('txNote').value = tx.note || '';
    document.getElementById('txInvoice').value = tx.invoice || '';
    this.previewCalcAmount();
    document.getElementById('txModal').classList.add('open');
  },

  deleteTransaction(id) {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx === -1) return;
    const tx = this.state.transactions[idx];
    this.applyTxAccountBalance(tx, -1);
    this.state.transactions.splice(idx, 1);
    this.saveState();
    this.renderAll();
    this.toast('🗑️ 已刪除該筆帳務並同步回補帳戶餘額');
  },

  // ================= 3. MULTI-ACCOUNTS & NET WORTH =================
  renderAccounts() {
    let assets = 0;
    let liabilities = 0;
    this.state.accounts.forEach(a => {
      if (a.balance >= 0) assets += a.balance;
      else liabilities += Math.abs(a.balance);
    });
    const netWorth = assets - liabilities;
    const debtRatio = assets > 0 ? Math.round((liabilities / assets) * 100) : 0;

    document.getElementById('accountsOverviewBar').innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
        <div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">🏛️ 淨資產總額 (Net Worth)</div>
          <div class="font-mono-num" style="font-size: 1.5rem; font-weight: 800; color: #818cf8;">${this.formatCurrency(netWorth)}</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">🟢 總資產 (現金/外幣/存款/投資)</div>
          <div class="font-mono-num" style="font-size: 1.35rem; font-weight: 700; color: var(--color-income);">${this.formatCurrency(assets)}</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">🔴 總負債 (信用卡待繳/貸款)</div>
          <div class="font-mono-num" style="font-size: 1.35rem; font-weight: 700; color: var(--color-expense);">${this.formatCurrency(liabilities)}</div>
        </div>
        <div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">⚖️ 資產負債比</div>
          <div class="font-mono-num" style="font-size: 1.35rem; font-weight: 700; color: ${debtRatio < 30 ? 'var(--color-income)' : 'var(--color-warning)'};">${debtRatio}%</div>
        </div>
      </div>
    `;

    const typeMeta = {
      cash: { icon: '💵', label: '現金 / 外幣現鈔' },
      bank: { icon: '🏦', label: '銀行存款' },
      epay: { icon: '📱', label: '電子支付 / 交通卡' },
      investment: { icon: '📈', label: '證券投資部位' },
      credit: { icon: '💳', label: '信用卡帳單' },
      loan: { icon: '🏠', label: '貸款負債' }
    };

    document.getElementById('accountsGrid').innerHTML = this.state.accounts.map(acc => {
      const m = typeMeta[acc.type] || { icon: '🏦', label: '一般帳戶' };
      const isCredit = acc.type === 'credit' || acc.balance < 0;
      const usedAmt = Math.abs(Math.min(0, acc.balance));
      const limitPct = acc.limit > 0 ? Math.min(100, Math.round((usedAmt / acc.limit) * 100)) : 0;

      return `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="cat-icon" style="background: rgba(99, 102, 241, 0.14);">${m.icon}</div>
              <div>
                <div style="font-weight: 700; font-size: 0.96rem;">${acc.name}</div>
                <span class="tag">${m.label}</span>
              </div>
            </div>
            <div style="display: flex; gap: 0.25rem;">
              ${acc.balance < 0 ? `
                <button class="btn btn-secondary btn-sm" onclick="App.quickPayCreditCard('${acc.id}')">⚡ 繳清</button>
              ` : ''}
              <button class="btn btn-ghost btn-sm" onclick="App.promptAdjustAccountBalance('${acc.id}')">✏️</button>
              <button class="btn btn-ghost btn-sm" onclick="App.deleteAccount('${acc.id}')">🗑️</button>
            </div>
          </div>

          <div class="font-mono-num" style="font-size: 1.45rem; font-weight: 800; color: ${isCredit ? 'var(--color-expense)' : 'var(--text-primary)'}; margin: 0.5rem 0;">
            ${this.formatCurrency(acc.balance)}
          </div>

          ${acc.limit > 0 ? `
            <div style="font-size: 0.76rem; color: var(--text-secondary); margin-bottom: 0.3rem; display: flex; justify-content: space-between;">
              <span>信用額度使用率 (${limitPct}%)</span>
              <span class="font-mono-num">額度 ${this.formatCurrency(acc.limit)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${limitPct}%; background: ${limitPct > 70 ? '#f43f5e' : '#38bdf8'};"></div>
            </div>
          ` : `<div style="font-size: 0.75rem; color: var(--text-secondary);">即時連動收支與轉帳</div>`}
        </div>
      `;
    }).join('');
  },

  promptAdjustAccountBalance(accId) {
    const acc = this.state.accounts.find(a => a.id === accId);
    if (!acc) return;
    const input = prompt(`請輸入【${acc.name}】目前的實際餘額 ($)：`, acc.balance);
    if (input === null) return;
    const val = Number(input);
    if (!Number.isFinite(val)) return;
    acc.balance = val;
    this.saveState();
    this.renderAll();
    this.toast(`🏦 已更新【${acc.name}】餘額為 ${this.formatCurrency(val)}`);
  },

  deleteAccount(accId) {
    if (this.state.accounts.length <= 1) {
      this.toast('⚠️ 至少需保留一個預設帳戶');
      return;
    }
    const acc = this.state.accounts.find(a => a.id === accId);
    if (!acc || !confirm(`確定要刪除帳戶【${acc.name}】嗎？`)) return;
    this.state.accounts = this.state.accounts.filter(a => a.id !== accId);
    this.saveState();
    this.renderAll();
    this.toast(`🗑️ 已刪除帳戶【${acc.name}】`);
  },

  quickPayCreditCard(creditAccId) {
    const creditAcc = this.state.accounts.find(a => a.id === creditAccId);
    const bankAcc = this.state.accounts.find(a => a.type === 'bank' && a.balance > Math.abs(creditAcc.balance)) || this.state.accounts[0];
    if (!creditAcc || creditAcc.balance >= 0) return;

    const billAmt = Math.abs(creditAcc.balance);
    const todayStr = this.getTodayDateStr();
    const tx = {
      id: 'tx_' + Date.now(),
      type: 'transfer',
      amount: billAmt,
      currency: 'TWD',
      twdAmount: billAmt,
      category: 'transfer',
      accountId: bankAcc.id,
      toAccountId: creditAcc.id,
      date: todayStr,
      note: `結清 ${creditAcc.name} 本期帳單 #繳卡費`,
      projectId: '',
      invoice: ''
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`✅ 已從【${bankAcc.name}】轉帳 ${this.formatCurrency(billAmt)} 繳清【${creditAcc.name}】`);
  },

  // ================= 4. YNAB ENVELOPE BUDGETS & GOALS =================
  toggleExcludeProjectBudget(checked) {
    this.state.excludeProjectFromBudget = Boolean(checked);
    this.saveState();
    this.renderAll();
    this.toast(checked ? '✈️ 已將專案/出國支出獨立於日常月預算之外' : '📊 已將專案/出國支出併入日常月預算計算');
  },

  renderBudgetsAndGoals() {
    const monthTxs = this.getMonthTransactions();
    const catSpent = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      if (this.state.excludeProjectFromBudget && t.projectId) return;
      catSpent[t.category] = (catSpent[t.category] || 0) + Number(t.twdAmount || t.amount || 0);
    });

    const expCats = this.getAllCategoriesByType('expense');
    const totalBudget = expCats.reduce((s, c) => s + Number(this.state.budgets[c.id] || c.defaultBudget || 0), 0);
    const totalSpent = Object.values(catSpent).reduce((s, v) => s + v, 0);
    const totalRemain = totalBudget - totalSpent;

    document.getElementById('ynabTotalPoolBanner').innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.9rem 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">本月信封總預算池</div>
          <div class="font-mono-num" style="font-size: 1.25rem; font-weight: 800;">${this.formatCurrency(totalBudget)}</div>
        </div>
        <div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">已動用資金 ${this.state.excludeProjectFromBudget ? '(不含專案)' : '(含專案)'}</div>
          <div class="font-mono-num" style="font-size: 1.25rem; font-weight: 700; color: var(--color-expense);">${this.formatCurrency(totalSpent)}</div>
        </div>
        <div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">信封剩餘可用</div>
          <div class="font-mono-num" style="font-size: 1.25rem; font-weight: 700; color: ${totalRemain >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">${this.formatCurrency(totalRemain)}</div>
        </div>
      </div>
    `;

    document.getElementById('ynabEnvelopesList').innerHTML = expCats.map(cat => {
      const budget = Number(this.state.budgets[cat.id] || cat.defaultBudget || 3000);
      const spent = Number(catSpent[cat.id] || 0);
      const remain = budget - spent;
      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      const statusColor = remain < 0 ? '#f43f5e' : pct > 80 ? '#f59e0b' : '#10b981';

      return `
        <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.3rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.15rem;">${cat.icon}</span>
              <strong style="font-size: 0.9rem;">${cat.name}</strong>
              <span class="tag" style="cursor: pointer;" onclick="App.promptEditBudget('${cat.id}', '${cat.name}', ${budget})">✏️ 改上限</span>
            </div>
            <div class="font-mono-num" style="font-size: 0.85rem;">
              已花 <strong>${this.formatCurrency(spent)}</strong> / 預算 ${this.formatCurrency(budget)}
              <span style="margin-left: 0.4rem; color: ${statusColor}; font-weight: 700;">
                (${remain >= 0 ? `剩 ${this.formatCurrency(remain)}` : `超支 ${this.formatCurrency(Math.abs(remain))}`})
              </span>
            </div>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%; background: ${statusColor};"></div>
          </div>
        </div>
      `;
    }).join('');

    const goalsEl = document.getElementById('savingsGoalsList');
    if (!this.state.goals.length) {
      goalsEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.5rem; text-align: center;">尚無儲蓄目標</div>`;
      return;
    }

    goalsEl.innerHTML = this.state.goals.map(g => {
      const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
      return `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.55rem;">
              <span style="font-size: 1.4rem;">${g.icon || '🎯'}</span>
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">${g.name}</div>
                <div class="font-mono-num" style="font-size: 0.78rem; color: var(--text-secondary);">
                  已存 ${this.formatCurrency(g.current)} / 目標 ${this.formatCurrency(g.target)} (${pct}%)
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.3rem;">
              <button class="btn btn-secondary btn-sm" onclick="App.contributeToGoal('${g.id}')">💰 +$5,000</button>
              <button class="btn btn-ghost btn-sm" onclick="App.deleteGoal('${g.id}')">🗑️</button>
            </div>
          </div>
          <div class="progress-track" style="height: 10px;">
            <div class="progress-fill" style="width: ${pct}%; background: var(--accent-gradient);"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  promptEditBudget(catId, catName, currentVal) {
    const input = prompt(`請輸入【${catName}】的每月信封預算上限 ($)：`, currentVal);
    if (input === null) return;
    const val = Math.max(0, Number(input) || 0);
    this.state.budgets[catId] = val;
    this.saveState();
    this.renderAll();
    this.toast(`✉️ 已更新【${catName}】信封預算為 ${this.formatCurrency(val)}`);
  },

  autoBalanceBudgets() {
    const monthTxs = this.getMonthTransactions();
    this.getAllCategoriesByType('expense').forEach(cat => {
      const spent = monthTxs
        .filter(t => t.type === 'expense' && t.category === cat.id && (!this.state.excludeProjectFromBudget || !t.projectId))
        .reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
      this.state.budgets[cat.id] = Math.max(cat.defaultBudget || 3000, Math.ceil((spent * 1.2) / 500) * 500);
    });
    this.saveState();
    this.renderAll();
    this.toast('✨ 已完成 YNAB 智慧信封配置');
  },

  contributeToGoal(goalId) {
    const g = this.state.goals.find(x => x.id === goalId);
    if (!g) return;
    g.current = Math.min(g.target, g.current + 5000);
    this.saveState();
    this.renderAll();
    this.toast(`🎉 已為【${g.name}】提撥 $5,000`);
  },

  deleteGoal(goalId) {
    this.state.goals = this.state.goals.filter(g => g.id !== goalId);
    this.saveState();
    this.renderAll();
    this.toast('🗑️ 已移除儲蓄目標');
  },

  // ================= 5. PROJECTS & SUBSCRIPTIONS (MOZE 出國七天深度分析) =================
  renderProjectsAndSubscriptions() {
    const projEl = document.getElementById('projectsListContainer');
    if (!this.state.projects.length) {
      projEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.5rem; text-align: center;">尚無專案，可點右上角「＋ 新增空白專案」或「🧳 載入出國七天範例」</div>`;
    } else {
      projEl.innerHTML = this.state.projects.map(p => {
        const projTxs = this.state.transactions.filter(t => t.projectId === p.id);
        const expTxs = projTxs.filter(t => t.type === 'expense');
        const incTxs = projTxs.filter(t => t.type === 'income');
        const grossSpent = expTxs.reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
        const reimbursed = incTxs.reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
        const netSpent = Math.max(0, grossSpent - reimbursed);
        const pct = p.budget > 0 ? Math.min(100, Math.round((netSpent / p.budget) * 100)) : 0;

        // Distinct days count for average daily trip cost
        const distinctDays = new Set(expTxs.map(t => t.date)).size || 1;
        const avgPerDay = Math.round(netSpent / distinctDays);
        const isExpanded = this.expandedProjectId === p.id;

        return `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
              <div style="cursor: pointer;" onclick="App.toggleProjectDetail('${p.id}')">
                <div style="font-weight: 700; font-size: 0.98rem; display: flex; align-items: center; gap: 0.4rem;">
                  <span>${p.name}</span>
                  <span class="tag">${isExpanded ? '▲ 收合明細' : '▼ 展開分析'}</span>
                </div>
                <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 0.15rem;">
                  共 ${expTxs.length} 筆支出 (${distinctDays} 天) ｜ 日均花費 <strong class="font-mono-num">${this.formatCurrency(avgPerDay)}/天</strong>
                  ${reimbursed > 0 ? ` ｜ 已扣回代墊/退稅 <span class="font-mono-num" style="color:var(--color-income)">+${this.formatCurrency(reimbursed)}</span>` : ''}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <div class="font-mono-num" style="text-align: right;">
                  <div style="font-weight: 700; color: var(--color-expense);">淨花費 ${this.formatCurrency(netSpent)}</div>
                  <div style="font-size: 0.74rem; color: var(--text-secondary);">預算 ${this.formatCurrency(p.budget)} (${pct}%)</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="App.filterLedgerByProject('${p.id}')" title="在明細頁檢視">🔍</button>
                <button class="btn btn-ghost btn-sm" onclick="App.deleteProject('${p.id}')" title="刪除專案">🗑️</button>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: ${pct > 90 ? '#f43f5e' : '#818cf8'};"></div>
            </div>

            ${isExpanded ? `
              <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: #818cf8;">📋 專案收支流水帳 (${projTxs.length} 筆)</span>
                  <button class="btn btn-primary btn-sm" onclick="App.openTxModalForProject('${p.id}')">＋ 新增此專案支出</button>
                </div>
                <div style="max-height: 260px; overflow-y: auto;">
                  ${projTxs.length ? projTxs.map(t => this.buildTxRowHtml(t, true)).join('') : '<div style="font-size:0.8rem;color:var(--text-secondary);">尚無專案交易</div>'}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    let monthlyTotal = 0;
    this.state.subscriptions.forEach(s => {
      monthlyTotal += s.cycle === 'yearly' ? s.amount / 12 : s.amount;
    });
    const yearlyTotal = monthlyTotal * 12;

    document.getElementById('subSummaryBanner').innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">每月固定訂閱/扣款總計</div>
          <div class="font-mono-num" style="font-size: 1.25rem; font-weight: 800; color: #f59e0b;">${this.formatCurrency(monthlyTotal)} / 月</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; color: var(--text-secondary);">年度固定總成本換算</div>
          <div class="font-mono-num" style="font-size: 1.15rem; font-weight: 700;">${this.formatCurrency(yearlyTotal)} / 年</div>
        </div>
      </div>
    `;

    const subEl = document.getElementById('subscriptionsListContainer');
    if (!this.state.subscriptions.length) {
      subEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.5rem; text-align: center;">尚無固定訂閱項目</div>`;
    } else {
      subEl.innerHTML = this.state.subscriptions.map(sub => {
        const acc = this.getAccountById(sub.accountId);
        return `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.8rem 0.95rem; display: flex; justify-content: space-between; align-items: center; gap: 0.6rem;">
            <div>
              <div style="font-weight: 700; font-size: 0.92rem;">🔁 ${sub.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">
                每月 ${sub.day} 號扣款 • 🏦 ${acc.name}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <strong class="font-mono-num" style="color: var(--color-expense);">${this.formatCurrency(sub.amount)}</strong>
              <button class="btn btn-secondary btn-sm" onclick="App.recordSubscriptionNow('${sub.id}')">⚡ 入帳</button>
              <button class="btn btn-ghost btn-sm" onclick="App.deleteSubscription('${sub.id}')">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  toggleProjectDetail(projId) {
    this.expandedProjectId = (this.expandedProjectId === projId) ? null : projId;
    this.renderProjectsAndSubscriptions();
  },

  openTxModalForProject(projId) {
    this.openTxModal('expense', true);
    document.getElementById('txProject').value = projId;
  },

  filterLedgerByProject(projId) {
    const el = document.getElementById('filterProject');
    if (el) el.value = projId;
    this.switchTab('ledger');
    this.renderLedger();
  },

  deleteProject(projId) {
    const p = this.state.projects.find(x => x.id === projId);
    if (!p || !confirm(`確定要刪除專案【${p.name}】嗎？（原有交易紀錄將保留並轉為一般日常）`)) return;
    this.state.projects = this.state.projects.filter(x => x.id !== projId);
    this.state.transactions.forEach(t => {
      if (t.projectId === projId) t.projectId = '';
    });
    this.saveState();
    this.renderAll();
    this.toast('🗑️ 已刪除專案');
  },

  deleteSubscription(subId) {
    this.state.subscriptions = this.state.subscriptions.filter(s => s.id !== subId);
    this.saveState();
    this.renderAll();
    this.toast('🗑️ 已移除訂閱項目');
  },

  recordSubscriptionNow(subId) {
    const sub = this.state.subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(Math.min(28, sub.day || 15)).padStart(2, '0')}`;
    const tx = {
      id: 'tx_' + Date.now(),
      type: 'expense',
      amount: sub.amount,
      currency: 'TWD',
      twdAmount: sub.amount,
      category: 'entertainment',
      accountId: sub.accountId,
      date: dateStr,
      note: `${sub.name} #訂閱固定扣款`,
      projectId: '',
      invoice: ''
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`🔁 已將【${sub.name}】${this.formatCurrency(sub.amount)} 記入本月帳本`);
  },

  // ================= 6. TAIWAN CLOUD INVOICES =================
  renderInvoices() {
    const invTxs = this.state.transactions.filter(t => t.invoice && t.invoice.trim() !== '');
    document.getElementById('invoiceCountBadge').textContent = `${invTxs.length} 張雲端發票`;

    const el = document.getElementById('invoiceListContainer');
    if (!invTxs.length) {
      el.innerHTML = `<div style="color: var(--text-secondary); padding: 2rem; text-align: center;">目前尚無附帶發票號碼的交易</div>`;
      return;
    }

    el.innerHTML = invTxs.map(t => `
      <div class="tx-row">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="tag font-mono-num" style="font-size: 0.82rem; font-weight: 700;">🧾 ${t.invoice}</span>
            <strong style="font-size: 0.9rem;">${t.note || '消費發票'}</strong>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
            日期：${t.date} ｜ 帳戶：${this.getAccountById(t.accountId).name}
          </div>
        </div>
        <div class="font-mono-num" style="font-weight: 700; color: var(--color-expense);">
          ${this.formatCurrency(t.twdAmount || t.amount)}
        </div>
      </div>
    `).join('');
  },

  simulateCloudInvoiceSync() {
    const sampleStores = [
      { note: '7-ELEVEN 超商咖啡與御飯糰 #載具匯入', amount: 95, cat: 'food', inv: 'TW-59283741' },
      { note: '全聯福利中心生鮮蔬果採買 #載具匯入', amount: 640, cat: 'shopping', inv: 'TW-10482519' },
      { note: '桃園機場第一航廈免稅店 #載具匯入', amount: 1280, cat: 'shopping', inv: 'TW-88412630' }
    ];
    const pick = sampleStores[Math.floor(Math.random() * sampleStores.length)];
    const todayStr = this.getTodayDateStr();

    const tx = {
      id: 'tx_' + Date.now(),
      type: 'expense',
      amount: pick.amount,
      currency: 'TWD',
      twdAmount: pick.amount,
      category: pick.cat,
      accountId: (this.state.accounts[0] && this.state.accounts[0].id) || 'acc_cash',
      date: todayStr,
      note: pick.note,
      projectId: '',
      invoice: pick.inv
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`📲 已從財政部雲端載具同步匯入發票【${pick.inv}】`);
  },

  checkInvoicePrizes() {
    const special = (document.getElementById('prizeSpecial').value || '').replace(/\D/g, '');
    const grand = (document.getElementById('prizeGrand').value || '').replace(/\D/g, '');
    const firstList = (document.getElementById('prizeFirst').value || '')
      .split(',')
      .map(s => s.replace(/\D/g, ''))
      .filter(Boolean);

    const invTxs = this.state.transactions.filter(t => t.invoice && t.invoice.trim() !== '');
    const winners = [];

    invTxs.forEach(t => {
      const digits = t.invoice.replace(/\D/g, '');
      if (digits.length < 3) return;
      if (special && digits === special) {
        winners.push({ tx: t, prize: '🏆 特別獎 $10,000,000' });
      } else if (grand && digits === grand) {
        winners.push({ tx: t, prize: '🥇 特獎 $2,000,000' });
      } else {
        for (const f of firstList) {
          if (f.length >= 3 && digits.slice(-3) === f.slice(-3)) {
            if (digits === f) winners.push({ tx: t, prize: '🎉 頭獎 $200,000' });
            else if (digits.slice(-4) === f.slice(-4)) winners.push({ tx: t, prize: '🎊 五獎 $1,000' });
            else winners.push({ tx: t, prize: '🧧 六獎 $200 (末三碼相同)' });
            break;
          }
        }
      }
    });

    const resEl = document.getElementById('invoicePrizeResult');
    if (!winners.length) {
      resEl.innerHTML = `<div style="padding: 0.75rem; background: rgba(148,163,184,0.12); border-radius: 8px; font-size: 0.85rem;">已完成 ${invTxs.length} 張雲端發票比對，目前尚未對中號碼。</div>`;
    } else {
      resEl.innerHTML = winners.map(w => `
        <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.16); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 0.45rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #10b981;">${w.prize}</strong>
            <div style="font-size: 0.8rem;">發票：<span class="font-mono-num">${w.tx.invoice}</span>（${w.tx.note}）</div>
          </div>
          <span class="badge-income">恭喜中獎！</span>
        </div>
      `).join('');
    }
  },

  // ================= 7. FORTUNE CITY GAMIFICATION =================
  renderFortuneCity() {
    const allTxs = this.state.transactions;
    const totalExpPoints = allTxs.length * 18 + (this.state.streakDays || 1) * 10;
    const cityLevel = Math.max(1, Math.floor(totalExpPoints / 100) + 1);
    const currentLvExp = totalExpPoints % 100;
    const population = cityLevel * 1250 + allTxs.length * 85;

    document.getElementById('navCityLv').textContent = `Lv.${cityLevel}`;
    document.getElementById('cityTitleBanner').textContent = `🌟 永恆金融大都會 Lv.${cityLevel}`;
    document.getElementById('cityExpText').textContent = `${currentLvExp} / 100 EXP`;
    document.getElementById('cityExpBar').style.width = `${currentLvExp}%`;
    document.getElementById('cityPopulationText').textContent = `👥 市民人口：${population.toLocaleString()} 人`;

    const catCounts = {};
    allTxs.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    const buildingCats = [...this.getAllCategoriesByType('expense'), ...CATEGORIES.income.slice(0, 2)];
    document.getElementById('cityBuildingsGrid').innerHTML = buildingCats.map(c => {
      const count = catCounts[c.id] || 0;
      const bLv = count + 1;
      return `
        <div class="city-plot">
          <div class="building-emoji">${c.bEmoji || c.icon}</div>
          <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">${c.building || (c.name + '大樓')}</div>
          <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.15rem;">${c.name}園區</div>
          <div style="margin-top: 0.45rem;">
            <span class="fusion-pill" style="background: rgba(16,185,129,0.22); color: #6ee7b7;">Lv.${bLv} (${count}筆建設)</span>
          </div>
        </div>
      `;
    }).join('');

    const achievements = [
      { title: '🔥 記帳初心者', desc: '累計完成 5 筆收支記帳', unlocked: allTxs.length >= 5 },
      { title: '🏙️ 都會建築師', desc: '城市市長等級達到 Lv.3', unlocked: cityLevel >= 3 },
      { title: '🏦 百萬資產掌門人', desc: '總淨資產突破 $1,000,000', unlocked: this.state.accounts.reduce((s, a) => s + a.balance, 0) >= 1000000 },
      { title: '✈️ 跨國旅人記帳王', desc: '完成至少 5 筆外幣 (JPY/USD/EUR) 跨國記帳', unlocked: allTxs.filter(t => t.currency && t.currency !== 'TWD').length >= 5 },
      { title: '🧾 雲端發票達人', desc: '登錄至少 3 張統一發票載具', unlocked: allTxs.filter(t => t.invoice).length >= 3 },
      { title: '🛡️ YNAB 零基守護者', desc: '建立 3 個以上的夢想儲蓄目標池', unlocked: this.state.goals.length >= 3 }
    ];

    document.getElementById('cityAchievementsGrid').innerHTML = achievements.map(a => `
      <div style="padding: 0.85rem; border-radius: 12px; border: 1px solid ${a.unlocked ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}; background: ${a.unlocked ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <strong style="font-size: 0.9rem;">${a.title}</strong>
          <span class="${a.unlocked ? 'badge-income' : 'tag'}">${a.unlocked ? '已解鎖' : '進行中'}</span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">${a.desc}</div>
      </div>
    `).join('');
  },

  // ================= 8. FX RATES SETTINGS =================
  renderFxRatesSettings() {
    const el = document.getElementById('fxRatesConfigList');
    if (!el) return;
    const currencies = [
      { code: 'JPY', label: '🇯🇵 JPY 日圓兌台幣' },
      { code: 'THB', label: '🇹🇭 THB 泰銖兌台幣' },
      { code: 'USD', label: '🇺🇸 USD 美金兌台幣' },
      { code: 'EUR', label: '🇪🇺 EUR 歐元兌台幣' },
      { code: 'HKD', label: '🇭🇰 HKD 港幣兌台幣' }
    ];
    el.innerHTML = currencies.map(c => `
      <div>
        <label class="form-label">${c.label}</label>
        <input type="number" step="0.001" id="fxInput_${c.code}" class="form-control font-mono-num" value="${this.getFxRate(c.code)}" />
      </div>
    `).join('');
  },

  saveCustomFxRates() {
    ['JPY', 'THB', 'USD', 'EUR', 'HKD'].forEach(code => {
      const el = document.getElementById(`fxInput_${code}`);
      if (el && Number(el.value) > 0) {
        this.state.fxRates[code] = Number(el.value);
      }
    });
    this.saveState();
    this.renderAll();
    this.toast('💱 已更新自訂外幣匯率設定');
  },

  // ================= MODALS & BLANK FORMS =================
  openTxModal(defaultType = 'expense', isBlankNew = true) {
    if (isBlankNew) {
      document.getElementById('txModalTitle').textContent = '➕ 新增全新空白收支紀錄';
      this.resetTxFormBlank(defaultType);
    }
    document.getElementById('txModal').classList.add('open');
    setTimeout(() => document.getElementById('txAmount').focus(), 60);
  },

  resetTxFormBlank(defaultType = 'expense') {
    document.getElementById('txId').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txNote').value = '';
    document.getElementById('txInvoice').value = '';
    document.getElementById('txCurrency').value = 'TWD';
    document.getElementById('txCalcPreview').textContent = '';
    document.getElementById('txCustomCategory').value = '';
    document.getElementById('txCustomCategory').style.display = 'none';
    document.getElementById('txCustomAccount').value = '';
    document.getElementById('txCustomAccount').style.display = 'none';
    document.getElementById('txDate').value = this.getTodayDateStr();
    document.getElementById('txProject').value = '';
    this.setTxFormType(defaultType);
  },

  openTransferModal() {
    this.openTxModal('transfer', true);
  },

  setTxFormType(type) {
    this.currentTxType = type;
    document.getElementById('typeBtnExpense').className = `btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`;
    document.getElementById('typeBtnIncome').className = `btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`;
    document.getElementById('typeBtnTransfer').className = `btn ${type === 'transfer' ? 'btn-primary' : 'btn-secondary'}`;

    document.getElementById('txCategoryGroup').style.display = type === 'transfer' ? 'none' : 'block';
    document.getElementById('txToAccountGroup').style.display = type === 'transfer' ? 'block' : 'none';
    document.getElementById('txAccountLabel').textContent = type === 'transfer' ? '轉出帳戶' : type === 'income' ? '入帳帳戶' : '扣款帳戶';

    this.updateTxFormCategoryOptions();
  },

  applyQuickModifier(modStr) {
    const input = document.getElementById('txAmount');
    if (!input.value.trim()) return;
    input.value = `${input.value}${modStr}`;
    this.previewCalcAmount();
  },

  previewCalcAmount() {
    const raw = document.getElementById('txAmount').value;
    const currency = document.getElementById('txCurrency').value || 'TWD';
    const val = this.evalMath(raw);
    const rate = this.getFxRate(currency);
    const twd = Math.round(val * rate);
    const preview = document.getElementById('txCalcPreview');

    if (!raw) {
      preview.textContent = '';
      return;
    }
    if (currency !== 'TWD') {
      preview.textContent = `🧮 算式：${val} ${currency} (匯率 ${rate}) ➔ 折合新台幣 ${this.formatCurrency(twd)}`;
    } else if (/[+\-*/]/.test(raw)) {
      preview.textContent = `🧮 算式計算結果：${this.formatCurrency(val)}`;
    } else {
      preview.textContent = '';
    }
  },

  appendCalc(token) {
    const input = document.getElementById('txAmount');
    if (token === 'C') {
      input.value = '';
    } else {
      input.value += token;
    }
    this.previewCalcAmount();
  },

  evalCalcBox() {
    const input = document.getElementById('txAmount');
    input.value = this.evalMath(input.value);
    this.previewCalcAmount();
  },

  saveTransaction(e) {
    e.preventDefault();
    const editingId = document.getElementById('txId').value;
    const rawAmt = document.getElementById('txAmount').value;
    const amount = this.evalMath(rawAmt);
    if (amount <= 0) {
      this.toast('⚠️ 請輸入大於 0 的金額或算式');
      return;
    }

    const currency = document.getElementById('txCurrency').value || 'TWD';
    const twdAmount = Math.round(amount * this.getFxRate(currency));

    let category = this.currentTxType === 'transfer' ? 'transfer' : document.getElementById('txCategory').value;
    if (category === '__custom_cat__') {
      const customCatName = document.getElementById('txCustomCategory').value.trim();
      if (!customCatName) {
        this.toast('⚠️ 請輸入自訂分類名稱');
        document.getElementById('txCustomCategory').focus();
        return;
      }
      category = this.registerCustomCategory(this.currentTxType, customCatName);
    }

    let accountId = document.getElementById('txAccount').value;
    if (accountId === '__custom_acc__') {
      const customAccName = document.getElementById('txCustomAccount').value.trim();
      if (!customAccName) {
        this.toast('⚠️ 請輸入自訂帳戶名稱');
        document.getElementById('txCustomAccount').focus();
        return;
      }
      const newAccId = 'acc_' + Date.now();
      this.state.accounts.push({
        id: newAccId,
        name: customAccName,
        type: 'bank',
        balance: 0,
        limit: 0
      });
      accountId = newAccId;
    }

    const toAccountId = document.getElementById('txToAccount').value;
    const date = document.getElementById('txDate').value;
    const projectId = document.getElementById('txProject').value;
    const note = document.getElementById('txNote').value.trim() || this.getCategoryMeta(category).name;
    const invoice = document.getElementById('txInvoice').value.trim().toUpperCase();

    if (editingId) {
      const oldIdx = this.state.transactions.findIndex(t => t.id === editingId);
      if (oldIdx !== -1) {
        this.applyTxAccountBalance(this.state.transactions[oldIdx], -1);
        const updatedTx = {
          id: editingId,
          type: this.currentTxType,
          amount,
          currency,
          twdAmount,
          category,
          accountId,
          toAccountId: this.currentTxType === 'transfer' ? toAccountId : '',
          date,
          note,
          projectId,
          invoice
        };
        this.applyTxAccountBalance(updatedTx, 1);
        this.state.transactions[oldIdx] = updatedTx;
        this.saveState();
        this.closeModal('txModal');
        this.renderAll();
        this.toast(`✅ 已更新帳務：${note} (${this.formatCurrency(twdAmount)})`);
        return;
      }
    }

    const newTx = {
      id: 'tx_' + Date.now(),
      type: this.currentTxType,
      amount,
      currency,
      twdAmount,
      category,
      accountId,
      toAccountId: this.currentTxType === 'transfer' ? toAccountId : '',
      date,
      note,
      projectId,
      invoice
    };

    this.applyTxAccountBalance(newTx, 1);
    this.state.transactions.unshift(newTx);
    this.saveState();
    this.closeModal('txModal');
    this.renderAll();
    this.toast(`✅ 已成功入帳：${note} (${this.formatCurrency(twdAmount)})`);
  },

  openAccountModal() {
    document.getElementById('accName').value = '';
    document.getElementById('accBalance').value = '0';
    document.getElementById('accLimit').value = '';
    document.getElementById('accountModal').classList.add('open');
  },

  saveAccount(e) {
    e.preventDefault();
    const name = document.getElementById('accName').value.trim();
    const type = document.getElementById('accType').value;
    const balance = Number(document.getElementById('accBalance').value || 0);
    const limit = Number(document.getElementById('accLimit').value || 0);
    if (!name) return;

    this.state.accounts.push({
      id: 'acc_' + Date.now(),
      name,
      type,
      balance,
      limit
    });
    this.saveState();
    this.closeModal('accountModal');
    this.renderAll();
    this.toast(`🏦 已新增帳戶【${name}】`);
  },

  openGoalModal() {
    document.getElementById('goalName').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalCurrent').value = '0';
    document.getElementById('goalModal').classList.add('open');
  },

  saveGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const icon = document.getElementById('goalIcon').value.trim() || '🌟';
    const target = Number(document.getElementById('goalTarget').value || 0);
    const current = Number(document.getElementById('goalCurrent').value || 0);
    if (!name || target <= 0) return;

    this.state.goals.push({
      id: 'g_' + Date.now(),
      name,
      icon,
      target,
      current
    });
    this.saveState();
    this.closeModal('goalModal');
    this.renderAll();
    this.toast(`🎯 已建立儲蓄目標【${name}】`);
  },

  openProjectModal() {
    document.getElementById('projName').value = '';
    document.getElementById('projBudget').value = '';
    document.getElementById('projectModal').classList.add('open');
  },

  saveProject(e) {
    e.preventDefault();
    const name = document.getElementById('projName').value.trim();
    const budget = Number(document.getElementById('projBudget').value || 0);
    if (!name) return;

    this.state.projects.push({
      id: 'proj_' + Date.now(),
      name,
      budget
    });
    this.saveState();
    this.closeModal('projectModal');
    this.renderAll();
    this.toast(`✈️ 已建立獨立專案記帳本【${name}】`);
  },

  openSubModal() {
    document.getElementById('subName').value = '';
    document.getElementById('subAmount').value = '';
    document.getElementById('subModal').classList.add('open');
  },

  saveSubscription(e) {
    e.preventDefault();
    const name = document.getElementById('subName').value.trim();
    const amount = Number(document.getElementById('subAmount').value || 0);
    const cycle = document.getElementById('subCycle').value;
    const day = Number(document.getElementById('subDay').value || 1);
    const accountId = document.getElementById('subAccount').value;
    if (!name || amount <= 0) return;

    this.state.subscriptions.push({
      id: 'sub_' + Date.now(),
      name,
      amount,
      cycle,
      day,
      accountId
    });
    this.saveState();
    this.closeModal('subModal');
    this.renderAll();
    this.toast(`🔁 已新增週期訂閱【${name}】`);
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('open');
  },

  // ================= BLANK LEDGER / 7-DAY TRIP SCENARIO / EXPORT =================
  startBrandNewBlankLedger() {
    if (!confirm('📄 確定要開啟「完全空白的新帳本」嗎？\n這將清空目前的範例資料，讓您從 $0 開始記錄全新的個人帳務。')) {
      return;
    }
    this.state = this.getBlankCleanState();
    this.selectedCalendarDate = null;
    this.expandedProjectId = null;
    this.saveState();
    this.renderAll();
    document.getElementById('inlineAmount').focus();
    this.toast('📄 已開啟 100% 全新空白帳本！');
  },

  loadSevenDayTripScenario() {
    this.state = this.getDefaultDemoState();
    this.selectedCalendarDate = null;
    this.expandedProjectId = 'proj_japan7';
    this.saveState();
    this.renderAll();
    this.switchTab('projects');
    this.toast('🧳 已載入「日本東京京都七天六夜自由行」完整跨國記帳帳本並展開專案明細！');
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniLedger_Backup_${this.currentYear}_${this.currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('📦 已匯出 JSON 完整帳本備份檔');
  },

  importJSON(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && Array.isArray(parsed.transactions)) {
          this.state = parsed;
          this.saveState();
          this.renderAll();
          this.toast('✅ 已成功還原 JSON 帳本備份');
        } else {
          this.toast('⚠️ 備份檔案格式不正確');
        }
      } catch {
        this.toast('⚠️ 無法解析 JSON 檔案');
      }
    };
    reader.readAsText(file);
  },

  exportCSV() {
    const headers = ['日期', '類型', '分類', '金額(TWD)', '原幣別', '原幣金額', '帳戶', '專案', '發票號碼', '備註與標籤'];
    const rows = this.state.transactions.map(t => [
      t.date,
      t.type === 'income' ? '收入' : t.type === 'transfer' ? '轉帳' : '支出',
      this.getCategoryMeta(t.category).name,
      t.twdAmount || t.amount,
      t.currency || 'TWD',
      t.amount,
      this.getAccountById(t.accountId).name,
      t.projectId ? (this.state.projects.find(p => p.id === t.projectId)?.name || '') : '',
      t.invoice || '',
      `"${String(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniLedger_收支報表_${this.currentYear}_${this.currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('📊 已匯出 Excel 相容 CSV 收支報表');
  },

  resetToDemoData() {
    this.state = this.getDefaultDemoState();
    this.selectedCalendarDate = null;
    this.saveState();
    this.renderAll();
    this.toast('🔄 已載入預設範例資料');
  },

  clearAllTransactions() {
    if (!confirm('確定要清空所有收支交易紀錄嗎？（帳戶設定與預算分類將保留）')) return;
    this.state.transactions = [];
    this.saveState();
    this.renderAll();
    this.toast('🗑️ 已清空所有交易紀錄');
  },

  toast(msg) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
