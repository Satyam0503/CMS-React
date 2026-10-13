import { BookmarkBorderRounded, BookmarkRounded } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { useCareerVisitor } from "../hooks/useCareerVisitor";
import { saveJob, unsaveJob } from "../services/careerPortalService";
import { IconBtn } from "../../../shared/components/ui";
import { useSavedJobs } from "../context/SavedJobsContext";

type Props = { publicJobId: string; onChange?: (saved: boolean) => void };

export const SaveJobButton = ({ publicJobId, onChange }: Props) => {
  const [busy, setBusy] = useState(false);
  const { visitorToken, sessionToken } = useCareerVisitor();
  const { savedIds, setJobSaved } = useSavedJobs();
  const saved = savedIds.has(publicJobId);

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (saved) await unsaveJob(publicJobId, visitorToken, sessionToken);
      else await saveJob(publicJobId, visitorToken, sessionToken);
      setJobSaved(publicJobId, !saved);
      onChange?.(!saved);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Tooltip title={saved ? "Remove saved job" : "Save job"}>
      <span>
        <IconBtn
          disabled={busy}
          onClick={toggle}
          color={saved ? "primary" : "default"}
          aria-label={saved ? "Remove saved job" : "Save job"}
          sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          {saved ? <BookmarkRounded /> : <BookmarkBorderRounded />}
        </IconBtn>
      </span>
    </Tooltip>
  );
};
