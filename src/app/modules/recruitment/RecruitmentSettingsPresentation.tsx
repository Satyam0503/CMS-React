import { Box, ButtonBase, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import SpeedRounded from "@mui/icons-material/SpeedRounded";

type IconType = typeof SpeedRounded;

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface RecruitmentModeCardProps {
  title: string;
  subtitle: string;
  badge: string;
  accentPalette: "primary" | "secondary" | "success";
  icon: IconType;
  features: string[];
  active: boolean;
  index: number;
  onSelect: () => void;
}

export function RecruitmentModeCard({
  title,
  subtitle,
  badge,
  accentPalette,
  icon: Icon,
  features,
  active,
  index,
  onSelect,
}: RecruitmentModeCardProps) {
  const theme = useTheme();
  const accentColor = theme.palette[accentPalette].main;

  return (
    <ButtonBase
      component="button"
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={title}
      sx={{
        p: { xs: 2, sm: 2.25 },
        minHeight: 220,
        height: "100%",
        border: "1px solid",
        borderColor: active ? accentColor : "divider",
        borderRadius: 1.5,
        bgcolor: active ? alpha(accentColor, theme.palette.mode === "dark" ? 0.16 : 0.055) : "background.paper",
        color: "text.primary",
        textAlign: "left",
        alignItems: "stretch",
        justifyContent: "flex-start",
        flexDirection: "column",
        transition: theme.transitions.create(["border-color", "background-color", "box-shadow", "transform"], {
          duration: theme.transitions.duration.short,
        }),
        animation: `${riseIn} 420ms ${theme.transitions.easing.easeOut} both`,
        animationDelay: `${index * 65}ms`,
        "&:hover": {
          borderColor: accentColor,
          boxShadow: `0 3px 12px ${alpha(accentColor, 0.1)}`,
          transform: "translateY(-2px)",
        },
        "&:focus-visible": { outline: `2px solid ${accentColor}`, outlineOffset: 2 },
        "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none", "&:hover": { transform: "none" } },
      }}
    >
      <Stack width="100%" spacing={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <Box
              aria-hidden="true"
              sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Box minWidth={0}>
              <Typography fontWeight={700} sx={{ fontSize: "0.94rem", lineHeight: 1.3 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, lineHeight: 1.4 }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          {active ? (
            <Chip
              size="small"
              icon={<CheckCircleRounded sx={{ fontSize: "14px !important", color: `${accentColor} !important` }} />}
              label="Selected"
              sx={{ height: 24, flexShrink: 0, bgcolor: "background.paper", color: accentColor, fontWeight: 650 }}
            />
          ) : (
            <Chip size="small" variant="outlined" label={badge} sx={{ height: 24, flexShrink: 0, fontWeight: 600 }} />
          )}
        </Stack>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
        <Stack spacing={0.9}>
          {features.map((feature) => (
            <Stack direction="row" spacing={1} alignItems="flex-start" key={feature}>
              <CheckCircleOutlineRounded sx={{ fontSize: 15, mt: 0.2, flexShrink: 0, color: active ? accentColor : "text.disabled" }} />
              <Typography variant="caption" sx={{ fontSize: "0.77rem", lineHeight: 1.45, color: "text.secondary" }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

export function RecruitmentPipeline({ mode, steps }: { mode: string; steps: string[] }) {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5, bgcolor: "background.paper" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1.75 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.94rem" }}>
            Hiring pipeline
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Candidate stages for the {mode} hiring model.
          </Typography>
        </Box>
        <Chip size="small" label={`${steps.length} stages`} color="primary" variant="outlined" sx={{ height: 24, fontWeight: 600 }} />
      </Stack>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          overflowX: "auto",
          py: 0.5,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
        }}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <Stack direction="row" alignItems="center" spacing={1} key={`${index}-${step}`} sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.85,
                  px: 1.25,
                  borderRadius: 1,
                  bgcolor: isLast ? alpha(theme.palette.success.main, 0.08) : "background.default",
                  border: "1px solid",
                  borderColor: isLast ? alpha(theme.palette.success.main, 0.35) : "divider",
                  transition: theme.transitions.create(["border-color", "background-color", "transform"], {
                    duration: theme.transitions.duration.short,
                  }),
                  "&:hover": { borderColor: isLast ? "success.main" : "primary.main", transform: "translateY(-2px)" },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": { transform: "none" },
                  },
                }}
              >
                <Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "0.66rem", fontWeight: 700, bgcolor: isLast ? "success.main" : "primary.main", color: "common.white" }}>
                  {index + 1}
                </Box>
                <Typography variant="caption" fontWeight={650} sx={{ whiteSpace: "nowrap", color: isLast ? "success.dark" : "text.primary" }}>
                  {step}
                </Typography>
              </Box>
              {!isLast && <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />}
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}

export function ScrollReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const theme = useTheme();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={elementRef}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: theme.transitions.create(["opacity", "transform"], {
          duration: theme.transitions.duration.enteringScreen,
          easing: theme.transitions.easing.easeOut,
          delay,
        }),
        "@media (prefers-reduced-motion: reduce)": { opacity: 1, transform: "none", transition: "none" },
      }}
    >
      {children}
    </Box>
  );
}
