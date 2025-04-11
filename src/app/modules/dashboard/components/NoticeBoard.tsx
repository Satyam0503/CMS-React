import {
  Typography,
  Card,
  Grid,
  Stack,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  Divider,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check, Visibility } from "@mui/icons-material";
import EmployeePerformance from "./EmployeePerformance";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { colors } from "../../theme/MuiTheme";
import { CustomCard } from "../../../shared/components/CustomCard";

type Props = {
  className: string;
};

export default function NoticeBoard() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "PAGE.NOTICE_BOARD" })}>
        <Stack
          sx={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
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
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  10 mins ago
                </Typography>
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
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  1 Hour ago
                </Typography>
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
