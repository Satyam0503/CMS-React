import { Breadcrumbs, Stack, Typography } from "@mui/material";
import { useBreadcrumbs, replacePathParams } from "react-breadcrumble";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { usePageData } from "../../Context/PageDataProvider";

const PageData = () => {
  const { getBreadcrumbTrail } = useBreadcrumbs();
  const location = useLocation();
  const trail = getBreadcrumbTrail(location.pathname);
  const { pageTitle } = usePageData();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <Stack className="justify-content-between flex-row flex-wrap gap-2" >
      {pageTitle && <Typography variant="h4" className="fw-bold">{pageTitle}</Typography>}
      {trail.length > 1 && (
        <Stack
          className="flex-row justify-content-start align-items-center"
          sx={{ position: "relative", zIndex: 1, pointerEvents: "auto" }}
        >
          <Breadcrumbs aria-label="breadcrumb">
            {trail.map((breadcrumb, index) => {
              const label = intl.formatMessage({ id: breadcrumb.label });
              const target = replacePathParams(breadcrumb.path, breadcrumb.params);

              return trail.length === index + 1 ? (
                <Typography key={index}>
                  {label}
                </Typography>
              ) : (
                <Link
                  to={target}
                  key={index}
                  className="breadcrumb-link"
                  aria-label={`Back to ${label}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(target);
                  }}
                >
                  {label}
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
