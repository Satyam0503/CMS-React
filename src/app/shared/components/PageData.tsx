import { KeyboardBackspace } from "@mui/icons-material";
import { Breadcrumbs, IconButton, Stack, Typography } from "@mui/material";
import { useBreadcrumbs, replacePathParams } from "react-breadcrumble";
import { Link, useLocation } from "react-router-dom";
import { usePageData } from "../../../_themes/layout/core";
import { useIntl } from "react-intl";

const PageData = () => {
  const { getBreadcrumbTrail } = useBreadcrumbs();
  const location = useLocation();
  const trail = getBreadcrumbTrail(location.pathname);
  const { pageTitle } = usePageData();
  const intl = useIntl();

  return (
    <Stack
      spacing={1}
      sx={{ mb: 2 }}
      direction={"row"}
      className="justify-content-between"
    >
      {pageTitle && <Typography variant="h4" className="fw-bold">{pageTitle}</Typography>}
      {trail.length > 1 && (
        <Stack
          direction={"row"}
          spacing={1}
          className="justify-content-start align-items-center"
        >
          <IconButton
            className="border-0 bg-transparent p-0"
            onClick={() => history.back()}
          >
            <KeyboardBackspace />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            {trail.map((breadcrumb, index) => {
              return trail.length === index + 1 ? (
                <Typography key={index}>
                  {intl.formatMessage({ id: breadcrumb.label })}
                </Typography>
              ) : (
                <Link
                  to={replacePathParams(breadcrumb.path, breadcrumb.params)}
                  key={index}
                  className="breadcrumb-link"
                >
                  {intl.formatMessage({ id: breadcrumb.label })}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Stack>
      )}
    </Stack>
  );
};

export { PageData };
