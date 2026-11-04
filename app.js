/**
 * OmniLedger Pro - iOS 旗艦行動版 (五大記帳神軟 × 五大族群實測優化最終版)
 * 五大實測族群：1.旅遊達人 2.溫馨家庭 3.背包客 4.情侶AA 5.出國辦公
 */

const STORAGE_KEY = 'OMNILEDGER_IOS_FINAL_V3';

const DEFAULT_FX_RATES = {
  TWD: 1,
  JPY: 0.215,
  THB: 0.94,
  USD: 32.2,
  EUR: 34.8,
  HKD: 4.12
};

const THEMES = ['obsidian', 'ocean', 'latte', 'rose', 'forest'];
const THEME_NAMES = {
  obsidian: '⌚ 商務・曜石黑金',
  ocean: '🌅 旅人・極光海藍',
  latte: '🏡 家庭・暖陽奶茶',
  rose: '🌸 情侶・微醺櫻花',
  forest: '🌲 背包客・大地森林綠'
};

const SPLIT_MODES = {
  personal: { label: '✨ 個人', badge: '' },
  aa50: { label: '💑 AA平分(待收50%)', badge: '💑 AA待收50%' },
  advance100: { label: '🙋 代墊(待收100%)', badge: '🙋 代墊待收' },
  reimburse: { label: '💼 公司報銷公帳', badge: '💼 待報銷' },
  member_dad: { label: '👨 爸爸', badge: '👨 爸爸' },
  member_mom: { label: '👩 媽媽', badge: '👩 媽媽' },
  member_kid: { label: '👶 寶貝子女', badge: '👶 寶貝' }
};

