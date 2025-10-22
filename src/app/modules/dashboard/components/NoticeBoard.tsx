import { Typography, Stack, Avatar, Box, useTheme } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomCard } from "../../../shared/components/CustomCard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { NoticeResponseModel } from "../../noticeboard/models";
import { getAllNotices } from "../../noticeboard/services";
import clsx from "clsx";
import { relativeTimeFormatter } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { initialNoticeFilter } from "../../noticeboard/components/NoticeBoardFilter";
import { NoticeViewModel } from "../../noticeboard/components/NoticeViewModel";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";

export default function NoticeBoard() {
  const [isLoading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeResponseModel[]>([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const { formatMessage } = useIntl();
  const { typography } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllNotices({
          ...initialNoticeFilter,
          pageNo: 1,
          records: 4,
          postedBy: "",
        });
        if (data.success) {
          setNoticeList(data.methodResults);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <CustomCard label={formatMessage({ id: "PAGE.NOTICE_BOARD" })}>
        <Stack
          className={clsx("flex-grow-1 gap-4 mt-4", {
            "justify-content-center": noticeList.length === 0,
          })}
        >
          {noticeList.length === 0 ? (
            <Typography className="text-center">
              {formatMessage({ id: "NOTICE.TITLES.NO_NOTICE" })}
            </Typography>
          ) : (
            <>
              <Stack spacing={0.5} className="flex-grow-1">
                {noticeList.map((item) => (
                  <Stack
                    key={item.noticeId}
                    className="flex-row justify-content-between align-items-center px-2 py-1 rounded hover-secondary"
                  >
                    <Box
                      component="div"
                      key={item.noticeId}
                      className="d-flex flex-row align-items-start gap-2"
                    >
                      <Avatar
                        src={item.userProfile || DEFAULT_USER_AVATAR}
                        alt={item.userName}
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: "secondary.main",
                        }}
                      />
                      <Stack>
                        <Typography >{item.userName}</Typography>
                        <Typography
                          variant="body2"
                          className={clsx("truncate-multi-line", { "text-decoration-line-through": item.viewedStatus })}
                          sx={{ fontSize: 14 }}
                        >
                          {item.noticeTitle}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main" }}
                        >
                          {relativeTimeFormatter(item.createdDateTime)}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        color: "secondary.main",
                        mx: 2,
                        "&:hover": {
                          color: "secondary.dark",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedNoticeId(item.noticeId)}
                    >
                      {formatMessage({ id: "BUTTON.VIEW" })}
                    </Box>
                  </Stack>
                ))}
              </Stack>
              <Link to="/noticeboard/notices">
                {formatMessage({ id: "BUTTON.SEE_MORE" })}
              </Link>
            </>
          )}
        </Stack>
      </CustomCard>
      {selectedNoticeId && (
        <NoticeViewModel
          noticeId={selectedNoticeId}
          open={true}
          handleClose={() => setSelectedNoticeId(null)}
        />
      )}
    </>
  );
}
