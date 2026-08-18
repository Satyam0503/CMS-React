import { Box, Breadcrumbs, Stack, Typography } from "@mui/material";
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
  const activeBreadcrumb = trail[trail.length - 1];
  const currentSegments = location.pathname.split("/").filter(Boolean);
  const editApplicantMatch = location.pathname.match(
    /^\/recruitment\/applicant\/edit\/([^/]+)\/?$/
  );
  const patternSegments = activeBreadcrumb?.path.split("/").filter(Boolean) ?? [];
  const routeParams = patternSegments.reduce<Array<{ key: string; value: string }>>(
    (params, segment, index) => {
      const match = segment.match(/^\{(.+)\}$/);
      if (match && currentSegments[index]) {
        params.push({ key: match[1], value: decodeURIComponent(currentSegments[index]) });
      }
      return params;
    },
    []
  );

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1.25, md: 3 }}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent={{ md: "space-between" }}
      sx={{ minWidth: 0, width: "100%" }}
    >
      {pageTitle && <Typography variant="h4" className="fw-bold" sx={{ minWidth: 0 }}>{pageTitle}</Typography>}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        useFlexGap
        flexWrap="wrap"
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent={{ md: "flex-end" }}
        sx={{ minWidth: 0, ml: { md: "auto" } }}
      >
        {trail.length > 1 && (
          <Stack
            className="flex-row justify-content-start align-items-center"
            sx={{ position: "relative", zIndex: 1, pointerEvents: "auto", minWidth: 0 }}
          >
            <Breadcrumbs aria-label="breadcrumb">
              {trail.map((breadcrumb, index) => {
                const label = intl.formatMessage({ id: breadcrumb.label });
                const resolvedTarget = replacePathParams(
                  breadcrumb.path,
                  [...(breadcrumb.params ?? []), ...routeParams]
                );
                const target =
                  breadcrumb.label === "PAGE.APPLICANT" && editApplicantMatch
                    ? `/recruitment/applicant/${encodeURIComponent(
                        decodeURIComponent(editApplicantMatch[1])
                      )}`
                    : resolvedTarget;

                return trail.length === index + 1 ? (
                  <Typography key={index}>{label}</Typography>
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
        <Box
          id="page-header-actions"
          sx={{
            minWidth: 0,
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        />
      </Stack>
    </Stack>
  );
};

export { PageData };
