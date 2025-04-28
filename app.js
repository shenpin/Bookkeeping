App({
  globalData: {
    userInfo: null,
    records: [],
  },
  onLaunch: function () {
    // 获取本地存储的记账记录
    const records = wx.getStorageSync("records") || [];
    this.globalData.records = records;
  },
});