const CATEGORIES = {
  expense: [
    { id: 'food', name: '餐飲美食', icon: '🍜', color: '#f43f5e', building: '星級美食廣場', bEmoji: '🍱', defaultBudget: 12000 },
    { id: 'transport', name: '交通機票', icon: '🚇', color: '#3b82f6', building: '高鐵轉運樞紐', bEmoji: '🚄', defaultBudget: 4000 },
    { id: 'shopping', name: '購物採買', icon: '🛍️', color: '#ec4899', building: '國際精品百貨', bEmoji: '🏬', defaultBudget: 8000 },
    { id: 'home', name: '居家住宿', icon: '🏠', color: '#8b5cf6', building: '綠能智慧社區', bEmoji: '🏢', defaultBudget: 16000 },
    { id: 'entertainment', name: '休閒約會', icon: '🎮', color: '#f59e0b', building: '環球影城樂園', bEmoji: '🎡', defaultBudget: 5000 },
    { id: 'medical', name: '醫療藥妝', icon: '💊', color: '#10b981', building: '未來生技醫療院', bEmoji: '🏥', defaultBudget: 2500 },
    { id: 'education', name: '育兒進修', icon: '📚', color: '#06b6d4', building: '國家數位圖書館', bEmoji: '🏛️', defaultBudget: 6000 },
    { id: 'other_exp', name: '商務與其他', icon: '📦', color: '#64748b', building: '市民服務中心', bEmoji: '🏤', defaultBudget: 3000 }
  ],
  income: [
    { id: 'salary', name: '薪資收入', icon: '💼', color: '#10b981', building: '跨國金融雙子星', bEmoji: '🏙️' },
    { id: 'bonus', name: '獎金與退稅', icon: '🧧', color: '#34d399', building: '市政榮譽金庫', bEmoji: '🏦' },
    { id: 'invest_inc', name: '投資股息', icon: '📈', color: '#38bdf8', building: '證券交易中心', bEmoji: '💹' },
    { id: 'side_hustle', name: '分帳/報銷入帳', icon: '🚀', color: '#a855f7', building: '新創科技育成塔', bEmoji: '🗼' }
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
    this.populateSelects();
    this.renderAll();
  },

  getTodayDateStr() {
    if (this.selectedCalendarDate) return this.selectedCalendarDate;
    return `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(Math.min(28, new Date().getDate())).padStart(2, '0')}`;
  },

  getFxRate(currency) {
    const rates = (this.state && this.state.fxRates) ? this.state.fxRates : DEFAULT_FX_RATES;
    return Number(rates[currency] || DEFAULT_FX_RATES[currency] || 1);
  },

  // ================= 5 PERSONA SCENARIO GENERATORS =================
  getPersonaScenarioData(persona = 'travel') {
    const y = this.currentYear;
    const m = String(this.currentMonth).padStart(2, '0');
    const padDay = (d) => `${y}-${m}-${String(Math.min(28, Math.max(1, d))).padStart(2, '0')}`;

    if (persona === 'family') {
      return {
        persona: 'family',
        theme: 'latte',
        streakDays: 21,
        excludeProjectFromBudget: true,
        fxRates: { ...DEFAULT_FX_RATES },
        customCategories: [],
        accounts: [
          { id: 'acc_fam_bank', name: '家庭共同薪轉戶 (國泰)', type: 'bank', balance: 368000, limit: 0 },
          { id: 'acc_dad_cash', name: '爸爸零用錢包', type: 'cash', balance: 4500, limit: 0 },
          { id: 'acc_mom_line', name: '媽媽 LINE Pay', type: 'epay', balance: 6200, limit: 0 },
          { id: 'acc_fam_etf', name: '親子教育 ETF (0050)', type: 'investment', balance: 950000, limit: 0 },
          { id: 'acc_fam_card', name: '家庭Costco聯名卡', type: 'credit', balance: -21400, limit: 200000 }
        ],
        budgets: { food: 18000, transport: 5000, shopping: 10000, home: 28000, entertainment: 6000, medical: 4000, education: 15000, other_exp: 4000 },
        goals: [
          { id: 'g1', name: '家庭六個月緊急預備金', icon: '🏠', target: 500000, current: 420000 },
          { id: 'g2', name: '寶貝雙語幼兒園教育基金', icon: '👶', target: 200000, current: 135000 },
          { id: 'g3', name: '全家寒假沖繩自駕遊', icon: '🚗', target: 80000, current: 55000 }
        ],
        projects: [
          { id: 'proj_kids', name: '👶 寶貝成長與才藝專案', budget: 25000, dailyCap: 0 },
          { id: 'proj_home_fix', name: '🛋️ 客廳家電升級計畫', budget: 45000, dailyCap: 0 }
        ],
        subscriptions: [
          { id: 's1', name: '社區大樓管理費+車位', amount: 4200, cycle: 'monthly', day: 5, accountId: 'acc_fam_bank' },
          { id: 's2', name: '寶貝幼兒園月費', amount: 12500, cycle: 'monthly', day: 10, accountId: 'acc_fam_bank' },
          { id: 's3', name: '中華電信光世代+全家手機', amount: 2199, cycle: 'monthly', day: 15, accountId: 'acc_fam_card' },
          { id: 's4', name: 'Disney+ 家庭劇院方案', amount: 270, cycle: 'monthly', day: 20, accountId: 'acc_fam_card' }
        ],
        transactions: [
          { id: 'f1', type: 'income', amount: 72000, currency: 'TWD', twdAmount: 72000, category: 'salary', accountId: 'acc_fam_bank', date: padDay(1), note: '爸爸本薪入帳 #家庭收入', projectId: '', invoice: '', splitMode: 'member_dad' },
          { id: 'f2', type: 'income', amount: 58000, currency: 'TWD', twdAmount: 58000, category: 'salary', accountId: 'acc_fam_bank', date: padDay(1), note: '媽媽本薪入帳 #家庭收入', projectId: '', invoice: '', splitMode: 'member_mom' },
          { id: 'f3', type: 'expense', amount: 24500, currency: 'TWD', twdAmount: 24500, category: 'home', accountId: 'acc_fam_bank', date: padDay(2), note: '房屋貸款本息自動扣繳 #房貸', projectId: '', invoice: '', splitMode: 'personal' },
          { id: 'f4', type: 'expense', amount: 4860, currency: 'TWD', twdAmount: 4860, category: 'shopping', accountId: 'acc_fam_card', date: padDay(3), note: '好市多 Costco 鮮奶牛肉尿布大採買 #買菜', projectId: '', invoice: 'AB-38014925', splitMode: 'member_mom' },
          { id: 'f5', type: 'expense', amount: 3600, currency: 'TWD', twdAmount: 3600, category: 'education', accountId: 'acc_fam_card', date: padDay(4), note: '寶貝兒童游泳課與繪本教材 #育兒', projectId: 'proj_kids', invoice: 'CD-59283741', splitMode: 'member_kid' },
          { id: 'f6', type: 'expense', amount: 1450, currency: 'TWD', twdAmount: 1450, category: 'transport', accountId: 'acc_dad_cash', date: padDay(5), note: '休旅車中油加滿油 #通勤', projectId: '', invoice: 'EF-10482519', splitMode: 'member_dad' }
        ]
      };
    }

    if (persona === 'backpacker') {
      return {
        persona: 'backpacker',
        theme: 'forest',
        streakDays: 12,
        excludeProjectFromBudget: false,
        fxRates: { ...DEFAULT_FX_RATES },
        customCategories: [],
        accounts: [
          { id: 'acc_thb_cash', name: '泰銖現鈔貼身腰包 (折TWD)', type: 'cash', balance: 14500, limit: 0 },
          { id: 'acc_wise', name: 'Wise 跨國多幣簽帳卡', type: 'bank', balance: 38000, limit: 0 },
          { id: 'acc_tw_bank', name: '台新 Richart 備用金', type: 'bank', balance: 85000, limit: 0 }
        ],
        budgets: { food: 6000, transport: 4000, shopping: 2000, home: 6000, entertainment: 3000, medical: 1000, education: 1000, other_exp: 1500 },
        goals: [
          { id: 'g1', name: '環遊東南亞 30 天壯遊基金', icon: '🎒', target: 45000, current: 45000 },
          { id: 'g2', name: '南美洲秘魯印加古道基金', icon: '🏔️', target: 120000, current: 64000 }
        ],
        projects: [
          { id: 'proj_thai14', name: '🇹🇭 泰北清邁＋曼谷背包窮遊 14 天', budget: 16800, dailyCap: 1200 }
        ],
        subscriptions: [
          { id: 's1', name: 'Airalo 東南亞 eSIM 網路卡', amount: 650, cycle: 'monthly', day: 1, accountId: 'acc_wise' },
          { id: 's2', name: 'World Nomads 背包客旅平險', amount: 1200, cycle: 'monthly', day: 1, accountId: 'acc_wise' }
        ],
        transactions: [
          { id: 'b1', type: 'expense', amount: 350, currency: 'THB', twdAmount: 329, category: 'home', accountId: 'acc_thb_cash', date: padDay(1), note: '[清邁D1] 塔佩門青年旅館床位 Hostel #青旅', projectId: 'proj_thai14', invoice: '', splitMode: 'personal' },
          { id: 'b2', type: 'expense', amount: 120, currency: 'THB', twdAmount: 113, category: 'food', accountId: 'acc_thb_cash', date: padDay(1), note: '[清邁D1] 鳳飛飛豬腳飯＋手標泰奶 #夜市', projectId: 'proj_thai14', invoice: '', splitMode: 'personal' },
          { id: 'b3', type: 'expense', amount: 250, currency: 'THB', twdAmount: 235, category: 'transport', accountId: 'acc_thb_cash', date: padDay(2), note: '[清邁D2] 租機車一日＋加滿汽油 #素帖山', projectId: 'proj_thai14', invoice: '', splitMode: 'personal' },
          { id: 'b4', type: 'expense', amount: 300, currency: 'THB', twdAmount: 282, category: 'entertainment', accountId: 'acc_thb_cash', date: padDay(2), note: '[清邁D2] 女子監獄正宗泰式古法按摩 1.5hr #按摩', projectId: 'proj_thai14', invoice: '', splitMode: 'personal' },
          { id: 'b5', type: 'expense', amount: 850, currency: 'THB', twdAmount: 799, category: 'transport', accountId: 'acc_wise', date: padDay(3), note: '[移動D3] 清邁➔曼谷 臥鋪夜車火車票 (省一晚住宿) #夜車', projectId: 'proj_thai14', invoice: '', splitMode: 'personal' },
          { id: 'b6', type: 'expense', amount: 680, currency: 'THB', twdAmount: 639, category: 'food', accountId: 'acc_thb_cash', date: padDay(4), note: '[曼谷D4] 喬德夜市火山排骨 (與旅伴AA平分) #夜市', projectId: 'proj_thai14', invoice: '', splitMode: 'aa50' }
        ]
      };
    }

    if (persona === 'couple') {
      return {
        persona: 'couple',
        theme: 'rose',
        streakDays: 30,
        excludeProjectFromBudget: false,
        fxRates: { ...DEFAULT_FX_RATES },
        customCategories: [],
        accounts: [
          { id: 'acc_couple_pool', name: '💑 情侶同居共同基金戶', type: 'bank', balance: 48500, limit: 0 },
          { id: 'acc_my_bank', name: '我的台新 Richart 帳戶', type: 'bank', balance: 126000, limit: 0 },
          { id: 'acc_my_card', name: '我的國泰 CUBE 卡 (代墊主力)', type: 'credit', balance: -14200, limit: 150000 }
        ],
        budgets: { food: 14000, transport: 3000, shopping: 6000, home: 18000, entertainment: 8000, medical: 2000, education: 2000, other_exp: 2000 },
        goals: [
          { id: 'g1', name: '💍 兩週年紀念＆求婚戒基金', icon: '💍', target: 120000, current: 92000 },
          { id: 'g2', name: '🏝️ 峇里島雙人 Villa 度假池', icon: '🏖️', target: 70000, current: 48000 }
        ],
        projects: [
          { id: 'proj_anniv', name: '🥂 交往三週年宜蘭包棟慶祝', budget: 18000, dailyCap: 0 }
        ],
        subscriptions: [
          { id: 's1', name: '同居小套房租金 (共同基金扣)', amount: 16500, cycle: 'monthly', day: 5, accountId: 'acc_couple_pool' },
          { id: 's2', name: 'Netflix + Spotify 雙人共享', amount: 588, cycle: 'monthly', day: 15, accountId: 'acc_my_card' }
        ],
        transactions: [
          { id: 'c1', type: 'expense', amount: 3680, currency: 'TWD', twdAmount: 3680, category: 'food', accountId: 'acc_my_card', date: padDay(2), note: '橘色涮涮屋約會大餐 (我先刷卡，AA平分) #約會', projectId: 'proj_anniv', invoice: 'AB-38014925', splitMode: 'aa50' },
          { id: 'c2', type: 'expense', amount: 6400, currency: 'TWD', twdAmount: 6400, category: 'home', accountId: 'acc_my_card', date: padDay(3), note: '宜蘭清水模民宿訂金 (我先刷卡，AA平分) #民宿', projectId: 'proj_anniv', invoice: '', splitMode: 'aa50' },
          { id: 'c3', type: 'expense', amount: 2150, currency: 'TWD', twdAmount: 2150, category: 'shopping', accountId: 'acc_my_card', date: padDay(4), note: '幫另一半代買專櫃保養品 (全額代墊待收) #代墊', projectId: '', invoice: 'CD-88412630', splitMode: 'advance100' },
          { id: 'c4', type: 'expense', amount: 1280, currency: 'TWD', twdAmount: 1280, category: 'food', accountId: 'acc_couple_pool', date: padDay(5), note: '全聯採買週末在家煮火鍋食材 #公積金', projectId: '', invoice: 'EF-10482519', splitMode: 'personal' }
        ]
      };
    }

    if (persona === 'business') {
      return {
        persona: 'business',
        theme: 'obsidian',
        streakDays: 45,
        excludeProjectFromBudget: true,
        fxRates: { ...DEFAULT_FX_RATES },
        customCategories: [],
        accounts: [
          { id: 'acc_corp_card', name: '💳 商務飛行世界卡 (出差代墊)', type: 'credit', balance: -68400, limit: 350000 },
          { id: 'acc_salary_bank', name: '🏦 匯豐尊尚薪轉帳戶 (報銷入帳)', type: 'bank', balance: 540000, limit: 0 },
          { id: 'acc_usd_wallet', name: '💵 美金出差零用金 (折TWD)', type: 'cash', balance: 16100, limit: 0 },
          { id: 'acc_stock', name: '📈 美股科技股投資部位', type: 'investment', balance: 1450000, limit: 0 }
        ],
        budgets: { food: 12000, transport: 4000, shopping: 6000, home: 15000, entertainment: 5000, medical: 2000, education: 4000, other_exp: 3000 },
        goals: [
          { id: 'g1', name: '財務自由被動收入池', icon: '🏛️', target: 3000000, current: 1990000 }
        ],
        projects: [
          { id: 'proj_biz_sg', name: '💼 2026 新加坡＆東京亞太科技峰會出差', budget: 85000, dailyCap: 0 }
        ],
        subscriptions: [
          { id: 's1', name: 'ChatGPT Pro & Claude 工作助手', amount: 1300, cycle: 'monthly', day: 8, accountId: 'acc_corp_card' },
          { id: 's2', name: 'Bloomberg 財經商業週刊', amount: 960, cycle: 'monthly', day: 18, accountId: 'acc_corp_card' }
        ],
        transactions: [
          { id: 'bz1', type: 'income', amount: 115000, currency: 'TWD', twdAmount: 115000, category: 'salary', accountId: 'acc_salary_bank', date: padDay(1), note: '高階主管月薪入帳 #本薪', projectId: '', invoice: '', splitMode: 'personal' },
          { id: 'bz2', type: 'expense', amount: 26800, currency: 'TWD', twdAmount: 26800, category: 'transport', accountId: 'acc_corp_card', date: padDay(2), note: '[出差公帳] 長榮航空商務艙機票 #機票 #報銷', projectId: 'proj_biz_sg', invoice: 'BZ-38014925', splitMode: 'reimburse' },
          { id: 'bz3', type: 'expense', amount: 850, currency: 'USD', twdAmount: 27370, category: 'home', accountId: 'acc_corp_card', date: padDay(3), note: '[出差公帳] 新加坡濱海灣商務飯店 3晚住宿 #飯店 #報銷', projectId: 'proj_biz_sg', invoice: '', splitMode: 'reimburse' },
          { id: 'bz4', type: 'expense', amount: 320, currency: 'USD', twdAmount: 10304, category: 'food', accountId: 'acc_corp_card', date: padDay(4), note: '[出差公帳] 招待海外客戶商務晚宴 #交際費 #報銷', projectId: 'proj_biz_sg', invoice: '', splitMode: 'reimburse' },
          { id: 'bz5', type: 'expense', amount: 45, currency: 'USD', twdAmount: 1449, category: 'transport', accountId: 'acc_usd_wallet', date: padDay(4), note: '[出差公帳] 樟宜機場至會場 Grab 計程車資 #交通 #報銷', projectId: 'proj_biz_sg', invoice: '', splitMode: 'reimburse' },
          { id: 'bz6', type: 'expense', amount: 480, currency: 'TWD', twdAmount: 480, category: 'food', accountId: 'acc_corp_card', date: padDay(5), note: '個人平日商務午餐輕食 #個人開銷', projectId: '', invoice: 'AB-10482519', splitMode: 'personal' }
        ]
      };
    }

    // Default: 'travel' (✈️ 旅遊達人：日本＋泰國雙國跨幣別)
    return {
      persona: 'travel',
      theme: 'ocean',
      streakDays: 18,
      excludeProjectFromBudget: true,
      fxRates: { ...DEFAULT_FX_RATES },
      customCategories: [],
      accounts: [
        { id: 'acc_cash', name: '隨身台幣現金', type: 'cash', balance: 6800, limit: 0 },
        { id: 'acc_jpy_cash', name: '🇯🇵 日幣現鈔信封 (折TWD)', type: 'cash', balance: 12900, limit: 0 },
        { id: 'acc_thb_cash', name: '🇹🇭 泰銖現鈔信封 (折TWD)', type: 'cash', balance: 9400, limit: 0 },
        { id: 'acc_taishin', name: '台新 Richart 數位帳戶', type: 'bank', balance: 185400, limit: 0 },
        { id: 'acc_cathay', name: '國泰世華 CUBE 薪轉戶', type: 'bank', balance: 420000, limit: 0 },
        { id: 'acc_fubon_j', name: '富邦 J 卡 (海外高回饋)', type: 'credit', balance: -32480, limit: 180000 }
      ],
      budgets: { food: 12000, transport: 3500, shopping: 8000, home: 16000, entertainment: 5000, medical: 2500, education: 3000, other_exp: 2000 },
      goals: [
        { id: 'g1', name: '環球商務艙里程旅遊池', icon: '✈️', target: 150000, current: 118000 },
        { id: 'g2', name: '六個月緊急預備金', icon: '🛡️', target: 300000, current: 265000 }
      ],
      projects: [
        { id: 'proj_japan7', name: '🇯🇵 日本東京京都七天六夜自由行', budget: 65000, dailyCap: 8500 },
        { id: 'proj_bkk5', name: '🇹🇭 曼谷米其林＆SPA 五日度假', budget: 38000, dailyCap: 6500 }
      ],
      subscriptions: [
        { id: 'sub_1', name: 'Netflix 4K 家庭方案', amount: 390, cycle: 'monthly', day: 5, accountId: 'acc_fubon_j' },
        { id: 'sub_2', name: 'ChatGPT Plus 旅遊規劃助手', amount: 650, cycle: 'monthly', day: 12, accountId: 'acc_fubon_j' }
      ],
      transactions: [
        { id: 'tx_1', type: 'income', amount: 68500, currency: 'TWD', twdAmount: 68500, category: 'salary', accountId: 'acc_cathay', date: padDay(1), note: '本月本薪與伙食津貼 #固定收入', projectId: '', invoice: '', splitMode: 'personal' },
        { id: 'tx_j1', type: 'expense', amount: 13800, currency: 'TWD', twdAmount: 13800, category: 'transport', accountId: 'acc_fubon_j', date: padDay(2), note: '[日本D1] 桃園飛關西來回機票 #機票', projectId: 'proj_japan7', invoice: 'EF-59283741', splitMode: 'personal' },
        { id: 'tx_j2', type: 'expense', amount: 58000, currency: 'JPY', twdAmount: 12470, category: 'home', accountId: 'acc_fubon_j', date: padDay(2), note: '[日本D1] 京都四條精品飯店 3晚住宿 #住宿', projectId: 'proj_japan7', invoice: '', splitMode: 'personal' },
        { id: 'tx_j3', type: 'expense', amount: 13600, currency: 'JPY', twdAmount: 2924, category: 'food', accountId: 'acc_fubon_j', date: padDay(3), note: '[日本D2] 京都弘燒肉和牛套餐 (旅伴AA平分) #燒肉', projectId: 'proj_japan7', invoice: '', splitMode: 'aa50' },
        { id: 'tx_j4', type: 'expense', amount: 18500, currency: 'JPY', twdAmount: 3978, category: 'entertainment', accountId: 'acc_fubon_j', date: padDay(4), note: '[日本D3] 大阪環球影城 USJ 門票+快通 #樂園', projectId: 'proj_japan7', invoice: '', splitMode: 'personal' },
        { id: 'tx_j5', type: 'expense', amount: 22500, currency: 'JPY', twdAmount: 4838, category: 'medical', accountId: 'acc_fubon_j', date: padDay(5), note: '[日本D5] 澀谷大國藥妝幫朋友代買 (已扣10%退稅) #代墊', projectId: 'proj_japan7', invoice: '', splitMode: 'advance100' },
        { id: 'tx_t1', type: 'expense', amount: 2800, currency: 'THB', twdAmount: 2632, category: 'entertainment', accountId: 'acc_thb_cash', date: padDay(6), note: '[曼谷SPA] Divana 頂級精油按摩 #泰銖測試', projectId: 'proj_bkk5', invoice: '', splitMode: 'personal' },
        { id: 'tx_t2', type: 'expense', amount: 1450, currency: 'THB', twdAmount: 1363, category: 'food', accountId: 'acc_thb_cash', date: padDay(6), note: '[曼谷美食] 建興酒家咖哩螃蟹＋手標泰奶 #泰銖', projectId: 'proj_bkk5', invoice: '', splitMode: 'personal' }
      ]
    };
  },

  getBlankCleanState() {
    return {
      persona: 'blank',
      theme: this.state ? this.state.theme : 'obsidian',
      streakDays: 1,
      excludeProjectFromBudget: true,
      fxRates: { ...DEFAULT_FX_RATES },
      customCategories: [],
      accounts: [
        { id: 'acc_cash', name: '現金錢包', type: 'cash', balance: 0, limit: 0 },
        { id: 'acc_bank', name: '主要銀行帳戶', type: 'bank', balance: 0, limit: 0 },
        { id: 'acc_card', name: '主力信用卡', type: 'credit', balance: 0, limit: 100000 }
      ],
      budgets: { food: 10000, transport: 3000, shopping: 5000, home: 10000, entertainment: 3000, medical: 2000, education: 2000, other_exp: 2000 },
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
      } else {
        this.state = this.getPersonaScenarioData('travel');
        this.saveState();
      }
    } catch (e) {
      this.state = this.getPersonaScenarioData('travel');
    }
    this.applyThemeAttr(this.state.theme || 'obsidian');
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  },

  applyThemeAttr(themeName) {
    const valid = THEMES.includes(themeName) ? themeName : 'obsidian';
    this.state.theme = valid;
    document.documentElement.setAttribute('data-theme', valid);
  },

  setTheme(themeName) {
    this.applyThemeAttr(themeName);
    this.saveState();
    this.renderAll();
    this.toast(`🎨 已切換至【${THEME_NAMES[themeName] || themeName}】布景主題`);
  },

  cycleTheme() {
    const idx = THEMES.indexOf(this.state.theme || 'obsidian');
    const next = THEMES[(idx + 1) % THEMES.length];
    this.setTheme(next);
  },

  loadPersonaScenario(personaKey) {
    this.state = this.getPersonaScenarioData(personaKey);
    this.selectedCalendarDate = null;
    this.expandedProjectId = (this.state.projects[0] && this.state.projects[0].id) || null;
    this.applyThemeAttr(this.state.theme);
    this.saveState();
    this.renderAll();

    const labels = {
      travel: '✈️ 已切換至【旅遊達人】雙國跨幣別帳本 (極光海藍主題)',
      family: '👨‍👩‍👧 已切換至【溫馨家庭】共同收支與育兒帳本 (暖陽奶茶主題)',
      backpacker: '🎒 已切換至【背包客】泰北窮遊日均控管帳本 (大地森林主題)',
      couple: '💑 已切換至【情侶同居AA】分帳代墊與共同基金帳本 (微醺櫻花主題)',
      business: '💼 已切換至【出國辦公】商務差旅公帳報銷帳本 (曜石黑金主題)'
    };
    this.toast(labels[personaKey] || '已切換情境帳本');
  },

  getAllCategoriesByType(type) {
    const base = CATEGORIES[type] || [];
    const custom = (this.state.customCategories || []).filter(c => c.type === type);
    return [...base, ...custom];
  },

  bindEvents() {
    document.querySelectorAll('#sidebarNav .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
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
  },

  switchEntryMode(mode) {
    const isBlank = mode === 'blank';
    document.getElementById('segBtnBlank').classList.toggle('active', isBlank);
    document.getElementById('segBtnSmart').classList.toggle('active', !isBlank);
    document.getElementById('inlineBlankBar').style.display = isBlank ? 'grid' : 'none';
    document.getElementById('smartBarSection').style.display = isBlank ? 'none' : 'flex';
  },

  // ================= INLINE BLANK ROW CREATOR =================
  initInlineBlankBar() {
    document.getElementById('inlineDate').value = this.getTodayDateStr();
    this.syncInlineCategories();
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
    document.getElementById('inlineSplitMode').value = 'personal';
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
    const splitMode = document.getElementById('inlineSplitMode').value || 'personal';
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
      invoice: '',
      splitMode,
      settled: false
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
    document.querySelectorAll('#sidebarNav .tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-${tabId}`);
    });

    const titles = {
      dashboard: ['📊 財務總覽', '淨資產、今日可花額度、分帳待收與趨勢'],
      ledger: ['📅 明細與日曆熱力圖', '點選日期或對象篩選單日收支流水帳'],
      accounts: ['🏦 帳戶與外幣資產', '現金、外幣袋、共同基金與信用卡管理'],
      budgets: ['✉️ YNAB 信封預算池', '月度預算水位控管與夢想儲蓄目標'],
      projects: ['✈️ 專案、AA分帳與差旅報銷', '旅遊日均控管、情侶AA結算與公司報銷單'],
      invoices: ['🧾 雲端發票與自動對獎', '載具匯入與財政部開獎號碼一鍵比對'],
      city: ['🏙️ 記帳城市養成', '分類建築升級、市長等級 EXP 與成就圖鑑'],
      settings: ['⚙️ 主題、匯率與備份', '5大專屬主題、即時匯率設定與 CSV/JSON 匯出']
    };
    if (titles[tabId]) {
      document.getElementById('pageTitle').textContent = titles[tabId][0];
      document.getElementById('pageSubtitle').textContent = titles[tabId][1];
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Calculate pending AA splits & company reimbursements
  getPendingClaimsSummary() {
    let splitPending = 0;
    let reimbursePending = 0;
    let count = 0;

    this.state.transactions.forEach(t => {
      if (t.type !== 'expense' || t.settled) return;
      const twd = Number(t.twdAmount || t.amount || 0);
      if (t.splitMode === 'aa50') {
        splitPending += Math.round(twd * 0.5);
        count++;
      } else if (t.splitMode === 'advance100') {
        splitPending += twd;
        count++;
      } else if (t.splitMode === 'reimburse') {
        reimbursePending += twd;
        count++;
      }
    });

    return {
      splitPending,
      reimbursePending,
      totalPending: splitPending + reimbursePending,
      count
    };
  },

  // ================= SMART NATURAL LANGUAGE PARSER =================
  parseSmartInput(rawText) {
    const text = (rawText || '').trim();
    if (!text) return null;

    let currency = 'TWD';
    if (/JPY|日幣|日圓|円|yen/i.test(text)) currency = 'JPY';
    else if (/THB|泰銖|泰幣|銖|baht/i.test(text)) currency = 'THB';
    else if (/USD|美金|美元/i.test(text)) currency = 'USD';
    else if (/EUR|歐元/i.test(text)) currency = 'EUR';
    else if (/HKD|港幣/i.test(text)) currency = 'HKD';

    const mathMatch = text.match(/(\d+(?:[+\-*/]\d+)*(?:\.\d+)?)/);
    const amount = mathMatch ? this.evalMath(mathMatch[1]) : 0;
    const twdAmount = Math.round(amount * this.getFxRate(currency));

    let type = 'expense';
    let category = 'food';

    if (/薪水|薪資|本薪|獎金|年終|股息|配息|接案|外快|兼職|退稅入帳|收回|歸還|收入/.test(text)) {
      type = 'income';
      if (/股息|配息|股票|ETF/i.test(text)) category = 'invest_inc';
      else if (/獎金|年終|紅包|退稅/.test(text)) category = 'bonus';
      else if (/接案|外快|兼職|收回|歸還/.test(text)) category = 'side_hustle';
      else category = 'salary';
    } else if (/轉帳|繳卡費|換匯/.test(text)) {
      type = 'transfer';
      category = 'transfer';
    } else {
      if (/捷運|高鐵|公車|計程車|Uber|Grab|加油|停車|悠遊卡|TPASS|火車|機票|新幹線|夜車/i.test(text)) category = 'transport';
      else if (/全聯|好市多|Costco|蝦皮|網購|衣服|鞋子|百貨|日用品|伴手禮|免稅店|尿布/i.test(text)) category = 'shopping';
      else if (/房租|房貸|水電|電費|管理費|網路|飯店|住宿|青旅|Hostel|民宿/i.test(text)) category = 'home';
      else if (/電影|Netflix|Spotify|遊戲|門票|按摩|SPA|環球影城|USJ|樂園|約會/i.test(text)) category = 'entertainment';
      else if (/看診|掛號|醫院|診所|藥局|保健|藥妝|合利他命/i.test(text)) category = 'medical';
      else if (/書|課程|學費|幼兒園|才藝|進修|ChatGPT/i.test(text)) category = 'education';
      else category = 'food';
    }

    // Detect splitMode / reimbursement / family member
    let splitMode = 'personal';
    if (/報銷|公帳|出差|統編/.test(text)) splitMode = 'reimburse';
    else if (/AA|平分|一人一半/i.test(text)) splitMode = 'aa50';
    else if (/代墊|幫買|代買/.test(text)) splitMode = 'advance100';
    else if (/爸爸|老公/.test(text)) splitMode = 'member_dad';
    else if (/媽媽|老婆/.test(text)) splitMode = 'member_mom';
    else if (/寶貝|小孩|兒子|女兒/.test(text)) splitMode = 'member_kid';

    let account = this.state.accounts[0] || { id: 'acc_cash', name: '預設帳戶' };
    for (const acc of this.state.accounts) {
      const shortKeywords = [acc.name];
      if (acc.name.includes('泰銖')) shortKeywords.push('泰銖', 'THB');
      if (acc.name.includes('日幣')) shortKeywords.push('日幣', 'JPY');
      if (acc.name.includes('富邦')) shortKeywords.push('富邦', 'J卡');
      if (acc.name.includes('現金')) shortKeywords.push('現金');
      if (shortKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
        account = acc;
        break;
      }
    }

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
      splitMode,
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
    const splitInfo = SPLIT_MODES[parsed.splitMode];
    previewEl.innerHTML = `
      <span class="${badgeClass}">${parsed.type === 'income' ? '收入' : '支出'} ${fxLabel}</span>
      <span class="tag">${parsed.catMeta.icon} ${parsed.catMeta.name}</span>
      <span class="tag">🏦 ${parsed.account.name}</span>
      ${splitInfo && splitInfo.badge ? `<span class="tag">${splitInfo.badge}</span>` : ''}
      ${parsed.project ? `<span class="tag">✈️ ${parsed.project.name}</span>` : ''}
    `;
  },

  submitSmartInput() {
    const input = document.getElementById('smartInput');
    const parsed = this.parseSmartInput(input.value);
    if (!parsed || parsed.amount <= 0) {
      this.toast('請輸入包含金額的描述，如：手標泰奶 55 THB');
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
      invoice: '',
      splitMode: parsed.splitMode,
      settled: false
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
    document.getElementById('currentMonthLabel').textContent = `${this.currentYear}/${String(this.currentMonth).padStart(2, '0')}`;
    document.getElementById('sidebarStreak').textContent = `🔥 連續 ${this.state.streakDays || 1} 天`;

    // Highlight active persona chip
    document.querySelectorAll('#personaStrip .persona-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-persona') === (this.state.persona || 'travel'));
    });

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

    const filterAcc = document.getElementById('filterAccount');
    const prevAccVal = filterAcc.value || 'all';
    filterAcc.innerHTML = `<option value="all">所有帳戶</option>` +
      this.state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    filterAcc.value = prevAccVal;

    const accOptions = this.state.accounts.map(a => `<option value="${a.id}">${a.name} (${this.formatCurrency(a.balance)})</option>`).join('');
    document.getElementById('txAccount').innerHTML = accOptions + `<option value="__custom_acc__">➕ 自訂全新帳戶...</option>`;
    document.getElementById('txToAccount').innerHTML = accOptions;
    document.getElementById('subAccount').innerHTML = accOptions;
    document.getElementById('inlineAccount').innerHTML = this.state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

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

        const isExcluded = this.state.excludeProjectFromBudget && (t.projectId || t.splitMode === 'reimburse');
        if (!isExcluded) {
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
    const claims = this.getPendingClaimsSummary();

    document.getElementById('kpiNetWorth').textContent = this.formatCurrency(netWorth);
    document.getElementById('kpiNetWorthSub').innerHTML = `資產 ${this.formatCurrency(totalAssets)}｜負債 ${this.formatCurrency(totalLiabilities)}`;

    document.getElementById('kpiMonthExpense').textContent = this.formatCurrency(monthExpense);
    document.getElementById('kpiExpenseRatio').textContent = `預算 ${budgetRatio}%`;
    document.getElementById('kpiMonthIncomeSub').innerHTML = `收入：<strong class="font-mono-num" style="color: var(--color-income);">${this.formatCurrency(monthIncome)}</strong>`;

    document.getElementById('kpiSafeDaily').textContent = this.formatCurrency(safeDaily);
    document.getElementById('kpiSafeDailySub').textContent = `剩餘 ${this.formatCurrency(remainingBudget)} ÷ ${remainingDays}天`;

    document.getElementById('kpiPendingClaim').textContent = this.formatCurrency(claims.totalPending);
    document.getElementById('kpiPendingCount').textContent = `${claims.count}筆待收`;
    document.getElementById('kpiMonthBalanceSub').textContent = `本月結餘：${this.formatCurrency(monthBalance)}`;

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
    const w = 440;
    const h = 180;
    const padL = 44;
    const padR = 12;
    const padT = 14;
    const padB = 24;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const barW = Math.max(5, Math.floor(chartW / daysInMonth) - 4);

    let barsSvg = '';
    let cumPoints = [];
    let cumSum = 0;
    const totalExp = Math.max(1, dailyExp.reduce((a, b) => a + b, 0));

    for (let i = 0; i < daysInMonth; i++) {
      const x = padL + (i / daysInMonth) * chartW + 2;
      const expH = (dailyExp[i] / maxVal) * chartH;
      const yExp = padT + chartH - expH;
      cumSum += dailyExp[i];
      const cumY = padT + chartH - (cumSum / totalExp) * (chartH * 0.88);
      cumPoints.push(`${x + barW / 2},${cumY.toFixed(1)}`);

      if (dailyExp[i] > 0) {
        barsSvg += `<rect x="${x.toFixed(1)}" y="${yExp.toFixed(1)}" width="${barW}" height="${Math.max(3, expH).toFixed(1)}" rx="2.5" fill="var(--color-expense)" opacity="0.88"></rect>`;
      }
      if ((i + 1) % 5 === 0 || i === 0 || i === daysInMonth - 1) {
        barsSvg += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 5}" font-size="9" fill="var(--text-secondary)" text-anchor="middle">${i + 1}日</text>`;
      }
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width: 100%; height: 100%; overflow: visible;">
        <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="var(--border-color)" stroke-dasharray="3,3" />
        <line x1="${padL}" y1="${padT + chartH / 2}" x2="${w - padR}" y2="${padT + chartH / 2}" stroke="var(--border-color)" stroke-dasharray="3,3" />
        <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border-color)" />
        <text x="${padL - 5}" y="${padT + 4}" font-size="9" fill="var(--text-secondary)" text-anchor="end">${this.formatCurrency(maxVal)}</text>
        <text x="${padL - 5}" y="${padT + chartH / 2 + 4}" font-size="9" fill="var(--text-secondary)" text-anchor="end">${this.formatCurrency(maxVal / 2)}</text>
        <text x="${padL - 5}" y="${padT + chartH}" font-size="9" fill="var(--text-secondary)" text-anchor="end">$0</text>
        ${barsSvg}
        <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2.2" points="${cumPoints.join(' ')}" />
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
        <div style="color: var(--text-secondary); padding: 1rem 0; width: 100%; text-align: center;">
          <div style="margin-bottom: 0.5rem;">本月尚無支出紀錄</div>
          <button class="btn btn-primary btn-sm" onclick="App.openTxModal('expense', true)">➕ 新增空白記帳</button>
        </div>
      `;
      return;
    }

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const circles = entries.map(item => {
      const ratio = item.amount / totalExpense;
      const strokeLen = ratio * circumference;
      const seg = `<circle cx="72" cy="72" r="${radius}" fill="transparent" stroke="${item.meta.color}" stroke-width="18"
        stroke-dasharray="${strokeLen.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}" />`;
      offset += strokeLen;
      return seg;
    }).join('');

    const legendHtml = entries.map(item => {
      const pct = Math.round((item.amount / totalExpense) * 100);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.3rem 0.4rem; border-radius: 8px; cursor: pointer;"
             onclick="App.filterByCategoryFromChart('${item.meta.id}')">
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span style="width: 9px; height: 9px; border-radius: 50%; background: ${item.meta.color}; display: inline-block;"></span>
            <span style="font-size: 0.82rem; font-weight: 600;">${item.meta.icon} ${item.meta.name}</span>
          </div>
          <div class="font-mono-num" style="font-size: 0.8rem;">
            <strong>${this.formatCurrency(item.amount)}</strong>
            <span style="color: var(--text-secondary); margin-left: 0.25rem;">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="position: relative; width: 144px; height: 144px; flex-shrink: 0; margin: 0 auto;">
        <svg viewBox="0 0 144 144" style="transform: rotate(-90deg); width: 144px; height: 144px;">
          ${circles}
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <span style="font-size: 0.68rem; color: var(--text-secondary);">總支出</span>
          <strong class="font-mono-num" style="font-size: 0.9rem;">${this.formatCurrency(totalExpense)}</strong>
        </div>
      </div>
      <div style="flex: 1; min-width: 190px;">
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
        <div style="color: var(--text-secondary); padding: 1.25rem 0; text-align: center;">
          <div style="margin-bottom: 0.5rem;">目前為全新空白帳本</div>
          <button class="btn btn-primary btn-sm" onclick="App.openTxModal('expense', true)">➕ 新增第一筆空白紀錄</button>
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
        <div style="margin-bottom: 0.7rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.22rem;">
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
    const splitInfo = SPLIT_MODES[t.splitMode || 'personal'];
    const isInc = t.type === 'income';
    const isTrans = t.type === 'transfer';
    const sign = isInc ? '+' : isTrans ? '⇄' : '-';
    const amtColor = isInc ? 'var(--color-income)' : isTrans ? 'var(--color-transfer)' : 'var(--color-expense)';

    const formattedNote = (t.note || cat.name).replace(/#([^\s#]+)/g, '<span class="tag">#$1</span>');

    return `
      <div class="tx-row">
        <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0;">
          <div class="cat-icon" style="background: ${cat.color}22; color: ${cat.color};">${cat.icon}</div>
          <div style="min-width: 0;">
            <div style="font-weight: 600; font-size: 0.86rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${formattedNote}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; margin-top: 0.12rem;">
              <span class="font-mono-num">${t.date.slice(5)}</span>
              <span>• ${acc.name}</span>
              ${splitInfo && splitInfo.badge ? `<span class="tag">${t.settled ? '✅已結清' : splitInfo.badge}</span>` : ''}
              ${proj ? `<span class="tag">✈️ ${proj.name.slice(0, 8)}</span>` : ''}
              ${t.invoice ? `<span class="tag font-mono-num">🧾 ${t.invoice}</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0;">
          <div style="text-align: right; margin-right: 0.15rem;">
            <div class="font-mono-num" style="font-weight: 700; font-size: 0.92rem; color: ${amtColor};">
              ${sign}${this.formatCurrency(t.twdAmount || t.amount)}
            </div>
            ${t.currency && t.currency !== 'TWD' ? `<div class="font-mono-num" style="font-size: 0.68rem; color: #38bdf8;">${t.currency} ${Number(t.amount).toLocaleString()}</div>` : ''}
          </div>
          ${allowActions ? `
            <button class="btn btn-ghost btn-sm" style="padding: 0.25rem 0.35rem;" onclick="App.editTransaction('${t.id}')">✏️</button>
            <button class="btn btn-ghost btn-sm" style="padding: 0.25rem 0.35rem;" onclick="App.deleteTransaction('${t.id}')">🗑️</button>
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
            <span class="font-mono-num" style="font-size: 0.72rem; font-weight: 700;">${d}</span>
            ${info.count > 0 ? `<span style="font-size: 0.58rem; color: var(--text-secondary);">${info.count}筆</span>` : ''}
          </div>
          <div style="font-size: 0.62rem; text-align: right; line-height: 1.2;">
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
    const splitFilterEl = document.getElementById('filterSplitMode');
    const splitFilter = splitFilterEl ? splitFilterEl.value : 'all';

    const filtered = this.getMonthTransactions().filter(t => {
      if (this.selectedCalendarDate && t.date !== this.selectedCalendarDate) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (catFilter !== 'all' && t.category !== catFilter) return false;
      if (accFilter !== 'all' && t.accountId !== accFilter) return false;
      if (splitFilter !== 'all' && (t.splitMode || 'personal') !== splitFilter) return false;
      if (keyword) {
        const hay = `${t.note || ''} ${t.invoice || ''} ${t.currency || ''} ${this.getCategoryMeta(t.category).name}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
    document.getElementById('filteredSummaryBadge').textContent =
      `${this.selectedCalendarDate ? `${this.selectedCalendarDate.slice(5)}｜` : ''}${filtered.length}筆｜-${this.formatCurrency(totalExp)}`;

    const container = document.getElementById('ledgerListContainer');
    if (!filtered.length) {
      container.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-secondary);">
          <div style="margin-bottom: 0.5rem;">無符合條件的帳務紀錄</div>
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
    document.getElementById('txSplitMode').value = tx.splitMode || 'personal';
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
    this.toast('🗑️ 已刪除該筆帳務並回補帳戶餘額');
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
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem;">
        <div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">🏛️ 淨資產總額</div>
          <div class="font-mono-num" style="font-size: 1.3rem; font-weight: 800; color: var(--accent-primary);">${this.formatCurrency(netWorth)}</div>
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">⚖️ 資產負債比</div>
          <div class="font-mono-num" style="font-size: 1.3rem; font-weight: 700; color: ${debtRatio < 30 ? 'var(--color-income)' : 'var(--color-warning)'};">${debtRatio}%</div>
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">🟢 總資產</div>
          <div class="font-mono-num" style="font-size: 1.1rem; font-weight: 700; color: var(--color-income);">${this.formatCurrency(assets)}</div>
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">🔴 總負債</div>
          <div class="font-mono-num" style="font-size: 1.1rem; font-weight: 700; color: var(--color-expense);">${this.formatCurrency(liabilities)}</div>
        </div>
      </div>
    `;

    const typeMeta = {
      cash: { icon: '💵', label: '現金 / 外幣袋' },
      bank: { icon: '🏦', label: '銀行 / 共同基金' },
      epay: { icon: '📱', label: '行動支付 / 票證' },
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
        <div class="card" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.45rem;">
            <div style="display: flex; align-items: center; gap: 0.55rem;">
              <div class="cat-icon" style="background: rgba(99, 102, 241, 0.14);">${m.icon}</div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem;">${acc.name}</div>
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

          <div class="font-mono-num" style="font-size: 1.35rem; font-weight: 800; color: ${isCredit ? 'var(--color-expense)' : 'var(--text-primary)'}; margin: 0.35rem 0;">
            ${this.formatCurrency(acc.balance)}
          </div>

          ${acc.limit > 0 ? `
            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: flex; justify-content: space-between;">
              <span>額度使用率 (${limitPct}%)</span>
              <span class="font-mono-num">上限 ${this.formatCurrency(acc.limit)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${limitPct}%; background: ${limitPct > 70 ? '#f43f5e' : '#38bdf8'};"></div>
            </div>
          ` : ''}
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
      invoice: '',
      splitMode: 'personal'
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
    this.toast(checked ? '✈️ 已將專案與公司公帳排除於日常信封預算外' : '📊 已將所有支出併入日常信封預算計算');
  },

  renderBudgetsAndGoals() {
    const monthTxs = this.getMonthTransactions();
    const catSpent = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      if (this.state.excludeProjectFromBudget && (t.projectId || t.splitMode === 'reimburse')) return;
      catSpent[t.category] = (catSpent[t.category] || 0) + Number(t.twdAmount || t.amount || 0);
    });

    const expCats = this.getAllCategoriesByType('expense');
    const totalBudget = expCats.reduce((s, c) => s + Number(this.state.budgets[c.id] || c.defaultBudget || 0), 0);
    const totalSpent = Object.values(catSpent).reduce((s, v) => s + v, 0);
    const totalRemain = totalBudget - totalSpent;

    document.getElementById('ynabTotalPoolBanner').innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">總預算池</div>
          <div class="font-mono-num" style="font-size: 1.08rem; font-weight: 800;">${this.formatCurrency(totalBudget)}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">已動用</div>
          <div class="font-mono-num" style="font-size: 1.08rem; font-weight: 700; color: var(--color-expense);">${this.formatCurrency(totalSpent)}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">剩餘可用</div>
          <div class="font-mono-num" style="font-size: 1.08rem; font-weight: 700; color: ${totalRemain >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">${this.formatCurrency(totalRemain)}</div>
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
        <div style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <span style="font-size: 1.05rem;">${cat.icon}</span>
              <strong style="font-size: 0.85rem;">${cat.name}</strong>
              <span class="tag" style="cursor: pointer;" onclick="App.promptEditBudget('${cat.id}', '${cat.name}', ${budget})">✏️ 改上限</span>
            </div>
            <div class="font-mono-num" style="font-size: 0.78rem;">
              <strong>${this.formatCurrency(spent)}</strong> / ${this.formatCurrency(budget)}
              <span style="margin-left: 0.3rem; color: ${statusColor}; font-weight: 700;">
                (${remain >= 0 ? `剩${this.formatCurrency(remain)}` : `超支${this.formatCurrency(Math.abs(remain))}`})
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
      goalsEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.25rem; text-align: center;">尚無儲蓄目標</div>`;
      return;
    }

    goalsEl.innerHTML = this.state.goals.map(g => {
      const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
      return `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">${g.icon || '🎯'}</span>
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">${g.name}</div>
                <div class="font-mono-num" style="font-size: 0.74rem; color: var(--text-secondary);">
                  ${this.formatCurrency(g.current)} / ${this.formatCurrency(g.target)} (${pct}%)
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.25rem;">
              <button class="btn btn-secondary btn-sm" onclick="App.contributeToGoal('${g.id}')">+$5k</button>
              <button class="btn btn-ghost btn-sm" onclick="App.deleteGoal('${g.id}')">🗑️</button>
            </div>
          </div>
          <div class="progress-track">
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
        .filter(t => t.type === 'expense' && t.category === cat.id && (!this.state.excludeProjectFromBudget || (!t.projectId && t.splitMode !== 'reimburse')))
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

  // ================= 5. PROJECTS, SPLIT BILLS, REIMBURSEMENTS & SUBS =================
  renderProjectsAndSubscriptions() {
    // 5A. Render Split & Business Reimbursement Hub
    const claims = this.getPendingClaimsSummary();
    const hubEl = document.getElementById('splitAndClaimHub');
    hubEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: var(--text-secondary);">💑 情侶AA / 旅伴代墊待收</div>
          <div class="font-mono-num" style="font-size: 1.2rem; font-weight: 800; color: #f472b6; margin: 0.25rem 0;">${this.formatCurrency(claims.splitPending)}</div>
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="App.settleAllSplits()" ${claims.splitPending <= 0 ? 'disabled style="opacity:0.4;width:100%;"' : ''}>
            ⚡ 一鍵收款結清
          </button>
        </div>
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: var(--text-secondary);">💼 公司差旅待報銷請款</div>
          <div class="font-mono-num" style="font-size: 1.2rem; font-weight: 800; color: #38bdf8; margin: 0.25rem 0;">${this.formatCurrency(claims.reimbursePending)}</div>
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="App.settleAllReimbursements()" ${claims.reimbursePending <= 0 ? 'disabled style="opacity:0.4;width:100%;"' : ''}>
            ⚡ 公司撥款入帳
          </button>
        </div>
      </div>
    `;

    // 5B. Render Projects (with Backpacker Daily Cap monitor)
    const projEl = document.getElementById('projectsListContainer');
    if (!this.state.projects.length) {
      projEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.25rem; text-align: center;">尚無專案，點右上角「＋ 新增專案」建立</div>`;
    } else {
      projEl.innerHTML = this.state.projects.map(p => {
        const projTxs = this.state.transactions.filter(t => t.projectId === p.id);
        const expTxs = projTxs.filter(t => t.type === 'expense');
        const grossSpent = expTxs.reduce((s, t) => s + Number(t.twdAmount || t.amount || 0), 0);
        const pct = p.budget > 0 ? Math.min(100, Math.round((grossSpent / p.budget) * 100)) : 0;

        const distinctDays = new Set(expTxs.map(t => t.date)).size || 1;
        const avgPerDay = Math.round(grossSpent / distinctDays);
        const overDailyCap = p.dailyCap > 0 && avgPerDay > p.dailyCap;
        const isExpanded = this.expandedProjectId === p.id;

        return `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.45rem; gap: 0.4rem;">
              <div style="cursor: pointer;" onclick="App.toggleProjectDetail('${p.id}')">
                <div style="font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                  <span>${p.name}</span>
                  <span class="tag">${isExpanded ? '▲ 收合' : '▼ 明細'}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.15rem;">
                  ${expTxs.length}筆 (${distinctDays}天) ｜ 日均 <strong class="font-mono-num" style="color:${overDailyCap ? '#f43f5e' : 'var(--text-primary)'}">${this.formatCurrency(avgPerDay)}/天</strong>
                  ${p.dailyCap > 0 ? `<span class="tag">${overDailyCap ? '⚠️超日均上限' : `日上限${this.formatCurrency(p.dailyCap)}`}</span>` : ''}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.25rem;">
                <div class="font-mono-num" style="text-align: right;">
                  <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-expense);">${this.formatCurrency(grossSpent)}</div>
                  <div style="font-size: 0.68rem; color: var(--text-secondary);">/${this.formatCurrency(p.budget)}</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="App.deleteProject('${p.id}')">🗑️</button>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: ${pct > 90 ? '#f43f5e' : 'var(--accent-primary)'};"></div>
            </div>

            ${isExpanded ? `
              <div style="margin-top: 0.7rem; padding-top: 0.6rem; border-top: 1px dashed var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <span style="font-size: 0.76rem; font-weight: 700;">📋 專案明細 (${projTxs.length}筆)</span>
                  <button class="btn btn-primary btn-sm" onclick="App.openTxModalForProject('${p.id}')">＋ 記此專案</button>
                </div>
                <div style="max-height: 240px; overflow-y: auto;">
                  ${projTxs.length ? projTxs.map(t => this.buildTxRowHtml(t, true)).join('') : '<div style="font-size:0.76rem;color:var(--text-secondary);">尚無專案交易</div>'}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // 5C. Subscriptions
    let monthlyTotal = 0;
    this.state.subscriptions.forEach(s => {
      monthlyTotal += s.cycle === 'yearly' ? s.amount / 12 : s.amount;
    });
    const yearlyTotal = monthlyTotal * 12;

    document.getElementById('subSummaryBanner').innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">每月固定扣款</div>
          <div class="font-mono-num" style="font-size: 1.12rem; font-weight: 800; color: #f59e0b;">${this.formatCurrency(monthlyTotal)} / 月</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.7rem; color: var(--text-secondary);">年度總成本</div>
          <div class="font-mono-num" style="font-size: 1.05rem; font-weight: 700;">${this.formatCurrency(yearlyTotal)} / 年</div>
        </div>
      </div>
    `;

    const subEl = document.getElementById('subscriptionsListContainer');
    if (!this.state.subscriptions.length) {
      subEl.innerHTML = `<div style="color: var(--text-secondary); padding: 1.25rem; text-align: center;">尚無固定訂閱項目</div>`;
    } else {
      subEl.innerHTML = this.state.subscriptions.map(sub => {
        const acc = this.getAccountById(sub.accountId);
        return `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.7rem 0.8rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <div>
              <div style="font-weight: 700; font-size: 0.86rem;">🔁 ${sub.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">每月 ${sub.day} 號 • ${acc.name}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <strong class="font-mono-num" style="font-size: 0.88rem; color: var(--color-expense);">${this.formatCurrency(sub.amount)}</strong>
              <button class="btn btn-secondary btn-sm" onclick="App.recordSubscriptionNow('${sub.id}')">⚡入帳</button>
              <button class="btn btn-ghost btn-sm" onclick="App.deleteSubscription('${sub.id}')">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  settleAllSplits() {
    const claims = this.getPendingClaimsSummary();
    if (claims.splitPending <= 0) return;
    const bankAcc = this.state.accounts.find(a => a.type === 'bank' || a.type === 'epay') || this.state.accounts[0];
    this.state.transactions.forEach(t => {
      if (!t.settled && (t.splitMode === 'aa50' || t.splitMode === 'advance100')) {
        t.settled = true;
      }
    });
    const tx = {
      id: 'tx_' + Date.now(),
      type: 'income',
      amount: claims.splitPending,
      currency: 'TWD',
      twdAmount: claims.splitPending,
      category: 'side_hustle',
      accountId: bankAcc.id,
      date: this.getTodayDateStr(),
      note: '收回情侶AA與朋友代墊分帳款 #分帳結清',
      projectId: '',
      invoice: '',
      splitMode: 'personal',
      settled: true
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`💑 已一鍵收回分帳代墊款 ${this.formatCurrency(claims.splitPending)} 並存入【${bankAcc.name}】！`);
  },

  settleAllReimbursements() {
    const claims = this.getPendingClaimsSummary();
    if (claims.reimbursePending <= 0) return;
    const bankAcc = this.state.accounts.find(a => a.type === 'bank') || this.state.accounts[0];
    this.state.transactions.forEach(t => {
      if (!t.settled && t.splitMode === 'reimburse') {
        t.settled = true;
      }
    });
    const tx = {
      id: 'tx_' + Date.now(),
      type: 'income',
      amount: claims.reimbursePending,
      currency: 'TWD',
      twdAmount: claims.reimbursePending,
      category: 'side_hustle',
      accountId: bankAcc.id,
      date: this.getTodayDateStr(),
      note: '公司差旅報銷請款撥款入帳 #報銷結清',
      projectId: '',
      invoice: '',
      splitMode: 'personal',
      settled: true
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`💼 公司差旅報銷款 ${this.formatCurrency(claims.reimbursePending)} 已撥款入帳【${bankAcc.name}】！`);
  },

  exportReimbursementCSV() {
    const list = this.state.transactions.filter(t => t.splitMode === 'reimburse');
    if (!list.length) {
      this.toast('⚠️ 目前帳本中沒有標記為「💼 公司報銷」的差旅項目');
      return;
    }
    const headers = ['消費日期', '費用分類', '申請報銷金額(TWD)', '原幣別', '原幣金額', '統一發票/憑證', '結清狀態', '差旅說明與備註'];
    const rows = list.map(t => [
      t.date,
      this.getCategoryMeta(t.category).name,
      t.twdAmount || t.amount,
      t.currency || 'TWD',
      t.amount,
      t.invoice || '海外收據憑證',
      t.settled ? '已撥款' : '待請款',
      `"${String(t.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `公司差旅費用報銷單_${this.currentYear}_${this.currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast(`📤 已匯出 ${list.length} 筆公司差旅報銷單 (.csv)`);
  },

  toggleProjectDetail(projId) {
    this.expandedProjectId = (this.expandedProjectId === projId) ? null : projId;
    this.renderProjectsAndSubscriptions();
  },

  openTxModalForProject(projId) {
    this.openTxModal('expense', true);
    document.getElementById('txProject').value = projId;
  },

  deleteProject(projId) {
    const p = this.state.projects.find(x => x.id === projId);
    if (!p || !confirm(`確定要刪除專案【${p.name}】嗎？`)) return;
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
      note: `${sub.name} #固定扣款`,
      projectId: '',
      invoice: '',
      splitMode: 'personal'
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`🔁 已將【${sub.name}】記入本月帳本`);
  },

  // ================= 6. TAIWAN CLOUD INVOICES =================
  renderInvoices() {
    const invTxs = this.state.transactions.filter(t => t.invoice && t.invoice.trim() !== '');
    document.getElementById('invoiceCountBadge').textContent = `${invTxs.length} 張雲端發票`;

    const el = document.getElementById('invoiceListContainer');
    if (!invTxs.length) {
      el.innerHTML = `<div style="color: var(--text-secondary); padding: 1.5rem; text-align: center;">目前尚無附帶發票號碼的交易</div>`;
      return;
    }

    el.innerHTML = invTxs.map(t => `
      <div class="tx-row">
        <div>
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span class="tag font-mono-num" style="font-size: 0.78rem; font-weight: 700;">🧾 ${t.invoice}</span>
            <strong style="font-size: 0.86rem;">${t.note || '消費發票'}</strong>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.15rem;">
            ${t.date} ｜ ${this.getAccountById(t.accountId).name}
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
      { note: '7-ELEVEN 超商拿鐵與御飯糰 #載具匯入', amount: 95, cat: 'food', inv: 'TW-59283741' },
      { note: '全聯福利中心家庭生鮮採買 #載具匯入', amount: 640, cat: 'shopping', inv: 'TW-10482519' },
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
      invoice: pick.inv,
      splitMode: 'personal'
    };
    this.applyTxAccountBalance(tx, 1);
    this.state.transactions.unshift(tx);
    this.saveState();
    this.renderAll();
    this.toast(`📲 已同步匯入雲端發票【${pick.inv}】`);
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
      resEl.innerHTML = `<div style="padding: 0.65rem; background: rgba(148,163,184,0.12); border-radius: 8px; font-size: 0.8rem;">已完成 ${invTxs.length} 張雲端發票比對，目前尚未對中號碼。</div>`;
    } else {
      resEl.innerHTML = winners.map(w => `
        <div style="padding: 0.65rem; background: rgba(16, 185, 129, 0.16); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 0.4rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #10b981; font-size: 0.85rem;">${w.prize}</strong>
            <div style="font-size: 0.75rem;">發票：<span class="font-mono-num">${w.tx.invoice}</span>（${w.tx.note}）</div>
          </div>
          <span class="badge-income">中獎！</span>
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
          <div style="font-weight: 700; font-size: 0.82rem; color: #fff;">${c.building || (c.name + '大樓')}</div>
          <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 0.1rem;">${c.name}園區</div>
          <div style="margin-top: 0.35rem;">
            <span class="tag" style="background: rgba(16,185,129,0.22); color: #6ee7b7;">Lv.${bLv} (${count}筆)</span>
          </div>
        </div>
      `;
    }).join('');

    const achievements = [
      { title: '🔥 記帳初心者', desc: '累計完成 5 筆收支記帳', unlocked: allTxs.length >= 5 },
      { title: '🏙️ 都會建築師', desc: '城市市長等級達到 Lv.3', unlocked: cityLevel >= 3 },
      { title: '🏦 百萬資產掌門人', desc: '總淨資產突破 $1,000,000', unlocked: this.state.accounts.reduce((s, a) => s + a.balance, 0) >= 1000000 },
      { title: '✈️ 跨國旅人記帳王', desc: '完成外幣 (JPY/THB/USD) 跨國記帳', unlocked: allTxs.some(t => t.currency && t.currency !== 'TWD') },
      { title: '⚖️ 分帳與報銷達人', desc: '使用情侶AA分帳或商務差旅報銷標記', unlocked: allTxs.some(t => t.splitMode && t.splitMode !== 'personal') },
      { title: '🛡️ YNAB 零基守護者', desc: '建立夢想儲蓄目標池', unlocked: this.state.goals.length >= 1 }
    ];

    document.getElementById('cityAchievementsGrid').innerHTML = achievements.map(a => `
      <div style="padding: 0.75rem; border-radius: 12px; border: 1px solid ${a.unlocked ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}; background: ${a.unlocked ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
          <strong style="font-size: 0.86rem;">${a.title}</strong>
          <span class="${a.unlocked ? 'badge-income' : 'tag'}">${a.unlocked ? '已解鎖' : '進行中'}</span>
        </div>
        <div style="font-size: 0.74rem; color: var(--text-secondary);">${a.desc}</div>
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
    document.getElementById('txSplitMode').value = 'personal';
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
    document.getElementById('typeBtnExpense').className = `btn btn-sm ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`;
    document.getElementById('typeBtnIncome').className = `btn btn-sm ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`;
    document.getElementById('typeBtnTransfer').className = `btn btn-sm ${type === 'transfer' ? 'btn-primary' : 'btn-secondary'}`;

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
      preview.textContent = `🧮 ${val} ${currency} (匯率 ${rate}) ➔ 折合新台幣 ${this.formatCurrency(twd)}`;
    } else if (/[+\-*/]/.test(raw)) {
      preview.textContent = `🧮 算式結果：${this.formatCurrency(val)}`;
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
    const splitMode = document.getElementById('txSplitMode').value || 'personal';
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
          invoice,
          splitMode,
          settled: this.state.transactions[oldIdx].settled || false
        };
        this.applyTxAccountBalance(updatedTx, 1);
        this.state.transactions[oldIdx] = updatedTx;
        this.saveState();
        this.closeModal('txModal');
        this.renderAll();
        this.toast(`✅ 已更新：${note} (${this.formatCurrency(twdAmount)})`);
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
      invoice,
      splitMode,
      settled: false
    };

    this.applyTxAccountBalance(newTx, 1);
    this.state.transactions.unshift(newTx);
    this.saveState();
    this.closeModal('txModal');
    this.renderAll();
    this.toast(`✅ 已入帳：${note} (${this.formatCurrency(twdAmount)})`);
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
    document.getElementById('projDailyCap').value = '';
    document.getElementById('projectModal').classList.add('open');
  },

  saveProject(e) {
    e.preventDefault();
    const name = document.getElementById('projName').value.trim();
    const budget = Number(document.getElementById('projBudget').value || 0);
    const dailyCap = Number(document.getElementById('projDailyCap').value || 0);
    if (!name) return;

    this.state.projects.push({
      id: 'proj_' + Date.now(),
      name,
      budget,
      dailyCap
    });
    this.saveState();
    this.closeModal('projectModal');
    this.renderAll();
    this.toast(`✈️ 已建立獨立專案【${name}】`);
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

  // ================= BLANK LEDGER / EXPORT =================
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
          this.applyThemeAttr(this.state.theme || 'obsidian');
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
    const headers = ['日期', '類型', '分類', '金額(TWD)', '原幣別', '原幣金額', '帳戶', '對象/分帳報銷', '專案', '發票號碼', '備註與標籤'];
    const rows = this.state.transactions.map(t => [
      t.date,
      t.type === 'income' ? '收入' : t.type === 'transfer' ? '轉帳' : '支出',
      this.getCategoryMeta(t.category).name,
      t.twdAmount || t.amount,
      t.currency || 'TWD',
      t.amount,
      this.getAccountById(t.accountId).name,
      SPLIT_MODES[t.splitMode || 'personal']?.label || '個人',
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
    }, 3000);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
