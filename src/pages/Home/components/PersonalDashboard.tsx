import Canvas from '@antv/f2-react';
import { Chart, Interval, Line, Axis } from '@antv/f2';

/** 生成最近 10 天的日期标签（M/D） */
function getLast10DayLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return labels;
}

/** Mock：最近 10 天游戏记录，柱状=当日局数，折线=当日总积分 */
const DAY_LABELS = getLast10DayLabels();
const MOCK_DAILY_DATA = [
  { date: DAY_LABELS[0], gameCount: 2, totalScore: 168 },
  { date: DAY_LABELS[1], gameCount: 3, totalScore: 245 },
  { date: DAY_LABELS[2], gameCount: 1, totalScore: 88 },
  { date: DAY_LABELS[3], gameCount: 4, totalScore: 356 },
  { date: DAY_LABELS[4], gameCount: 2, totalScore: 182 },
  { date: DAY_LABELS[5], gameCount: 5, totalScore: 420 },
  { date: DAY_LABELS[6], gameCount: 0, totalScore: 0 },
  { date: DAY_LABELS[7], gameCount: 3, totalScore: 278 },
  { date: DAY_LABELS[8], gameCount: 2, totalScore: 195 },
  { date: DAY_LABELS[9], gameCount: 4, totalScore: 368 },
];

/** 与页面主题一致：主色、文字、弱化文字、轴线 */
const CHART_THEME = {
  colors: ['#0064ff'],
  axis: {
    label: { fill: '#6b7280', fontSize: '12px' },
    line: { stroke: 'rgba(226, 226, 234, 0.95)', lineWidth: '1px' },
    tickLine: { stroke: 'rgba(226, 226, 234, 0.95)' },
    grid: { stroke: 'rgba(226, 226, 234, 0.65)', lineWidth: '1px', lineDash: ['4px'] },
  },
  chart: {
    padding: ['12px', '12px', '32px', '0px'],
  },
};

/**
 * 首页个人看板 - 最近 10 天游戏记录（Mock）
 * X 轴：时间（日期）；柱状图：当日玩了几局；折线图：当日总收获积分
 */
export function PersonalDashboard() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div className="subtle" style={{ fontSize: '0.34rem' }}>
          最近 10 天游戏记录
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            fontSize: 'var(--font-caption)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.08rem' }}>
            <span style={{ width: '0.12rem', height: '0.12rem', borderRadius: 2, background: '#0064ff' }} />
            局数
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.08rem' }}>
            <span
              style={{
                width: '0.2rem',
                height: 2,
                borderRadius: 1,
                background: 'var(--color-warn)',
              }}
            />
            总积分
          </span>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '2.8rem',
        }}
      >
        <Canvas>
          <Chart
            data={MOCK_DAILY_DATA}
            scale={{
              date: { type: 'cat' },
              gameCount: {
                type: 'linear',
                min: 0,
                nice: true,
                formatter: (v: number) => Math.round(v),
              },
              totalScore: { type: 'linear', min: 0, nice: true },
            }}
            theme={CHART_THEME}
          >
            <Axis field="date" />
            <Axis field="gameCount" position="left" />
            <Axis field="totalScore" position="right" />
            <Interval x="date" y="gameCount" color="#0064ff" />
            <Line x="date" y="totalScore" color="#fa8c16" shape="smooth" />
          </Chart>
        </Canvas>
      </div>
    </>
  );
}
