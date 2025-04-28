const app = getApp();

Page({
  data: {
    type: "expense",
    amount: "",
    category: "",
    date: "",
    categories: {
      income: ["工资", "奖金", "兼职", "其他"],
      expense: ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "其他"],
    },
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
    years: [],
    months: [],
    days: [],
    selectedYear: "",
    selectedMonth: "",
    selectedDay: "",
    showDatePicker: false,
    currentYear: "",
    currentMonth: "",
    currentDay: "",
    datePickerValue: [0, 0, 0], // 用于记录picker-view的选中值
    showCategoryPicker: false, // 控制分类选择器的显示
  },

  onLoad: function () {
    // 初始化日期选择器数据
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // 生成年份选项（从2020年到当前年份）
    const years = [];
    for (let i = 2020; i <= currentYear; i++) {
      years.push(i);
    }

    // 生成月份选项（显示所有12个月）
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(i);
    }

    // 生成日期选项
    const days = this.getDaysInMonth(currentYear, currentMonth);

    this.setData({
      years,
      months,
      days,
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      selectedDay: currentDay,
      date: this.formatDate(now),
      currentYear,
      currentMonth,
      currentDay,
    });
  },

  // 根据年月获取该月的天数
  getDaysInMonth: function (year, month) {
    const days = [];
    // 获取该月的总天数
    const maxDay = new Date(year, month, 0).getDate();
    for (let i = 1; i <= maxDay; i++) {
      days.push(i);
    }
    return days;
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  // 日期选择器值改变
  bindDateChange: function (e) {
    const val = e.detail.value;
    const year = this.data.years[val[0]];
    const month = this.data.months[val[1]];
    const day = this.data.days[val[2]];

    // 检查是否是未来日期
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    if (
      year > currentYear ||
      (year === currentYear && month > currentMonth) ||
      (year === currentYear && month === currentMonth && day > currentDay)
    ) {
      wx.showToast({
        title: "不能选择未来日期",
        icon: "none",
      });
      return;
    }

    this.setData({
      datePickerValue: val,
    });
  },

  // 确认日期选择
  confirmDate: function () {
    const val = this.data.datePickerValue;
    const year = this.data.years[val[0]];
    const month = this.data.months[val[1]];
    const day = this.data.days[val[2]];

    this.setData({
      selectedYear: year,
      selectedMonth: month,
      selectedDay: day,
      showDatePicker: false,
    });
    this.updateDate();
  },

  // 显示日期选择器
  showDatePickerPopup: function () {
    // 设置当前选中值
    const yearIndex = this.data.years.indexOf(this.data.selectedYear);
    const monthIndex = this.data.months.indexOf(this.data.selectedMonth);
    const dayIndex = this.data.days.indexOf(this.data.selectedDay);

    this.setData({
      showDatePicker: true,
      datePickerValue: [yearIndex, monthIndex, dayIndex],
    });
  },

  // 隐藏日期选择器
  hideDatePickerPopup: function () {
    this.setData({
      showDatePicker: false,
    });
  },

  // 年份改变
  bindYearChange: function (e) {
    const selectedYear = this.data.years[e.detail.value];
    const now = new Date();
    const currentYear = now.getFullYear();

    // 只限制未来年份
    if (selectedYear > currentYear) {
      wx.showToast({
        title: "不能选择未来日期",
        icon: "none",
      });
      return;
    }

    const days = this.getDaysInMonth(selectedYear, this.data.selectedMonth);

    this.setData({
      selectedYear,
      days,
      selectedMonth: this.data.selectedMonth,
      selectedDay: Math.min(this.data.selectedDay, days.length),
    });
    this.updateDate();
  },

  // 月份改变
  bindMonthChange: function (e) {
    const selectedMonth = this.data.months[e.detail.value];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 只限制当前年份的未来月份
    if (
      this.data.selectedYear === currentYear &&
      selectedMonth > currentMonth
    ) {
      wx.showToast({
        title: "不能选择未来日期",
        icon: "none",
      });
      return;
    }

    const days = this.getDaysInMonth(this.data.selectedYear, selectedMonth);

    this.setData({
      selectedMonth: selectedMonth,
      days: days,
      selectedDay: Math.min(this.data.selectedDay, days.length),
    });
    this.updateDate();
  },

  // 日期改变
  bindDayChange: function (e) {
    const selectedDay = this.data.days[e.detail.value];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // 只限制当前年月的未来日期
    if (
      this.data.selectedYear === currentYear &&
      this.data.selectedMonth === currentMonth &&
      selectedDay > currentDay
    ) {
      wx.showToast({
        title: "不能选择未来日期",
        icon: "none",
      });
      return;
    }

    this.setData({
      selectedDay: selectedDay,
    });
    this.updateDate();
  },

  // 更新选择的日期
  updateDate: function () {
    const dateStr = `${this.data.selectedYear}-${this.data.selectedMonth
      .toString()
      .padStart(2, "0")}-${this.data.selectedDay.toString().padStart(2, "0")}`;
    this.setData({
      date: dateStr,
    });
  },

  bindTypeChange: function (e) {
    this.setData({
      type: e.detail.value,
    });
  },

  bindAmountInput: function (e) {
    this.setData({
      amount: e.detail.value,
    });
  },

  bindCategoryChange: function (e) {
    this.setData({
      category: e.detail.value,
    });
  },

  submit: function () {
    if (!this.data.amount) {
      wx.showToast({
        title: "请输入金额",
        icon: "none",
      });
      return;
    }

    if (this.data.category === "") {
      wx.showToast({
        title: "请选择分类",
        icon: "none",
      });
      return;
    }

    const record = {
      type: this.data.type,
      amount: parseFloat(this.data.amount).toFixed(2),
      category: this.data.categories[this.data.type][this.data.category],
      date: this.data.date,
    };

    // 输出调试信息，查看记录详情
    console.log("准备提交的记录:", {
      type: this.data.type,
      amount: this.data.amount,
      categoryIndex: this.data.category,
      categoryValue: this.data.categories[this.data.type][this.data.category],
      date: this.data.date,
    });

    const records = app.globalData.records;
    records.unshift(record);
    app.globalData.records = records;
    wx.setStorageSync("records", records);

    wx.showToast({
      title: "添加成功",
      icon: "success",
    });

    setTimeout(() => {
      wx.switchTab({
        url: "/pages/index/index",
      });
    }, 1500);
  },

  // 显示分类选择器
  showCategoryPicker: function () {
    this.setData({
      showCategoryPicker: true,
    });
  },

  // 隐藏分类选择器
  hideCategoryPicker: function () {
    this.setData({
      showCategoryPicker: false,
    });
  },

  // 选择分类
  selectCategory: function (e) {
    const index = e.currentTarget.dataset.index;
    console.log("选择的分类索引:", index);
    console.log("分类名称:", this.data.categories[this.data.type][index]);

    if (index === undefined || index === null) {
      wx.showToast({
        title: "分类选择错误",
        icon: "none",
      });
      return;
    }

    this.setData({
      category: index,
      showCategoryPicker: false,
    });
  },

  // 设置类型为支出
  setTypeExpense: function () {
    this.setData({
      type: "expense",
      category: "", // 重置分类选择
    });
  },

  // 设置类型为收入
  setTypeIncome: function () {
    this.setData({
      type: "income",
      category: "", // 重置分类选择
    });
  },
});
