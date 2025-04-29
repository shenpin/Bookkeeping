const app = getApp();

Page({
  data: {
    selectedMonth: "", // 当前选中的月份，格式：YYYY-MM
    expenseCategories: [], // 支出分类列表
    budgets: {
      // 预算数据
      expense: {}, // {category: {month: amount}}
    },
    budgetUsage: [], // 预算使用情况
    categoryIcons: {
      expense: {
        餐饮: "🍔",
        交通: "🚕",
        购物: "🛍️",
        娱乐: "🎮",
        住房: "🏠",
        医疗: "💊",
        其他: "📋",
      },
    },
    editingValue: {}, // 暂存输入的预算值
  },

  onLoad() {
    this.loadCategories();
    this.loadBudgets();
    // 设置当前月份为默认选中
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    this.setData({ selectedMonth: currentMonth });
    this.initEditingValue(currentMonth);
  },

  onShow() {
    this.loadBudgets();
    this.calculateBudgetUsage();
    this.initEditingValue(this.data.selectedMonth);
  },

  // 加载分类
  loadCategories() {
    const records = app.globalData.records || [];
    const expenseSet = new Set();

    // 从记录中获取所有使用过的分类
    records.forEach((record) => {
      if (record.type === "expense") expenseSet.add(record.category);
    });

    // 添加默认分类
    const defaultExpense = [
      "餐饮",
      "交通",
      "购物",
      "娱乐",
      "住房",
      "医疗",
      "其他",
    ];
    defaultExpense.forEach((c) => expenseSet.add(c));

    this.setData({
      expenseCategories: Array.from(expenseSet),
    });
  },

  // 加载预算数据
  loadBudgets() {
    const budgets = wx.getStorageSync("budgets") || { expense: {} };
    this.setData({ budgets });
  },

  // 初始化当前月份的输入暂存
  initEditingValue(month) {
    const editingValue = {};
    const { expenseCategories, budgets } = this.data;
    expenseCategories.forEach((category) => {
      editingValue[category] =
        budgets.expense[category] &&
        budgets.expense[category][month] !== undefined
          ? budgets.expense[category][month]
          : "";
    });
    this.setData({ editingValue });
  },

  // 月份选择改变
  onMonthChange(e) {
    const month = e.detail.value;
    this.setData({ selectedMonth: month });
    this.calculateBudgetUsage();
    this.initEditingValue(month);
  },

  // 预算输入暂存
  onBudgetInput(e) {
    const { category } = e.currentTarget.dataset;
    const value = e.detail.value;
    const editingValue = this.data.editingValue;
    editingValue[category] = value;
    this.setData({ editingValue });
  },

  // 批量保存所有分类预算
  saveAllBudgets() {
    const { editingValue, budgets, selectedMonth, expenseCategories } =
      this.data;
    expenseCategories.forEach((category) => {
      if (!budgets.expense[category]) budgets.expense[category] = {};
      budgets.expense[category][selectedMonth] = editingValue[category]
        ? Number(editingValue[category])
        : "";
    });
    this.setData({ budgets });
    wx.setStorageSync("budgets", budgets);
    this.calculateBudgetUsage();
    wx.showToast({ title: "保存成功", icon: "success" });
  },

  // 计算预算使用情况
  calculateBudgetUsage() {
    if (!this.data.selectedMonth) return;

    const records = app.globalData.records || [];
    const [year, month] = this.data.selectedMonth.split("-");
    const budgetUsage = [];

    // 计算支出预算使用情况
    this.data.expenseCategories.forEach((category) => {
      const budget =
        this.data.budgets.expense[category]?.[this.data.selectedMonth];
      if (!budget) return;

      const actual = records
        .filter((r) => r.type === "expense" && r.category === category)
        .filter((r) => {
          const recordDate = new Date(r.date);
          return (
            recordDate.getFullYear() === Number(year) &&
            recordDate.getMonth() + 1 === Number(month)
          );
        })
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const status =
        actual > budget ? "over" : actual < budget ? "under" : "equal";
      const statusText =
        status === "over" ? "超出" : status === "under" ? "剩余" : "刚好";

      budgetUsage.push({
        category,
        icon: this.data.categoryIcons.expense[category] || "📊",
        budget,
        actual: actual.toFixed(2),
        status,
        statusText: `${statusText} ¥${Math.abs(actual - budget).toFixed(2)}`,
      });
    });

    this.setData({ budgetUsage });
  },
});
