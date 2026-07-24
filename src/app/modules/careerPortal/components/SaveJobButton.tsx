import { BookmarkBorderRounded, BookmarkRounded } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useCareerVisitor } from "../hooks/useCareerVisitor";
import { saveJob, unsaveJob } from "../services/careerPortalService";

type Props = { publicJobId: string; initiallySaved?: boolean; onChange?: (saved: boolean) => void };

export const SaveJobButton = ({ publicJobId, initiallySaved = false, onChange }: Props) => {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const { visitorToken, sessionToken } = useCareerVisitor();
  useEffect(() => setSaved(initiallySaved), [initiallySaved]);

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (saved) await unsaveJob(publicJobId, visitorToken, sessionToken);
      else await saveJob(publicJobId, visitorToken, sessionToken);
      setSaved(!saved);
      onChange?.(!saved);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Tooltip title={saved ? "Remove saved job" : "Save job"}>
      <span>
        <IconButton
          disabled={busy}
          onClick={toggle}
          color={saved ? "primary" : "default"}
          aria-label={saved ? "Remove saved job" : "Save job"}
          sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          {saved ? <BookmarkRounded /> : <BookmarkBorderRounded />}
        </IconButton>
      </span>
    </Tooltip>
  );
};
