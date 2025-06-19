import * as React from "react";
import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  ListAltOutlined,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { useNavigate } from "react-router-dom";
import CustomisedButton from "../../shared/components/CustomisedButton";
import { usePageData } from "../../../_themes/layout/core";
import { useCallback, useEffect, useState } from "react";
import { AddNotice } from "./components/AddNotice";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { NoticeModel, NoticeResponseModel } from "./models";
import { getAllNotices } from "./services";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";
import { Pagination } from "../../shared/components/Pagination";
import { initialNoticeValuesObj } from "./components/MyNotices";

export const NoticeBoard = () => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [NoticeList, setNoticeList] = React.useState<NoticeResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 })
  const [totalRecords, setTotalRecords] = useState(0);
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

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.NOTICE_BOARD" }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllNotices(paginationValues.pageNo + 1, paginationValues.records);
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
  }, [refresh, paginationValues])
  return (
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
        <Stack className="flex-row justify-content-between gap-4 flex-wrap" >
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
          <Stack direction={"row"} flexWrap={"wrap"} gap={1}>
            {
              hasAddPermission &&
              <CustomisedButton
                variant="outlined"
                Icon={<ListAltOutlined className="icon-fs-20" />}
                label={formatMessage({ id: "NOTICE.MY_NOTICE" })}
                handleClick={() => {
                  navigate("/noticeboard/notices/mynotices");
                }}
              />
            }
            {/* <CustomIconButton tooltip="Filter List" icon={<FilterList />} /> */}
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
          columns={NoticeBoardTableColumnList}
          page={paginationValues.pageNo}
          rowsPerPage={paginationValues.records}
          loading={loading}
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
        <AddNotice initialValues={initialNoticeValuesObj} refresh={handleRefresh} open={isModalOpen} handleClose={handleClose} isEdit={false} />
      }
    </>
  );
}
