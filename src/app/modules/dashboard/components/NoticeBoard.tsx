import { Typography, Stack, Avatar } from "@mui/material";
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

export default function NoticeBoard() {
  const [isLoading, setLoading] = useState(true);
  const [noticeList, setNoticeList] = useState<NoticeResponseModel[]>([])
  const { formatMessage } = useIntl();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllNotices({
          ...initialNoticeFilter,
          pageNo: 1,
          records: 4,
          postedBy: ""
        });
        if (data.success) {
          setNoticeList(data.methodResults);
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false)
      }
    })();
  }, [])

  if (isLoading) {
    return <CardSkeleton />
  }

  return (
    <>
      <CustomCard label={formatMessage({ id: "PAGE.NOTICE_BOARD" })}>
        <Stack className={clsx("flex-grow-1 gap-4 mt-4", { "justify-content-center": Boolean(noticeList.length) })}>
          {
            noticeList.length === 0 ?
              <Typography className="align-self-center">No Notices Available</Typography>
              :
              <>
                <Stack spacing={1.5} className="flex-grow-1">
                  {
                    noticeList.map(item => (
                      <Stack key={item.noticeId} direction="row" gap={1.5}>
                        <Avatar
                          src={item.userProfile}
                          alt="User Profile"
                          sx={{ width: 45, height: 45, color: "secondary.main" }}
                        />
                        <Stack>
                          <Typography variant="body1">{item.userName}</Typography>
                          <Typography variant="body2" className="truncate-multi-line" sx={{ fontSize: 14 }}>
                            {item.noticeMessage}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.main' }}>{relativeTimeFormatter(item.createdDateTime)}</Typography>
                        </Stack>
                      </Stack>
                    ))
                  }
                </Stack>
                <Link to="/noticeboard/notices">
                  {formatMessage({ id: "SEE_MORE" })}
                </Link>
              </>
          }
        </Stack>
      </CustomCard>
    </>
  );
}
