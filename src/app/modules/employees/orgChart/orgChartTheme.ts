import { BaseUrl } from "../../../../utils/constant/Constant";

export interface DepartmentTheme {
  bg: string;
  color: string;
  border: string;
  dot: string;
  accent: string;
}

export const resolveProfileImageUrl = (profileUrl?: string | null): string | undefined => {
  if (!profileUrl || typeof profileUrl !== "string") return undefined;
  const trimmed = profileUrl.trim();
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/media/")
  ) {
    return trimmed;
  }
  const cleanBase = (BaseUrl || "").replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  return cleanBase ? `${cleanBase}/${cleanPath}` : trimmed;
};

export const getDepartmentTheme = (departmentName?: string | null): DepartmentTheme => {
  const norm = (departmentName || "").toLowerCase().trim();

  if (norm.includes("exec") || norm.includes("leader") || norm.includes("director") || norm.includes("manage")) {
    return {
      bg: "#f5f3ff",
      color: "#6d28d9",
      border: "#ddd6fe",
      dot: "#8b5cf6",
      accent: "#7c3aed",
    };
  }
  if (norm.includes("eng") || norm.includes("tech") || norm.includes("dev") || norm.includes("software")) {
    return {
      bg: "#eff6ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
      dot: "#3b82f6",
      accent: "#2563eb",
    };
  }
  if (norm.includes("prod") || norm.includes("design") || norm.includes("ui") || norm.includes("ux")) {
    return {
      bg: "#ecfdf5",
      color: "#047857",
      border: "#a7f3d0",
      dot: "#10b981",
      accent: "#059669",
    };
  }
  if (norm.includes("hr") || norm.includes("people") || norm.includes("talent") || norm.includes("recruit")) {
    return {
      bg: "#fffbeb",
      color: "#b45309",
      border: "#fde68a",
      dot: "#f59e0b",
      accent: "#d97706",
    };
  }
  if (norm.includes("sale") || norm.includes("market") || norm.includes("growth")) {
    return {
      bg: "#fff1f2",
      color: "#be123c",
      border: "#fecdd3",
      dot: "#f43f5e",
      accent: "#e11d48",
    };
  }
  if (norm.includes("fin") || norm.includes("account") || norm.includes("legal")) {
    return {
      bg: "#f0fdfa",
      color: "#0f766e",
      border: "#99f6e4",
      dot: "#14b8a6",
      accent: "#0d9488",
    };
  }
  // Default / Unassigned / Operations
  return {
    bg: "#f8fafc",
    color: "#334155",
    border: "#e2e8f0",
    dot: "#64748b",
    accent: "#475569",
  };
};

export const getAvatarGradient = (name?: string | null): string => {
  const char = (name || "A").trim().charAt(0).toUpperCase();
  const code = char.charCodeAt(0) % 6;
  const gradients = [
    "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Purple
    "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald
    "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // Amber
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Pink
  ];
  return gradients[code];
};
