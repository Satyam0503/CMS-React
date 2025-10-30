import { FC, useEffect, useState } from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import {
    Avatar,
    Box,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import {
    relativeTimeFormatter,
    sanitizeHtmlContent,
} from "../../../../utils/common";
import { getNoticeById } from "../services";
import { NoticeResponseModel } from "../models";
import { AccessTimeFilled } from "@mui/icons-material";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";

type Props = {
    open: boolean;
    noticeId: string;
    handleClose: () => void;
    updateNoticeViewedStatus?: (noticeId: string) => void;
};

export const NoticeViewModel: FC<Props> = (props) => {
    const { formatMessage } = useIntl();
    const [notice, setNotice] = useState<NoticeResponseModel>();
    const [loading, setLoading] = useState(true);
    const { currentLanguage } = useAppLang();
    const defaultLanguage = useAppSelector(
        (state) => state.user.userData?.defaultLanguage!
    );

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getNoticeById(props.noticeId);
                if (data.success) {
                    setNotice(data.methodResult);
                    props.updateNoticeViewedStatus?.(props.noticeId);
                } else {
                    props.handleClose();
                }
            } catch (error: any) {
                console.error(error.message);
                props.handleClose();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <CustomisedModal
            maxWidth="xs"
            open={props.open}
            handleClose={props.handleClose}
        >
            {loading ? (
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                        <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
                        <Stack className="w-100">
                            <Skeleton variant="text" />
                            <Skeleton variant="text" />
                        </Stack>
                    </Stack>
                    <Stack className="w-100">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                    </Stack>
                </Stack>
            ) : (
                <Stack spacing={2}>
                    <Stack className="flex-row gap-2">
                        <Avatar
                            src={notice?.userProfile || DEFAULT_USER_AVATAR}
                            alt={notice?.userName}
                            className="shadow-sm"
                        />
                        <Stack className="w-100">
                            <Typography variant="body1">{notice?.userName}</Typography>
                            <Stack className="flex-row gap-4">
                                {
                                    notice?.userDesignation &&
                                    <Typography variant="caption">
                                        {
                                            notice?.userDesignation[currentLanguage] || notice?.userDesignation[defaultLanguage]
                                        }
                                    </Typography>
                                }
                                <Typography
                                    variant="caption"
                                    sx={{ color: "primary.main" }}
                                    className="d-flex align-items-center gap-1 lh-1"
                                >
                                    <AccessTimeFilled className="fs-12" />
                                    {relativeTimeFormatter(notice?.createdDateTime!)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Divider className="mt-2" />
                    <Box
                        className="html-content"
                        component="div"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlContent(notice?.noticeMessage ?? ""),
                        }}
                    />
                    <CustomisedButton
                        variant="outlined"
                        className="align-self-end"
                        label={formatMessage({ id: "BUTTON.CLOSE" })}
                        handleClick={props.handleClose}
                    />
                </Stack>
            )}
        </CustomisedModal>
    );
};
