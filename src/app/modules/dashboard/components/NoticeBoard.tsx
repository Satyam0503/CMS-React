import { Typography, Stack, Avatar, Box } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomCard } from "../../../shared/components/C_Card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { NoticeResponseModel } from "../../noticeboard/models";
import { getAllNotices } from "../../noticeboard/services";
import clsx from "clsx";
import { initialNoticeFilter, relativeTimeFormatter } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { NoticeViewModel } from "../../noticeboard/components/NoticeViewModel";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";

export default function NoticeBoard() {
  const [isLoading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeResponseModel[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeResponseModel | null>(null);
  const { formatMessage } = useIntl();

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

  const updateNoticeViewedStatus = (noticeId: string) => {
    setNoticeList(noticeList.map(notice => {
      if (notice.noticeId === noticeId) {
        return {
          ...notice,
          viewedStatus: true
        }
      }
      else {
        return notice;
      }
    }))
  }

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <CustomCard
        label={formatMessage({ id: "PAGE.NOTICE_BOARD" })}
        applyMinHeight={false}
      >
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
              <Stack
                spacing={0.8}
                className="flex-grow-1"
                sx={{
                  maxHeight: { xs: 320, sm: 360 },
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollbarGutter: "stable",
                }}
              >
                {noticeList.map((item) => (
                  <Stack
                    key={item.noticeId}
                    className={clsx("flex-row align-items-center px-2 py-1 rounded hover-secondary notice-board-row", { "unread-notice": !item.viewedStatus })}
                  >
                    <Box
                      component="div"
                      key={item.noticeId}
                      className="d-flex flex-row align-items-center gap-2 notice-board-content"
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
                          className={clsx("truncate-multi-line")}
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
                        ml: { xs: 0, sm: 1 },
                        "&:hover": {
                          color: "secondary.dark",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedNotice(item)}
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
      {selectedNotice && (
        <NoticeViewModel
          noticeId={selectedNotice.noticeId}
          open={true}
          handleClose={() => setSelectedNotice(null)}
          updateNoticeViewedStatus={selectedNotice.viewedStatus ? undefined : updateNoticeViewedStatus}
        />
      )}
    </>
  );
}
