const app = getApp();

Page({
  data: {
    records: [],
    totalIncome: 0,
    totalExpense: 0,
    allRecords: [], // 存储所有未筛选的记录
    showFilter: false, // 控制筛选面板显示
    filterYear: "", // 筛选年份
    filterMonth: "", // 筛选月份
    years: [], // 可选年份列表
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 月份列表
    activeFilter: "all", // 当前筛选状态：all, year, month
    categoryIcons: {
      income: {
        工资: "💰",
        奖金: "🎁",
        兼职: "💼",
        其他: "📝",
      },
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
  },

  onShow: function () {
    this.loadAllRecords();
    this.initYearList();
  },

  // 初始化年份列表
  initYearList: function () {
    const records = app.globalData.records || [];
    const years = new Set();

    // 从记录中提取不同的年份
    records.forEach((record) => {
      if (record.date) {
        const year = new Date(record.date).getFullYear();
        years.add(year);
      }
    });

    // 转换为数组并排序
    const yearArray = Array.from(years).sort((a, b) => b - a); // 降序排列

    this.setData({
      years: yearArray,
    });
  },

  // 加载所有记录
  loadAllRecords: function () {
    const records = app.globalData.records || [];

    // 对记录进行排序：先按日期降序，相同日期的按添加顺序降序
    records.sort((a, b) => {
      // 首先按日期比较
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA; // 降序排列，最新的日期在前
      }
      // 如果日期相同，按添加顺序排序（假设最新添加的在数组前面）
      return 0;
    });

    // 为每条记录添加格式化的日期显示和年月信息
    const formattedRecords = records.map((record) => {
      const date = new Date(record.date);
      return {
        ...record,
        formattedDate: this.formatDate(record.date),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    });

    this.setData({
      allRecords: formattedRecords,
    });

    // 应用当前筛选条件
    this.applyFilter();
  },

  // 应用筛选器
  applyFilter: function () {
    const { allRecords, filterYear, filterMonth, activeFilter } = this.data;
    let filteredRecords = [];

    // 根据筛选条件过滤记录
    if (activeFilter === "all") {
      filteredRecords = allRecords;
    } else if (activeFilter === "year" && filterYear) {
      filteredRecords = allRecords.filter(
        (record) => record.year === filterYear
      );
    } else if (activeFilter === "month" && filterYear && filterMonth) {
      filteredRecords = allRecords.filter(
        (record) => record.year === filterYear && record.month === filterMonth
      );
    } else {
      filteredRecords = allRecords;
    }

    // 计算总收入和支出
    let totalIncome = 0;
    let totalExpense = 0;

    filteredRecords.forEach((record) => {
      if (record.type === "income") {
        totalIncome += parseFloat(record.amount);
      } else {
        totalExpense += parseFloat(record.amount);
      }
    });

    this.setData({
      records: filteredRecords,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
    });
  },

  // 显示筛选面板
  showFilterPanel: function () {
    this.setData({
      showFilter: true,
    });
  },

  // 隐藏筛选面板
  hideFilterPanel: function () {
    this.setData({
      showFilter: false,
    });
  },

  // 选择筛选年份
  selectYear: function (e) {
    const year = parseInt(e.currentTarget.dataset.year);

    this.setData({
      filterYear: year,
      activeFilter: this.data.filterMonth ? "month" : "year",
    });

    this.applyFilter();
    this.hideFilterPanel();
  },

  // 选择筛选月份
  selectMonth: function (e) {
    const month = parseInt(e.currentTarget.dataset.month);

    this.setData({
      filterMonth: month,
      activeFilter: "month",
    });

    this.applyFilter();
    this.hideFilterPanel();
  },

  // 清除筛选
  clearFilter: function () {
    this.setData({
      filterYear: "",
      filterMonth: "",
      activeFilter: "all",
    });

    this.applyFilter();
    this.hideFilterPanel();
  },

  formatDate: function (dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  deleteRecord: function (e) {
    const index = e.currentTarget.dataset.index;
    const records = this.data.records;
    const recordToDelete = records[index];

    // 从全局数据中找到并删除该记录
    const allRecords = app.globalData.records;
    const globalIndex = allRecords.findIndex(
      (r) =>
        r.date === recordToDelete.date &&
        r.amount === recordToDelete.amount &&
        r.category === recordToDelete.category &&
        r.type === recordToDelete.type
    );

    if (globalIndex !== -1) {
      allRecords.splice(globalIndex, 1);
      app.globalData.records = allRecords;
      wx.setStorageSync("records", allRecords);
    }

    // 重新加载记录并应用筛选条件
    this.loadAllRecords();
  },
});
