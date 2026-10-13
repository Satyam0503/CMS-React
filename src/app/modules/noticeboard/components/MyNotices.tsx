import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { MyNoticeModel, NoticeModel } from "../models";
import { usePageData } from "../../../Context/PageDataProvider";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, NOTICE_TYPE, Permission } from "../../../../utils/enums";
import { Card, Stack } from "@mui/material";
import { CustomisedTable } from "../../../shared/components/C_Table";
import { AddNotice } from "./AddNotice";
import { MyNoticeTableColumnList } from "../../../../utils/constant/Constant";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { Add, KeyboardArrowLeft } from "@mui/icons-material";
import { deleteMyNotice, getMyPostedNotices } from "../services";
import { Pagination } from "../../../shared/components/Pagination";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { toast } from "react-toastify";

export const initialNoticeValuesObj: NoticeModel = {
    message: "",
    title: "",
    target: "all",
    noticeType: NOTICE_TYPE.GENERAL,
    departments: "all",
}

export const MyNotices = () => {
    const { formatMessage } = useIntl();
    const [isModalOpen, setModalOpen] = useState(false);
    const [NoticeList, setNoticeList] = useState<NoticeModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 })
    const [totalRecords, setTotalRecords] = useState(0);
    const { setPageTitle } = usePageData();
    const userModulesPermissions = useAppSelector(state => state.user.userData?.modulePermission) || [];
    const navigate = useNavigate();
    const [initialNoticeValues, setInitialNoticeValue] = useState<NoticeModel>(initialNoticeValuesObj);
    const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>();
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.NoticeBoard, Permission.Create, userModulesPermissions);

    const handleClose = () => {
        setModalOpen(false);
        setInitialNoticeValue(initialNoticeValuesObj);
        setEdit(false);
    }

    const handleRefresh = () => {
        setRefresh(!refresh);
    }

    const handlePageChange = (page: number) => {
        setPaginationValues({
            ...paginationValues,
            pageNo: page,
        });
    };

    const handleRowPerPageChange = (rowPerPage: number) => {
        setPaginationValues({
            ...paginationValues,
            records: rowPerPage,
            pageNo: 0,
        });
    };

    const handleConfirmationOpen = (notice: NoticeModel) => {
        setSelectedNoticeId(notice.noticeId)
    }

    const handleRowClick = (notice: NoticeModel) => {
        const { views, ...updatedNotice } = notice;
        setInitialNoticeValue(updatedNotice);
        setModalOpen(true);
        setEdit(true);
    }
    const handleNoticeDelete = async (str: string) => {
        if (str === "ok" && selectedNoticeId) {
            try {
                const { data } = await deleteMyNotice(selectedNoticeId);
                if (data.success) {
                    toast.success(formatMessage({ id: "TOAST.SUCCESS.DELETE" }));
                    handleRefresh();
                    setSelectedNoticeId(null);
                }
                else {
                    toast.error(formatMessage({ id: "TOAST.FAILED.DELETE" }));
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
    useEffect(() => {
        setPageTitle(formatMessage({ id: "PAGE.MY_NOTICE" }));
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data, } = await getMyPostedNotices(paginationValues.pageNo + 1, paginationValues.records);
                if (data.success) {
                    setNoticeList(data.methodResults);
                    setTotalRecords(data.totalRecords);
                }
            } catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false)
            }
        })();
    }, [paginationValues, refresh])
    return (
        <>
            <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
                <Stack className="flex-row justify-content-end gap-2 flex-wrap" >
                    <CustomIconButton tooltip={formatMessage({ id: "BUTTON.GO_BACK" })} icon={<KeyboardArrowLeft />} handleClick={() => navigate("/noticeboard")} />
                    {
                        hasAddPermission &&
                        <CustomIconButton
                            tooltip={formatMessage({ id: "TOOLTIP.POST_NOTICE" })}
                            icon={<Add />}
                            handleClick={() => setModalOpen(true)}
                        />
                    }
                </Stack>

                <CustomisedTable
                    keyName="noticeId"
                    tabName={ModulesName.NoticeBoard}
                    rows={NoticeList}
                    columns={MyNoticeTableColumnList}
                    page={paginationValues.pageNo}
                    rowsPerPage={paginationValues.records}
                    loading={loading}
                    openConfirmationModal={handleConfirmationOpen}
                    rowClickHandler={handleRowClick}
                />
                {
                    totalRecords > paginationValues.records &&
                    <Pagination
                        page={paginationValues.pageNo}
                        rowsPerPage={paginationValues.records}
                        setPage={handlePageChange}
                        setRowPerPage={handleRowPerPageChange}
                        totalRecords={totalRecords}
                    />
                }
            </Card>
            {
                isModalOpen &&
                <AddNotice initialValues={initialNoticeValues} refresh={handleRefresh} open={true} handleClose={handleClose} isEdit={isEdit} />
            }
            {
                selectedNoticeId &&
                <ConfirmationModal
                    open={true}
                    title={formatMessage({ id: "CONFIRMATION.TITLE.DELETE_NOTICE" })}
                    content={formatMessage({ id: "CONFIRMATION.CONTENT.DELETE_NOTICE" })}
                    handleClose={() => setSelectedNoticeId(null)}
                    handleConfirmation={handleNoticeDelete}
                />
            }
        </>
    );
}