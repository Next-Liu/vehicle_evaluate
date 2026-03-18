/**
 * 演示模式 - 测试数据
 */

export const mockLogin = (username, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        resolve({
          token: 'mock-token-admin-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          username: 'admin',
          role: 'ADMIN'
        })
      } else if (username === 'user' && password === 'user123') {
        resolve({
          token: 'mock-token-user-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          username: 'user',
          role: 'USER'
        })
      } else {
        throw new Error('用户名或密码错误')
      }
    }, 500)
  })
}

export const mockStatistics = {
  stationCount: 128,
  emissionCount: 520,
  policyCount: 45,
  modelCount: 8
}

export const mockRecentPolicies = [
  { name: '单双号限行政策评估', createTime: '2026-02-01 10:30:00', status: '已完成' },
  { name: '新能源车推广政策评估', createTime: '2026-01-28 15:20:00', status: '进行中' },
  { name: '货车限行政策评估', createTime: '2026-01-25 09:15:00', status: '已完成' },
  { name: '国六标准实施效果评估', createTime: '2026-01-20 14:00:00', status: '已完成' },
  { name: '拥堵收费政策情景分析', createTime: '2026-01-15 11:30:00', status: '待评估' }
]

export const mockAirQualityData = {
  dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
  pm25: [45, 42, 38, 35, 32, 30],
  pm10: [78, 72, 65, 58, 52, 48],
  no2: [42, 40, 38, 35, 33, 30],
  so2: [15, 14, 13, 12, 11, 10]
}

// 苏州12个国控点监测站点
export const mockAirQualityStations = [
  {
    id: 1,
    name: '彩香',
    fullName: '彩香新村（石路街道）',
    lng: 120.5946,
    lat: 31.3013,
    region: '姑苏区',
    address: '彩香新村（石路街道）',
    type: '国控',
    pm25: 35,
    pm10: 58,
    no2: 32,
    so2: 12,
    o3: 45,
    co: 0.8,
    aqi: 85,
    level: '良'
  },
  {
    id: 2,
    name: '轧钢厂',
    fullName: '木耳场7-2',
    lng: 120.6016,
    lat: 31.3225,
    region: '姑苏区',
    address: '木耳场7-2',
    type: '国控',
    pm25: 42,
    pm10: 68,
    no2: 38,
    so2: 14,
    o3: 42,
    co: 1.0,
    aqi: 95,
    level: '良'
  },
  {
    id: 3,
    name: '吴中区',
    fullName: '吴中东路101号',
    lng: 120.6372,
    lat: 31.2719,
    region: '吴中区',
    address: '吴中东路101号',
    type: '国控',
    pm25: 38,
    pm10: 55,
    no2: 28,
    so2: 11,
    o3: 48,
    co: 0.7,
    aqi: 78,
    level: '良'
  },
  {
    id: 4,
    name: '高新区',
    fullName: '高新区实验小学（邓尉路校区）教学楼楼顶',
    lng: 120.5567,
    lat: 31.305,
    region: '高新区',
    address: '高新区实验小学（邓尉路校区）教学楼楼顶',
    type: '国控',
    pm25: 32,
    pm10: 50,
    no2: 25,
    so2: 10,
    o3: 52,
    co: 0.6,
    aqi: 68,
    level: '良'
  },
  {
    id: 5,
    name: '工业园区',
    fullName: '园区星海中学（苏茜路18号）',
    lng: 120.6698,
    lat: 31.309,
    region: '工业园区',
    address: '园区星海中学（苏茜路18号）',
    type: '国控',
    pm25: 45,
    pm10: 72,
    no2: 35,
    so2: 13,
    o3: 40,
    co: 0.9,
    aqi: 98,
    level: '良'
  },
  {
    id: 6,
    name: '相城区',
    fullName: '相城区行政中心6号楼',
    lng: 120.6452,
    lat: 31.3685,
    region: '相城区',
    address: '相城区行政中心6号楼',
    type: '国控',
    pm25: 28,
    pm10: 45,
    no2: 22,
    so2: 9,
    o3: 55,
    co: 0.5,
    aqi: 62,
    level: '良'
  },
  {
    id: 7,
    name: '越秀幼儿园',
    fullName: '梅石路1593号越秀幼儿园教学大楼',
    lng: 120.6373,
    lat: 31.1677,
    region: '吴江区',
    address: '梅石路1593号越秀幼儿园教学大楼',
    type: '国控',
    pm25: 25,
    pm10: 40,
    no2: 20,
    so2: 8,
    o3: 58,
    co: 0.5,
    aqi: 55,
    level: '良'
  },
  {
    id: 8,
    name: '木渎中学',
    fullName: '木渎镇灵天路588号木渎高级中学',
    lng: 120.497136,
    lat: 31.2782719,
    region: '吴中区',
    address: '木渎镇灵天路588号木渎高级中学',
    type: '国控',
    pm25: 30,
    pm10: 48,
    no2: 24,
    so2: 10,
    o3: 50,
    co: 0.6,
    aqi: 65,
    level: '良'
  },
  {
    id: 9,
    name: '高铁新城',
    fullName: '蠡太路苏州大学实验学校楼顶',
    lng: 120.6505532,
    lat: 31.4116705,
    region: '相城区',
    address: '蠡太路苏州大学实验学校楼顶',
    type: '国控',
    pm25: 35,
    pm10: 52,
    no2: 26,
    so2: 11,
    o3: 48,
    co: 0.7,
    aqi: 75,
    level: '良'
  },
  {
    id: 10,
    name: '方洲路',
    fullName: '琉璃街方洲公园东北角',
    lng: 120.7418778,
    lat: 31.3177405,
    region: '工业园区',
    address: '琉璃街方洲公园东北角',
    type: '国控',
    pm25: 40,
    pm10: 65,
    no2: 32,
    so2: 12,
    o3: 43,
    co: 0.8,
    aqi: 88,
    level: '良'
  },
  {
    id: 11,
    name: '学森路',
    fullName: '学森路9号',
    lng: 120.428078,
    lat: 31.322797,
    region: '高新区',
    address: '学森路9号',
    type: '国控',
    pm25: 22,
    pm10: 35,
    no2: 18,
    so2: 7,
    o3: 60,
    co: 0.4,
    aqi: 48,
    level: '优'
  },
  {
    id: 12,
    name: '南门',
    fullName: '人民路',
    lng: 120.628,
    lat: 31.2864,
    region: '姑苏区',
    address: '人民路',
    type: '国控',
    pm25: 38,
    pm10: 60,
    no2: 30,
    so2: 11,
    o3: 46,
    co: 0.7,
    aqi: 82,
    level: '良'
  }
]

