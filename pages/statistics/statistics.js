const app = getApp();

// 扇形图颜色列表
const COLORS = [
  "#36B37E",
  "#00B8D9",
  "#6554C0",
  "#FFAB00",
  "#FF5630",
  "#4C9AFF",
  "#00C7E6",
  "#9575CD",
  "#FFD700",
  "#EF5350",
  "#2ECC71",
  "#3498DB",
  "#9B59B6",
  "#F1C40F",
  "#E74C3C",
];

Page({
  data: {
    records: [],
    allRecords: [], // 存储所有未筛选的记录
    activeType: "expense", // 默认显示支出统计
    incomeCategories: {},
    expenseCategories: {},
    incomeCategoriesArray: [],
    expenseCategoriesArray: [],
    totalIncome: 0,
    totalExpense: 0,
    // 筛选相关
    showFilter: false, // 控制筛选面板显示
    filterYear: "", // 筛选年份
    filterMonth: "", // 筛选月份
    years: [], // 可选年份列表
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 月份列表
    activeFilter: "all", // 当前筛选状态：all, year, month
    // 添加分类图标
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

  onLoad: function () {
    // 在页面加载时初始化
    this.loadAllRecords();
    this.initYearList();
  },

  onShow: function () {
    // 每次显示页面时刷新数据
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

  // 切换到支出统计
  switchToExpense: function () {
    this.setData({
      activeType: "expense",
    });
    this.calculateStatistics();
    this.drawPieChart();
  },

  // 切换到收入统计
  switchToIncome: function () {
    this.setData({
      activeType: "income",
    });
    this.calculateStatistics();
    this.drawPieChart();
  },

  // 加载所有记录
  loadAllRecords: function () {
    const records = app.globalData.records || [];

    // 为每条记录添加年月信息
    const formattedRecords = records.map((record) => {
      const date = new Date(record.date);
      return {
        ...record,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    });

    this.setData({
      allRecords: formattedRecords,
    });

    // 应用当前筛选条件，计算统计数据
    this.applyFilter();
  },

  // 应用筛选条件
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

    this.setData({
      records: filteredRecords,
    });

    // 基于筛选后的记录计算统计数据
    this.calculateStatistics();
  },

  // 计算统计数据
  calculateStatistics: function () {
    const records = this.data.records;
    let incomeCategories = {};
    let expenseCategories = {};
    let totalIncome = 0;
    let totalExpense = 0;

    // 按类别统计金额
    records.forEach((record) => {
      if (record.type === "income") {
        totalIncome += parseFloat(record.amount);
        if (!incomeCategories[record.category]) {
          incomeCategories[record.category] = 0;
        }
        incomeCategories[record.category] += parseFloat(record.amount);
      } else {
        totalExpense += parseFloat(record.amount);
        if (!expenseCategories[record.category]) {
          expenseCategories[record.category] = 0;
        }
        expenseCategories[record.category] += parseFloat(record.amount);
      }
    });

    // 将类别数据转换为数组并计算百分比
    const incomeCategoriesArray = this.processCategories(
      incomeCategories,
      totalIncome
    );
    const expenseCategoriesArray = this.processCategories(
      expenseCategories,
      totalExpense
    );

    this.setData({
      incomeCategories: incomeCategories,
      expenseCategories: expenseCategories,
      incomeCategoriesArray: incomeCategoriesArray,
      expenseCategoriesArray: expenseCategoriesArray,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
    });

    // 延迟一下绘制图表，确保视图已经渲染
    setTimeout(() => {
      this.drawPieChart();
    }, 100);
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

  // 处理类别数据，计算百分比并分配颜色
  processCategories: function (categories, total) {
    let result = [];
    let index = 0;

    for (const [name, value] of Object.entries(categories)) {
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
      // 获取对应的图标
      const icon =
        this.data.activeType === "expense"
          ? this.data.categoryIcons.expense[name] || "📊"
          : this.data.categoryIcons.income[name] || "📊";

      result.push({
        name: name,
        icon: icon, // 添加图标
        value: value.toFixed(2),
        percentage: percentage,
        color: COLORS[index % COLORS.length],
      });
      index++;
    }

    // 按金额降序排序
    result.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    return result;
  },

  // 绘制饼图
  drawPieChart: function () {
    const ctx = wx.createCanvasContext("pieChart");
    const width = wx.getSystemInfoSync().windowWidth;
    const height = 250; // 饼图高度
    const radius = Math.min(width, height) / 3; // 饼图半径
    const centerX = width / 2 - 20; // 圆心X坐标
    const centerY = height / 2; // 圆心Y坐标

    // 根据当前选择的类型获取数据
    const data =
      this.data.activeType === "expense"
        ? this.data.expenseCategoriesArray
        : this.data.incomeCategoriesArray;

    // 如果没有数据，绘制空状态
    if (data.length === 0) {
      ctx.setFontSize(16);
      ctx.setFillStyle("#999999");
      ctx.setTextAlign("center");
      ctx.fillText("暂无数据", centerX, centerY);
      ctx.draw();
      return;
    }

    let total = 0;
    data.forEach((item) => {
      total += parseFloat(item.value);
    });

    // 开始绘制饼图
    let startAngle = 0;

    data.forEach((item, index) => {
      // 计算扇形角度
      const percentage = parseFloat(item.value) / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.setFillStyle(item.color);
      ctx.fill();

      // 更新起始角度
      startAngle = endAngle;
    });

    // 绘制中心空白圆形，形成环形图效果
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.setFillStyle("#FFFFFF");
    ctx.fill();

    // 在中心显示总额
    ctx.setFontSize(14);
    ctx.setFillStyle("#666666");
    ctx.setTextAlign("center");
    ctx.fillText(
      this.data.activeType === "expense" ? "总支出" : "总收入",
      centerX,
      centerY - 10
    );

    ctx.setFontSize(16);
    ctx.setFillStyle("#333333");
    ctx.setTextAlign("center");
    ctx.fillText(
      "¥" +
        (this.data.activeType === "expense"
          ? this.data.totalExpense
          : this.data.totalIncome),
      centerX,
      centerY + 15
    );

    // 进行绘制
    ctx.draw();
  },
});
