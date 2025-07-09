import * as React from "react";
import { Badge, Button, Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  FilterList,
  ListAltOutlined,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { useLocation, useNavigate } from "react-router-dom";
import { usePageData } from "../../../_themes/layout/core";
import { useEffect, useState } from "react";
import { AddNotice } from "./components/AddNotice";
import { useAppSelector } from "../../Redux/hooks";
import { countAppliedFilter, hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { GetAllNoticePayload, NoticeResponseModel } from "./models";
import { getAllNotices } from "./services";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";
import { Pagination } from "../../shared/components/Pagination";
import { initialNoticeValuesObj } from "./components/MyNotices";
import { initialNoticeFilter, NoticeBoardFilter } from "./components/NoticeBoardFilter";
import { NoticeViewModel } from "./components/NoticeViewModel";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const noticeBoardFilter = useAppSelector(state => state.filters.noticeBoard);
  const noticeIdFromRedirect = useLocation().state as string | null;
  const [selectedNotice, setSelectedNotice] = useState<string | null>(noticeIdFromRedirect);

  const hasAddPermission = hasModuleFeaturePermission(ModulesName.NoticeBoard, Permission.Create, userModulesPermissions);

  const handleClose = () => {
    setModalOpen(false);
  }
  const handleRefresh = () => {
    setRefresh(!refresh);
  }

  const handleNoticeView = (notice: NoticeResponseModel) => {
    setSelectedNotice(notice.noticeId);
  }

  const handleFilterOpen = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
  }

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearchValue(value.trim());
  };

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
  const handleNoticeViewClose = () => {
    setSelectedNotice(null);
    window.history.replaceState(null, document.title, window.location.href);
  }

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.NOTICE_BOARD" }));
  }, []);

  useEffect(() => {
    (async () => {
      const payload: GetAllNoticePayload = {
        pageNo: paginationValues.pageNo + 1,
        records: paginationValues.records,
        postedBy: searchValue,
        ...(noticeBoardFilter ?? initialNoticeFilter)
      }
      try {
        const { data } = await getAllNotices(payload);
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
  }, [refresh, paginationValues, searchValue, noticeBoardFilter])

  useEffect(() => {
    if (noticeIdFromRedirect) {
      setSelectedNotice(noticeIdFromRedirect);
      window.history.replaceState(null, document.title, window.location.href);
    }
  }, [noticeIdFromRedirect])

  return (
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
        <Stack className="flex-row justify-content-between gap-4 flex-wrap" >
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
          <Stack direction={"row"} flexWrap={"wrap"} gap={1}>
            {
              hasAddPermission &&
              <Button sx={{ height: 32 }} variant="outlined" endIcon={<ListAltOutlined className="icon-fs-20" />} onClick={() => navigate("/noticeboard/notices/mynotices")}>
                {formatMessage({ id: "MY_NOTICE" })}
              </Button>
            }
            <Badge badgeContent={countAppliedFilter(noticeBoardFilter)} color="primary">
              <CustomIconButton icon={<FilterList />} handleClick={handleFilterOpen} />
            </Badge>
            {
              hasAddPermission &&
              <CustomIconButton
                tooltip={formatMessage({ id: "POST_NOTICE" })}
                icon={<Add />}
                handleClick={() => setModalOpen(true)}
              />
            }
          </Stack>
        </Stack>
        <CustomisedTable
          keyName="noticeId"
          tabName={ModulesName.NoticeBoard}
          rows={NoticeList}
          columns={NoticeBoardTableColumnList}
          page={paginationValues.pageNo}
          rowsPerPage={paginationValues.records}
          openViewModal={handleNoticeView}
          loading={loading}
        />
        {
          totalRecords > 0 &&
          <Pagination
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            setPage={handlePageChange}
            setRowPerPage={handleRowPerPageChange}
            totalRecords={totalRecords}
          />
        }
      </Card >
      {
        isModalOpen &&
        <AddNotice initialValues={initialNoticeValuesObj} refresh={handleRefresh} open={true} handleClose={handleClose} isEdit={false} />
      }
      {
        Boolean(anchorEl) && <NoticeBoardFilter
          id="notice-board-filter"
          open={true}
          anchorEl={anchorEl}
          handleClose={() => setAnchorEl(null)}
        />
      }
      {
        selectedNotice && <NoticeViewModel open={true} noticeId={selectedNotice} handleClose={handleNoticeViewClose} />
      }
    </>
  );
}
