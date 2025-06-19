import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { NoticeModel } from "../models";
import { usePageData } from "../../../../_themes/layout/core/PageData";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, NOTICE_TYPE, Permission } from "../../../../utils/enums";
import { Card, Stack } from "@mui/material";
import { SearchInput } from "../../../shared/components/SearchInput";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { AddNotice } from "./AddNotice";
import { MyNoticeTableColumnList } from "../../../../utils/constant/Constant";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add, KeyboardArrowLeft } from "@mui/icons-material";
import { getMyPostedNotices } from "../services";
import { Pagination } from "../../../shared/components/Pagination";

export const initialNoticeValuesObj: NoticeModel = {
    message: "",
    title: "",
    target: "all",
    noticeType: NOTICE_TYPE.GENERAL,
    departments: "all",
}

export const MyNotices = () => {
    const { formatMessage } = useIntl();
    const [searchValue, setSearchValue] = useState("");
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
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.NoticeBoard, Permission.Create, userModulesPermissions);

    const handleClose = () => {
        setModalOpen(false);
        setInitialNoticeValue(initialNoticeValuesObj);
        setEdit(false);
    }

    const handleRefresh = () => {
        setRefresh(!refresh);
    }
    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

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

    const handleNoticeEdit = (notice: NoticeModel) => {
        setInitialNoticeValue(notice);
        setModalOpen(true);
        setEdit(true);
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
                <Stack className="flex-row justify-content-between gap-4 flex-wrap" >
                    <SearchInput search={searchValue} setSearch={handleSearchChange} />
                    <Stack direction={"row"} flexWrap={"wrap"} gap={1}>

                        <CustomIconButton tooltip={formatMessage({ id: "BUTTON.GO_BACK" })} icon={<KeyboardArrowLeft />} handleClick={() => navigate("/noticeboard")} />
                        {
                            hasAddPermission &&
                            <CustomIconButton
                                tooltip={formatMessage({ id: "NOTICE.POST_NOTICE" })}
                                icon={<Add />}
                                handleClick={() => setModalOpen(true)}
                            />
                        }
                    </Stack>
                </Stack>

                <CustomisedTable
                    keyName="noticeId"
                    tabName="Notice Board"
                    rows={NoticeList}
                    columns={MyNoticeTableColumnList}
                    page={paginationValues.pageNo}
                    rowsPerPage={paginationValues.records}
                    loading={loading}
                    handleEdit={handleNoticeEdit}
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
                <AddNotice initialValues={initialNoticeValues} refresh={handleRefresh} open={isModalOpen} handleClose={handleClose} isEdit={isEdit} />
            }
        </>
    );
}