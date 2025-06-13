import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { NoticeModel } from "../models";
import { usePageData } from "../../../../_themes/layout/core/PageData";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { Card, Stack } from "@mui/material";
import { SearchInput } from "../../../shared/components/SearchInput";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { AddNotice } from "./AddNotice";
import { MyNoticeTableColumnList } from "../../../../utils/constant/Constant";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add, KeyboardArrowLeft } from "@mui/icons-material";
import { getMyNotices } from "../services";

export const MyNotices = () => {
    const { formatMessage } = useIntl();
    const [searchValue, setSearchValue] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [NoticeList, setNoticeList] = useState<NoticeModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 })
    const { setPageTitle } = usePageData();
    const userModulesPermissions = useAppSelector(state => state.user.userData?.modulePermission) || [];
    const navigate = useNavigate();
    const hasAddPermission = hasModuleFeaturePermission(ModulesName.NoticeBoard, Permission.Create, userModulesPermissions);

    const handleClose = () => {
        setModalOpen(false);
    }
    const handleRefresh = () => {
        setRefresh(!refresh);
    }
    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    useEffect(() => {
        setPageTitle(formatMessage({ id: "PAGE.MY_NOTICE" }));
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data, } = await getMyNotices();
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
    return (
        <>
            <Card sx={{ p: "2rem", gap: 2 }} className="d-flex flex-column flex-grow-1">
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap"
                    }}
                >
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
                <Stack sx={{ mt: "1rem" }}>
                    <CustomisedTable
                        tabName="Notice Board"
                        rows={NoticeList}
                        columns={MyNoticeTableColumnList}
                        page={paginationValues.pageNo}
                        rowsPerPage={paginationValues.records}
                        loading={loading}
                    // handleEdit={handleNoticeEdit}
                    />
                </Stack>
            </Card>
            {
                isModalOpen &&
                <AddNotice refresh={handleRefresh} open={isModalOpen} handleClose={handleClose} isEdit={false} />
            }
        </>
    );
}