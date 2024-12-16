import { Typography, Card, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { KTIcon, toAbsoluteUrl } from "../../../_themes/helpers";

type Props = {
  className: string;
};

export default function NoticeBoard() {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ p: "15px", width: "100%" }}>
          <Typography variant="h6" sx={{ mb: "5px" }}>
            {intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            className="mb-2 d-flex justify-content-between align-items-center"
          >
            <Stack direction="row">
              <Stack className="me-4 symbol symbol-45px">
                <img
                  src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                  alt=""
                  className="rounded-circle"
                />
              </Stack>
              <Stack>
                <Typography
                  variant="body1"
                  className="text-gray-800 text-hover-primary fw-semibold "
                >
                  Dinesh Chauhan
                </Typography>
                <Typography variant="body2" className="text-muted  d-block ">
                  Outlines keep you honest. They stop you from indulging in
                  poorly thought-out metaphors about driving and keep you
                  focused on the overall structure of your post
                </Typography>
                <Typography variant="subtitle2" className="text-primary">
                  10 mins ago
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" className="d-flex align-items-center mb-5">
              <Stack className="btn btn-sm bg-white border btn-active-light-success p-2 me-4">
                <KTIcon iconName="check" className="fs-4" />
              </Stack>

              <Stack className="btn btn-sm bg-white border btn-active-light-primary p-2">
                <KTIcon iconName="eye" className="fs-4" />
              </Stack>
            </Stack>
          </Stack>

          <Grid className="separator mb-4"></Grid>
          <Stack
            direction="row"
            spacing={2}
            className="mb-2 d-flex justify-content-between align-items-center"
          >
            <Stack direction="row">
              <Stack className="me-4 symbol symbol-45px">
                <img
                  src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                  alt=""
                  className="rounded-circle"
                />
              </Stack>
              <Stack>
                <Typography
                  variant="body1"
                  className="text-gray-800 text-hover-primary fw-semibold "
                >
                  Ajay Rana
                </Typography>
                <Typography variant="body2" className="text-muted d-block ">
                  Outlines keep you honest. They stop you from indulging in
                  poorly thought-out metaphors about driving and keep you
                  focused on the overall structure of your post
                </Typography>
                <Typography variant="subtitle2" className="text-primary">
                  1 Hour ago
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" className="d-flex align-items-center mb-5">
              <Stack className="btn btn-sm bg-white border btn-active-light-success p-2 me-4">
                <KTIcon iconName="check" className="fs-4" />
              </Stack>

              <Stack className="btn btn-sm bg-white border btn-active-light-primary p-2">
                <KTIcon iconName="eye" className="fs-4" />
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
