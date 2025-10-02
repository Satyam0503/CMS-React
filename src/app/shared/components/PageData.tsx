import { Breadcrumbs, IconButton, Stack, Typography } from "@mui/material";
import { useBreadcrumbs, replacePathParams } from "react-breadcrumble";
import { Link, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import { usePageData } from "../../Context/PageDataProvider";

const PageData = () => {
  const { getBreadcrumbTrail } = useBreadcrumbs();
  const location = useLocation();
  const trail = getBreadcrumbTrail(location.pathname);
  const { pageTitle } = usePageData();
  const intl = useIntl();

  return (
    <Stack className="justify-content-between flex-row flex-wrap gap-2" >
      {pageTitle && <Typography variant="h4" className="fw-bold">{pageTitle}</Typography>}
      {trail.length > 1 && (
        <Stack
          className="flex-row justify-content-start align-items-center"
        >
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
