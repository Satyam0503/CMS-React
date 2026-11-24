import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Clear from "@mui/icons-material/Clear";
import CreateOutlined from "@mui/icons-material/CreateOutlined";
import TextFieldsOutlined from "@mui/icons-material/TextFieldsOutlined";

interface OfferSignaturePadProps {
  candidateDefaultName?: string;
  onSignatureChange: (data: {
    signatureDataUrl: string | null;
    signerLegalName: string;
    consentChecked: boolean;
  }) => void;
}

export const OfferSignaturePad: React.FC<OfferSignaturePadProps> = ({
  candidateDefaultName = "",
  onSignatureChange,
}) => {
  const [tab, setTab] = useState<"draw" | "type">("draw");
  const [legalName, setLegalName] = useState<string>(candidateDefaultName);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    if (candidateDefaultName && !legalName) {
      setLegalName(candidateDefaultName);
    }
  }, [candidateDefaultName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e293b"; // dark slate ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [tab]);

  // Generate data URL from typed text using an offscreen canvas
  const getTypedSignatureDataUrl = (name: string): string | null => {
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = 450;
      offscreen.height = 120;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);
        ctx.fillStyle = "#0f172a";
        ctx.font = "italic 36px 'Dancing Script', 'Caveat', 'Brush Script MT', cursive";
        ctx.textBaseline = "middle";
        ctx.fillText(name.trim() || "Signature", 30, 60);
      }
      if (!ctx) return null;
      const dataUrl = offscreen.toDataURL("image/png");
      if (dataUrl && dataUrl.startsWith("data:image/png;base64,")) return dataUrl;
    } catch {
      // Fallback for non-canvas environments
    }
    return null;
  };

  const notifyChange = (currentTab = tab, drawnDataUrl?: string, customConsent = consentChecked, customName = legalName) => {
    let finalUrl: string | null = null;
    if (currentTab === "draw") {
      finalUrl = hasDrawn && canvasRef.current ? (drawnDataUrl || canvasRef.current.toDataURL("image/png")) : null;
    } else {
      finalUrl = customName.trim() ? getTypedSignatureDataUrl(customName) : null;
    }

    onSignatureChange({
      signatureDataUrl: finalUrl,
      signerLegalName: customName.trim(),
      consentChecked: customConsent,
    });
  };

  // Drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    notifyChange();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange({
      signatureDataUrl: null,
      signerLegalName: legalName.trim(),
      consentChecked,
    });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        Digital E-Signature
      </Typography>

      <TextField
        fullWidth
        size="small"
        label="Full Legal Name"
        placeholder="Enter your full name as on government ID"
        value={legalName}
        onChange={(e) => {
          setLegalName(e.target.value);
          onSignatureChange({
            signatureDataUrl: tab === "type" && e.target.value.trim() ? getTypedSignatureDataUrl(e.target.value) : (hasDrawn && canvasRef.current ? canvasRef.current.toDataURL("image/png") : null),
            signerLegalName: e.target.value.trim(),
            consentChecked,
          });
        }}
      />

      <Tabs
        value={tab}
        onChange={(_, val: "draw" | "type") => {
          setTab(val);
          notifyChange(val);
        }}
        sx={{ minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700 } }}
      >
        <Tab value="draw" icon={<CreateOutlined sx={{ fontSize: 16 }} />} iconPosition="start" label="Draw Signature" />
        <Tab value="type" icon={<TextFieldsOutlined sx={{ fontSize: 16 }} />} iconPosition="start" label="Type Signature" />
      </Tabs>

      {tab === "draw" ? (
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              border: "1.5px dashed",
              borderColor: hasDrawn ? "primary.main" : "divider",
              borderRadius: "12px",
              bgcolor: "background.paper",
              p: 1,
              touchAction: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              width={450}
              height={120}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                width: "100%",
                height: "120px",
                display: "block",
                cursor: "crosshair",
              }}
              aria-label="Signature canvas: draw your signature with mouse or touch"
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.8 }}>
            <Typography variant="caption" color="text.secondary">
              Use mouse, pen, or touch to sign inside the box
            </Typography>
            {hasDrawn && (
              <Button size="small" onClick={handleClear} startIcon={<Clear sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                Clear
              </Button>
            )}
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            p: 3,
            border: "1.5px dashed",
            borderColor: legalName.trim() ? "primary.main" : "divider",
            borderRadius: "12px",
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive",
              fontSize: "2rem",
              color: legalName.trim() ? "text.primary" : "text.secondary",
              letterSpacing: "0.02em",
            }}
          >
            {legalName.trim() || "Signature Preview"}
          </Typography>
        </Box>
      )}

      {/* Legal Consent Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={consentChecked}
            onChange={(e) => {
              setConsentChecked(e.target.checked);
              onSignatureChange({
                signatureDataUrl: tab === "type" && legalName.trim() ? getTypedSignatureDataUrl(legalName) : (hasDrawn && canvasRef.current ? canvasRef.current.toDataURL("image/png") : null),
                signerLegalName: legalName.trim(),
                consentChecked: e.target.checked,
              });
            }}
            color="primary"
          />
        }
        label={
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4 }}>
            I agree that my electronic signature constitutes a legally binding acceptance of this employment offer under applicable laws and regulations.
          </Typography>
        }
      />
    </Stack>
  );
};