// 苏州主要道路网络（简化版）
export const suzhouRoads = [
  // 东西向主干道
  { name: '干将路', coords: [[120.58, 31.30], [120.63, 31.30]] },
  { name: '人民路', coords: [[120.61, 31.28], [120.63, 31.29]] },
  { name: '南环路', coords: [[120.55, 31.27], [120.68, 31.27]] },
  { name: '北环路', coords: [[120.55, 31.35], [120.68, 31.35]] },
  { name: '金鸡湖大道', coords: [[120.62, 31.30], [120.72, 31.32]] },
  // 南北向主干道
  { name: '人民路', coords: [[120.62, 31.26], [120.62, 31.31]] },
  { name: '临顿路', coords: [[120.62, 31.29], [120.63, 31.33]] },
  { name: '干将路-东西向', coords: [[120.56, 31.31], [120.68, 31.31]] },
  { name: '长江路', coords: [[120.55, 31.29], [120.60, 31.32]] },
  { name: '工业园区星湖街', coords: [[120.66, 31.30], [120.68, 31.32]] },
  { name: '相城大道', coords: [[120.63, 31.33], [120.66, 31.39]] },
  { name: '高新区太湖大道', coords: [[120.53, 31.28], [120.58, 31.31]] },
  { name: '吴中大道', coords: [[120.60, 31.25], [120.67, 31.29]] },
  // 环城高速
  { name: '绕城高速西段', coords: [[120.45, 31.27], [120.50, 31.35]] },
  { name: '绕城高速东段', coords: [[120.70, 31.28], [120.74, 31.36]] }
]

// 24小时逐小时空气质量数据
export const generateHourlyAirQualityData = () => {
  const hours = []
  const pm25Data = []
  const pm10Data = []
  const no2Data = []
  const so2Data = []
  const o3Data = []
  const coData = []

  const baseHour = new Date()
  baseHour.setHours(baseHour.getHours() - 24, 0, 0, 0)

  for (let i = 0; i < 24; i++) {
    const hour = new Date(baseHour)
    hour.setHours(baseHour.getHours() + i)
    hours.push(`${hour.getHours().toString().padStart(2, '0')}:00`)

    // 生成合理的波动数据
    const hourOfDay = hour.getHours()
    const isRushHour = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19)

    pm25Data.push(Math.round(30 + (isRushHour ? 15 : 0) + Math.random() * 20))
    pm10Data.push(Math.round(55 + (isRushHour ? 25 : 0) + Math.random() * 30))
    no2Data.push(Math.round(25 + (isRushHour ? 20 : 0) + Math.random() * 15))
    so2Data.push(Math.round(10 + Math.random() * 8))
    o3Data.push(Math.round(45 - (isRushHour ? 10 : 0) + Math.random() * 15))
    coData.push(parseFloat((0.6 + (isRushHour ? 0.6 : 0) + Math.random() * 0.4).toFixed(1)))
  }

  return {
    hours,
    pm25: pm25Data,
    pm10: pm10Data,
    no2: no2Data,
    so2: so2Data,
    o3: o3Data,
    co: coData
  }
}

export const mockPolicyScenarios = [
  {
    id: 1,
    name: '单双号限行政策',
    description: '工作日按车牌尾号单双号限行',
    status: '进行中',
    reductionRate: '25%',
    createTime: '2026-01-15'
  },
  {
    id: 2,
    name: '新能源车推广政策',
    description: '提高新能源汽车比例至30%',
    status: '已完成',
    reductionRate: '18%',
    createTime: '2026-01-10'
  },
  {
    id: 3,
    name: '货车限行政策',
    description: '白天禁止货车进入五环',
    status: '已完成',
    reductionRate: '12%',
    createTime: '2026-01-05'
  }
]

export const mockAnalysisData = {
  monthlyTrend: {
    dates: ['7月', '8月', '9月', '10月', '11月', '12月', '1月'],
    emission: [120, 115, 110, 105, 100, 98, 95],
    airQuality: [85, 82, 80, 78, 75, 72, 70]
  },
  vehicleDistribution: [
    { name: '小型客车', value: 65 },
    { name: '大型客车', value: 10 },
    { name: '货车', value: 15 },
    { name: '摩托车', value: 8 },
    { name: '其他', value: 2 }
  ],
  regionalEmission: [
    { name: '市中心', value: 450 },
    { name: '东部新区', value: 320 },
    { name: '西部新城', value: 280 },
    { name: '南部工业区', value: 390 },
    { name: '北部生态区', value: 150 }
  ]
}
