import { Typography, Stack, Link, Divider } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { CustomCard } from "../../../shared/components/CustomCard";

type Props = {
  className: string;
};

export default function NoticeBoard() {
  const { formatMessage } = useIntl();
  return (
    <>
      <CustomCard label={formatMessage({ id: "PAGE.NOTICE_BOARD" })}>
        <Stack className="flex-grow-1 justify-content-between">
          <Stack spacing={1}>
            <Stack direction="row" gap={1}>
              <Stack className="symbol symbol-45px">
                <img
                  src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                  alt=""
                  style={{ borderRadius: "50%" }}
                />
              </Stack>
              <Stack>
                <Typography variant="body1">Dinesh Chauhan</Typography>
                <Typography variant="body2" className="truncate-multi-line">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                  The point of using Lorem Ipsum is that it has a more-or-less
                  normal distribution of letters, as opposed to using 'Content
                  here, content here', making it look like readable English
                </Typography>
                <Typography variant="subtitle2">10 mins ago</Typography>
              </Stack>
            </Stack>
            <Divider />

            <Stack direction="row" gap={1}>
              <Stack className="symbol symbol-45px">
                <img
                  src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                  alt=""
                  style={{ borderRadius: "50%" }}
                />
              </Stack>
              <Stack>
                <Typography variant="body1">Ajay Rana</Typography>
                <Typography variant="body2" className="truncate-multi-line">
                  Outlines keep you honest. They stop you from indulging in
                  poorly thought-out
                </Typography>
                <Typography variant="subtitle2">1 Hour ago</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack>
            <Link href="noticeboard" underline="always">
              {"See more"}
            </Link>
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
