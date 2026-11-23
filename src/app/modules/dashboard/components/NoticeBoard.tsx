import { Avatar, Box, Stack, Typography, alpha } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { initialNoticeFilter, relativeTimeFormatter } from "../../../../utils/common";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { NoticeViewModel } from "../../noticeboard/components/NoticeViewModel";
import { NoticeResponseModel } from "../../noticeboard/models";
import { getAllNotices } from "../../noticeboard/services";
import { CardMessage, DashboardCard, ListSkeleton, ViewAllLink } from "./DashboardCard";

export default function NoticeBoard() {
  const [isLoading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeResponseModel[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeResponseModel | null>(null);
  const { formatMessage } = useIntl();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getAllNotices({
          ...initialNoticeFilter,
          pageNo: 1,
          records: 4,
          postedBy: "",
        });
        if (isMounted && data.success) {
          setNoticeList(data.methodResults);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateNoticeViewedStatus = (noticeId: string) => {
    setNoticeList((prev) =>
      prev.map((notice) =>
        notice.noticeId === noticeId ? { ...notice, viewedStatus: true } : notice,
      ),
    );
  };

  if (isLoading) {
    return (
      <DashboardCard id="notice-board" title={formatMessage({ id: "PAGE.NOTICE_BOARD" })}>
        <ListSkeleton rows={3} />
      </DashboardCard>
    );
  }

  return (
    <>
      <DashboardCard
        id="notice-board"
        title={formatMessage({ id: "PAGE.NOTICE_BOARD" })}
        action={<ViewAllLink to="/noticeboard/notices" />}
      >
        {noticeList.length === 0 ? (
          <CardMessage>
            {formatMessage({ id: "NOTICE.TITLES.NO_NOTICE" })}
          </CardMessage>
        ) : (
          <Stack
            spacing={1.25}
            sx={{
              maxHeight: { xs: 320, sm: 360 },
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarGutter: "stable",
              pr: 0.5,
            }}
          >
            {noticeList.map((item) => (
              <Stack
                key={item.noticeId}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{
                  p: 1.25,
                  borderRadius: "10px",
                  bgcolor: item.viewedStatus ? "transparent" : (theme) => alpha(theme.palette.primary.main, 0.04),
                  border: 1,
                  borderColor: item.viewedStatus ? "divider" : "primary.light",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Avatar
                    src={item.userProfile || DEFAULT_USER_AVATAR}
                    alt={item.userName}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "secondary.main",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.2 }} noWrap>
                      {item.userName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        fontSize: "0.8125rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        my: 0.25,
                      }}
                    >
                      {item.noticeTitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                    >
                      {relativeTimeFormatter(item.createdDateTime)}
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  component="button"
                  type="button"
                  sx={{
                    background: "none",
                    border: "none",
                    p: 0.5,
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    flexShrink: 0,
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.dark",
                    },
                  }}
                  onClick={() => setSelectedNotice(item)}
                >
                  {formatMessage({ id: "BUTTON.VIEW" })}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </DashboardCard>
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
