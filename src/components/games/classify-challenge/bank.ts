import type { ClassifyLevelConfig } from './types';

/**
 * “分类大挑战”首版内置题库（消防主题）。
 * 说明：
 * - 采用左右两类，匹配 swipe 左/右归类。
 * - 文案以“解释清楚”为优先，方便学习与复盘。
 * - 后续可替换为后端下发（按 level.id / module_id 映射）或运营配置。
 */
export const CLASSIFY_LEVELS: readonly ClassifyLevelConfig[] = [
  {
    id: 'extinguisher-scenario',
    name: '灭火器选型：能不能用？',
    categories: [
      { id: 'left', label: '可以用', badge: '✅' },
      { id: 'right', label: '不可以用', badge: '⛔' },
    ],
    takeCount: 10,
    perQuestionSeconds: 10,
    maxErrors: 3,
    maxKeyErrors: 1,
    questions: [
      {
        id: 'elec-water',
        title: '电器起火（带电设备）',
        subtitle: '你想用水基/清水直接浇灭',
        correctCategoryId: 'right',
        isKey: true,
        knowledgePoint: '电器火灾处置',
        explain: '带电设备起火不能直接用水扑灭，可能触电并扩大故障。应先断电，再选择二氧化碳或干粉等合适灭火器。',
      },
      {
        id: 'oil-water',
        title: '油锅起火',
        subtitle: '你想用水直接浇灭',
        correctCategoryId: 'right',
        isKey: true,
        knowledgePoint: '厨房油锅起火',
        explain: '油遇水会飞溅并扩大火势。应盖锅盖隔绝空气，或使用干粉灭火器等正确方式。',
      },
      {
        id: 'paper-waterbased',
        title: '纸箱/木材等固体可燃物起火',
        subtitle: '你手边有水基灭火器',
        correctCategoryId: 'left',
        knowledgePoint: 'A类火灾',
        explain: '纸、木材属于 A 类（固体）火灾，水基灭火器适用，可有效降温抑制复燃。',
      },
      {
        id: 'gas-drypowder',
        title: '燃气泄漏着火（气体火）',
        subtitle: '你手边有干粉灭火器',
        correctCategoryId: 'left',
        knowledgePoint: '气体火灾',
        explain: '干粉灭火器可用于可燃气体火灾，关键是先确保阀门关闭/切断气源，避免复燃或爆燃。',
      },
      {
        id: 'metal-water',
        title: '金属粉末/镁铝等金属起火（疑似）',
        subtitle: '你打算用水扑灭',
        correctCategoryId: 'right',
        knowledgePoint: '金属火灾',
        explain: '部分金属遇水会发生剧烈反应并产生氢气，可能更危险。金属火灾应使用专用灭火剂并按预案处理。',
      },
      {
        id: 'liquid-foam',
        title: '汽油/油漆等易燃液体起火',
        subtitle: '你手边有泡沫灭火器',
        correctCategoryId: 'left',
        knowledgePoint: 'B类火灾',
        explain: '易燃液体属于 B 类火灾，泡沫可覆盖隔绝空气并抑制蒸发，通常适用（注意不同场景与电气风险）。',
      },
      {
        id: 'serverroom-co2',
        title: '机房/配电柜附近起火（疑似电气）',
        subtitle: '你手边有二氧化碳灭火器',
        correctCategoryId: 'left',
        knowledgePoint: '电气火灾灭火器选型',
        explain: '二氧化碳不导电、残留少，适用于电气设备初期火灾（注意通风与人员安全）。',
      },
      {
        id: 'textile-drypowder',
        title: '布料/窗帘等织物起火',
        subtitle: '你手边有干粉灭火器',
        correctCategoryId: 'left',
        knowledgePoint: '初期火灾处置',
        explain: '干粉适用范围广，对固体可燃物初期火灾一般可用；同时尽量控制火源、组织撤离并报警。',
      },
      {
        id: 'kitchen-co2',
        title: '厨房油锅起火',
        subtitle: '你手边只有二氧化碳灭火器',
        correctCategoryId: 'left',
        knowledgePoint: '油锅起火灭火手段',
        explain: '二氧化碳可用于初期火灾隔绝氧气，但油锅更推荐先盖盖隔绝空气；操作要避免飞溅与复燃。',
      },
      {
        id: 'reignition-watch',
        title: '火被扑灭了',
        subtitle: '你准备马上离开现场不再观察',
        correctCategoryId: 'right',
        knowledgePoint: '复燃风险',
        explain: '初期火灾扑灭后仍可能复燃，应观察余火、清理可燃物，并确保安全后再离开。',
      },
    ],
  },
  {
    id: 'fire-type-basic',
    name: '火灾类型：A 还是 B？',
    categories: [
      { id: 'left', label: 'A类（固体）', badge: '🪵' },
      { id: 'right', label: 'B类（液体）', badge: '🛢️' },
    ],
    takeCount: 10,
    perQuestionSeconds: 8,
    maxErrors: 3,
    maxKeyErrors: 1,
    questions: [
      { id: 'a-paper', title: '纸张起火', correctCategoryId: 'left', explain: '纸张属于固体可燃物，归 A 类。', knowledgePoint: '火灾分类' },
      { id: 'a-wood', title: '木板/家具起火', correctCategoryId: 'left', explain: '木材属于固体可燃物，归 A 类。', knowledgePoint: '火灾分类' },
      { id: 'a-cloth', title: '窗帘/衣物起火', correctCategoryId: 'left', explain: '织物属于固体可燃物，归 A 类。', knowledgePoint: '火灾分类' },
      { id: 'b-gasoline', title: '汽油起火', correctCategoryId: 'right', isKey: true, explain: '汽油属于易燃液体，归 B 类。', knowledgePoint: '火灾分类' },
      { id: 'b-paint', title: '油漆/稀料起火', correctCategoryId: 'right', explain: '油漆/稀料属于易燃液体，归 B 类。', knowledgePoint: '火灾分类' },
      { id: 'b-alcohol', title: '酒精起火', correctCategoryId: 'right', isKey: true, explain: '酒精属于易燃液体，归 B 类。', knowledgePoint: '火灾分类' },
      { id: 'a-cardboard', title: '纸箱堆垛起火', correctCategoryId: 'left', explain: '纸箱属于固体可燃物，归 A 类。', knowledgePoint: '火灾分类' },
      { id: 'b-diesel', title: '柴油起火', correctCategoryId: 'right', explain: '柴油属于可燃液体，归 B 类。', knowledgePoint: '火灾分类' },
      { id: 'a-rubber', title: '橡胶制品起火', correctCategoryId: 'left', explain: '橡胶通常按固体可燃物处理，归 A 类（具体以预案为准）。', knowledgePoint: '火灾分类' },
      { id: 'b-cooking-oil', title: '食用油起火', correctCategoryId: 'right', explain: '食用油为液体/高温油脂，归 B 类。', knowledgePoint: '火灾分类' },
    ],
  },
  {
    id: 'do-or-dont',
    name: '现场处置：该做还是别做？',
    categories: [
      { id: 'left', label: '应该做', badge: '👍' },
      { id: 'right', label: '不应该做', badge: '👎' },
    ],
    takeCount: 12,
    perQuestionSeconds: 10,
    maxErrors: 4,
    maxKeyErrors: 2,
    questions: [
      {
        id: 'do-alarm',
        title: '火势无法控制时，第一时间报警并说明地址火情',
        correctCategoryId: 'left',
        isKey: true,
        knowledgePoint: '报警要点',
        explain: '报警时优先说明：地址、火情（什么在烧/有无人员被困）、联系方式，方便快速出警。',
      },
      {
        id: 'dont-elevator',
        title: '疏散时乘坐电梯下楼',
        correctCategoryId: 'right',
        isKey: true,
        knowledgePoint: '火场逃生',
        explain: '火灾可能断电、烟气倒灌、电梯停困，疏散应走安全通道。',
      },
      {
        id: 'do-low',
        title: '浓烟环境用湿毛巾捂口鼻、弯腰低姿前进',
        correctCategoryId: 'left',
        knowledgePoint: '火场逃生',
        explain: '烟气上升聚集在上方，低姿可减少吸入有毒烟气；湿毛巾可一定程度过滤颗粒。',
      },
      {
        id: 'dont-open-hot-door',
        title: '门把手很烫仍强行开门',
        correctCategoryId: 'right',
        knowledgePoint: '防止回燃',
        explain: '门后可能高温/火焰，强开会引入空气导致轰燃；应改走其他安全路线并报警求救。',
      },
      {
        id: 'do-cut-power',
        title: '电气火灾处置前先断电',
        correctCategoryId: 'left',
        knowledgePoint: '电气火灾',
        explain: '断电可降低触电与二次起火风险；断电后再选用合适灭火器。',
      },
      {
        id: 'dont-panicked-run',
        title: '惊慌奔跑、逆人流冲向出口',
        correctCategoryId: 'right',
        knowledgePoint: '疏散组织',
        explain: '逆行易造成拥堵踩踏，应听从疏导、按指示有序撤离。',
      },
      {
        id: 'do-close-door',
        title: '撤离时随手关门（不反锁）',
        correctCategoryId: 'left',
        knowledgePoint: '隔烟控火',
        explain: '关门可减缓烟火蔓延，为他人逃生和消防处置争取时间。',
      },
      {
        id: 'dont-hide',
        title: '躲进衣柜/卫生间不发出求救信号',
        correctCategoryId: 'right',
        knowledgePoint: '被困自救',
        explain: '被困应尽量向外求救（呼喊/敲击/拨打电话），并选择有相对隔烟条件的位置等待救援。',
      },
      {
        id: 'do-meet-point',
        title: '到集合点清点人数并报告缺失人员信息',
        correctCategoryId: 'left',
        knowledgePoint: '疏散清点',
        explain: '清点可快速发现被困人员并向救援提供线索，避免盲目返回火场。',
      },
      {
        id: 'dont-return',
        title: '撤离后擅自返回火场取物',
        correctCategoryId: 'right',
        isKey: true,
        knowledgePoint: '二次风险',
        explain: '火场结构不稳定、烟气有毒，返回极其危险，应等待专业人员处理。',
      },
      {
        id: 'do-use-extinguisher-correctly',
        title: '初期火灾：拔销—握管—压把—对准火焰根部扫射',
        correctCategoryId: 'left',
        knowledgePoint: '灭火器使用',
        explain: '对准火焰根部才能有效灭火，左右扫射覆盖燃烧面，并注意自身撤离路线。',
      },
      {
        id: 'dont-block-exit',
        title: '在安全出口堆放杂物',
        correctCategoryId: 'right',
        knowledgePoint: '通道管理',
        explain: '安全出口必须保持畅通，堆放杂物会延误疏散并增加伤害风险。',
      },
    ],
  },
] as const;

export function pickDefaultLevelConfig(levelName?: string): ClassifyLevelConfig {
  if (!levelName) return CLASSIFY_LEVELS[0]!;
  const hit = CLASSIFY_LEVELS.find((x) => levelName.includes(x.name));
  return hit ?? CLASSIFY_LEVELS[0]!;
}

