import { maskName } from "./helpers";

export interface PosterPayload {
  name: string;
  departmentName: string;
  baseName: string;
  totalScore: number;
  bestDurationLabel: string;
  passLevelCount: number;
  template: 1 | 2;
  desensitizeName: boolean;
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const buildPosterDataUrl = (payload: PosterPayload) => {
  const canvas = document.createElement("canvas");
  canvas.width = 750;
  canvas.height = 1334;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法生成海报，请稍后重试");
  }

  const gradient = ctx.createLinearGradient(0, 0, 750, 1334);
  if (payload.template === 1) {
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(1, "#1d4ed8");
  } else {
    gradient.addColorStop(0, "#fb923c");
    gradient.addColorStop(1, "#dc2626");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 750, 1334);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  drawRoundedRect(ctx, 56, 72, 638, 1180, 28);
  ctx.fill();

  ctx.fillStyle = payload.template === 1 ? "#0369a1" : "#b91c1c";
  ctx.font = "bold 46px sans-serif";
  ctx.fillText("EHS 安全能力海报", 112, 172);

  ctx.fillStyle = "#111827";
  ctx.font = "32px sans-serif";
  ctx.fillText(`员工：${maskName(payload.name, payload.desensitizeName)}`, 112, 270);
  ctx.fillText(`部门：${payload.departmentName}`, 112, 324);
  ctx.fillText(`基地：${payload.baseName}`, 112, 378);

  ctx.fillStyle = "#334155";
  ctx.font = "28px sans-serif";
  ctx.fillText("本期训练战绩", 112, 468);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 68px sans-serif";
  ctx.fillText(`${payload.totalScore}`, 112, 560);
  ctx.fillStyle = "#64748b";
  ctx.font = "26px sans-serif";
  ctx.fillText("总分", 254, 560);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(payload.bestDurationLabel, 112, 650);
  ctx.fillStyle = "#64748b";
  ctx.font = "26px sans-serif";
  ctx.fillText("最佳用时", 310, 650);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(`${payload.passLevelCount} 关`, 112, 730);
  ctx.fillStyle = "#64748b";
  ctx.font = "26px sans-serif";
  ctx.fillText("累计通关", 260, 730);

  ctx.fillStyle = "#64748b";
  ctx.font = "24px sans-serif";
  ctx.fillText("持续训练，安全行为成为习惯", 112, 980);
  ctx.fillText("EHS｜安全能力闯关训练平台", 112, 1020);

  ctx.fillStyle = payload.template === 1 ? "#0284c7" : "#dc2626";
  ctx.fillRect(112, 1080, 526, 6);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText("扫描企业应用，立即参与训练", 112, 1140);

  return canvas.toDataURL("image/png");
};
