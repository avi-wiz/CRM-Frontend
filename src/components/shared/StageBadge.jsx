import { stageColors } from "../../data/constants";

export default function StageBadge({ stage, small }) {
  const color = stageColors[stage] || "#6b7280";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${small ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {stage}
    </span>
  );
}
