import { useEffect, useRef } from "react";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import Check from "@mui/icons-material/Check";

type Step = { id: string; label: string; helper: string };
type Props = {
  steps: Step[];
  activeIndex: number;
  completedIndex: number;
  canOpen: (id: string, index: number) => boolean;
  onSelect: (id: string) => void;
};

export function LifecycleNavigation({ steps, activeIndex, completedIndex, canOpen, onSelect }: Props) {
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const active = container?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!container || !active) return;
    const viewport = container.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.left < viewport.left) container.scrollLeft -= viewport.left - item.left;
    else if (item.right > viewport.right) container.scrollLeft += item.right - viewport.right;
  }, [activeIndex]);

  return (
    <Box ref={scrollRef} component="nav" aria-label="Hiring workflow" sx={{ overflowX: "auto", scrollbarWidth: "thin", pb: 1 }}>
      <Stack component="ol" direction="row" sx={{ minWidth: 560, m: 0, p: 0, listStyle: "none" }}>
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const complete = index <= completedIndex;
          const enabled = canOpen(step.id, index);
          return (
            <Box component="li" key={step.id} sx={{ flex: 1, minWidth: 0, position: "relative" }}>
              {index < steps.length - 1 && (
                <Box aria-hidden="true" sx={{ position: "absolute", top: 20, left: "50%", width: "100%", height: 2, bgcolor: complete ? "primary.main" : "divider" }} />
              )}
              <ButtonBase
                disabled={!enabled}
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                sx={{
                  position: "relative", width: "100%", px: 0.75, py: 0.75, borderRadius: 2,
                  display: "flex", flexDirection: "column", gap: 0.75, color: "text.primary",
                  transition: "background-color 180ms ease, color 180ms ease",
                  "&:hover": { bgcolor: "action.hover" },
                  "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 },
                  "&.Mui-disabled": { opacity: 0.6 },
                  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                }}
              >
                <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid", borderColor: active || complete ? "primary.main" : "divider", bgcolor: active || complete ? "primary.main" : "background.paper", color: active || complete ? "primary.contrastText" : "text.secondary", fontSize: "0.75rem", fontWeight: 700, transition: "background-color 180ms ease, border-color 180ms ease", "@media (prefers-reduced-motion: reduce)": { transition: "none" } }}>
                  {complete && !active ? <Check sx={{ fontSize: 16 }} /> : index + 1}
                </Box>
                <Box sx={{ minWidth: 0, textAlign: "center" }}>
                  <Typography variant="body2" fontWeight={active ? 700 : 600} noWrap>{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">{step.helper}</Typography>
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
