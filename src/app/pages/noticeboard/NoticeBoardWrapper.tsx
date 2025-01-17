import { Typography } from "@mui/material";

import { useIntl } from "react-intl";
import NoticeBoard from "../../modules/noticeboard/NoticeBoard";

export default function NoticeBoardWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
      </Typography>
      <NoticeBoard />
    </>
  );
}
