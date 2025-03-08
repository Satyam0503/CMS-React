import { Typography } from "@mui/material";

import { useIntl } from "react-intl";
import Projects from "./components/Projects";

export default function ProjectsWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.PROJECTS" })}
      </Typography>
      <Projects />
    </>
  );
}
