import { BusinessRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useState } from "react";

type CompanyLogoProps = {
  src?: string | null;
  name: string;
  size?: number;
};

/** A company logo is a brand asset, not a portrait: preserve the entire mark. */
export const CompanyLogo = ({ src, name, size = 56 }: CompanyLogoProps) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        borderRadius: Math.max(2, Math.round(size / 14)),
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 6px 16px color-mix(in srgb, var(--mui-palette-common-black) 10%, transparent)",
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src ?? undefined}
          alt={`${name} logo`}
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "contain", p: Math.max(0.5, size / 80), display: "block" }}
        />
      ) : name ? (
        <Typography fontWeight={900} color="primary.dark" sx={{ fontSize: size * 0.36 }} aria-label={`${name} logo unavailable`}>
          {name.trim().charAt(0).toUpperCase()}
        </Typography>
      ) : <BusinessRounded color="primary" />}
    </Box>
  );
};
