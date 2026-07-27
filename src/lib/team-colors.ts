export interface TeamColorTheme {
  primary: string;
  gradient: string;
  light: string;
  stroke: string;
  glow: string;
}

export const PRESET_TEAM_THEMES: Array<TeamColorTheme & { name: string; hex: string }> = [
  {
    name: "Rose",
    hex: "#E11D48",
    primary: "#E11D48",
    gradient: "from-rose-600 to-rose-500",
    light: "#FFE4E6",
    stroke: "#9F1239",
    glow: "shadow-rose-500/20",
  },
  {
    name: "Blue",
    hex: "#2563EB",
    primary: "#2563EB",
    gradient: "from-blue-600 to-blue-500",
    light: "#DBEAFE",
    stroke: "#1E40AF",
    glow: "shadow-blue-500/20",
  },
  {
    name: "Violet",
    hex: "#7C3AED",
    primary: "#7C3AED",
    gradient: "from-violet-600 to-violet-500",
    light: "#EDE9FE",
    stroke: "#5B21B6",
    glow: "shadow-violet-500/20",
  },
  {
    name: "Emerald",
    hex: "#059669",
    primary: "#059669",
    gradient: "from-emerald-600 to-emerald-500",
    light: "#D1FAE5",
    stroke: "#065F46",
    glow: "shadow-emerald-500/20",
  },
  {
    name: "Amber",
    hex: "#D97706",
    primary: "#D97706",
    gradient: "from-amber-500 to-amber-400",
    light: "#FEF3C7",
    stroke: "#B45309",
    glow: "shadow-amber-500/20",
  },
  {
    name: "Orange",
    hex: "#EA580C",
    primary: "#EA580C",
    gradient: "from-orange-600 to-orange-500",
    light: "#FFEDD5",
    stroke: "#9A3412",
    glow: "shadow-orange-500/20",
  },
  {
    name: "Cyan",
    hex: "#06B6D4",
    primary: "#06B6D4",
    gradient: "from-cyan-600 to-cyan-500",
    light: "#CFFAFE",
    stroke: "#0891B2",
    glow: "shadow-cyan-500/20",
  },
  {
    name: "Fuchsia",
    hex: "#D946EF",
    primary: "#D946EF",
    gradient: "from-fuchsia-600 to-fuchsia-500",
    light: "#FAE8FF",
    stroke: "#C026D3",
    glow: "shadow-fuchsia-500/20",
  },
  {
    name: "Indigo",
    hex: "#4F46E5",
    primary: "#4F46E5",
    gradient: "from-indigo-600 to-indigo-500",
    light: "#E0E7FF",
    stroke: "#3730A3",
    glow: "shadow-indigo-500/20",
  },
  {
    name: "Teal",
    hex: "#0D9488",
    primary: "#0D9488",
    gradient: "from-teal-600 to-teal-500",
    light: "#CCFBF1",
    stroke: "#0F766E",
    glow: "shadow-teal-500/20",
  },
];

export function getTeamColorTheme(
  team: { name?: string; color?: string; themeColor?: string },
  index: number = 0
): TeamColorTheme {
  const colorStr = team?.color || team?.themeColor;

  // 1. If an explicit hex color is provided in MongoDB, use it dynamically
  if (colorStr && /^#([0-9A-F]{3}){1,2}$/i.test(colorStr)) {
    const match = PRESET_TEAM_THEMES.find(
      (p) => p.hex.toUpperCase() === colorStr.toUpperCase()
    );

    if (match) return match;

    // Custom hex from MongoDB (not in preset list)
    return {
      primary: colorStr,
      gradient: `from-[${colorStr}] to-[${colorStr}]`,
      light: `${colorStr}20`,
      stroke: colorStr,
      glow: "shadow-slate-500/20",
    };
  }

  // 2. Fallback to dynamic preset by index if team has no color
  return PRESET_TEAM_THEMES[Math.abs(index) % PRESET_TEAM_THEMES.length];
}

export function getTeamColorHex(
  team: { name?: string; color?: string; themeColor?: string },
  index: number = 0
): string {
  return getTeamColorTheme(team, index).primary;
}