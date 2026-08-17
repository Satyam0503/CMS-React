import * as React from "react";
import {
  Badge,
  Box,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  FilterList,
  ListAltOutlined,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/C_IconButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AddNotice } from "./components/AddNotice";
import { useAppSelector } from "../../Redux/hooks";
import { countAppliedFilter, hasModuleFeaturePermission, initialNoticeFilter } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { GetAllNoticePayload, NoticeResponseModel } from "./models";
import { getAllNotices } from "./services";
import { CustomisedTable } from "../../shared/components/C_Table";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";
import { Pagination } from "../../shared/components/Pagination";
import { initialNoticeValuesObj } from "./components/MyNotices";
import { NoticeBoardFilter } from "./components/NoticeBoardFilter";
import { NoticeViewModel } from "./components/NoticeViewModel";
import { usePageData } from "../../Context/PageDataProvider";

import { AppButton } from "../../shared/components/ui";
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

  const handleRowClick = (notice: NoticeResponseModel) => {
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

  const updateNoticeViewedStatus = (noticeId: string) => {
    setNoticeList(NoticeList.map(notice => {
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
          setNoticeList(Array.isArray(data.methodResults) ? data.methodResults : []);
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
      <Card
        className="d-flex flex-column gap-4 p-4 p-md-6"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          boxShadow: "0 12px 32px rgba(36, 24, 62, 0.08)",
          overflow: "hidden",
          "& .MuiTableContainer-root": {
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2.5,
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            bgcolor: "action.hover",
            color: "text.secondary",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.03em",
            py: 1.5,
            textTransform: "uppercase",
          },
          "& .MuiTableBody-root .MuiTableRow-root": {
            transition: "background-color 160ms ease, transform 160ms ease",
          },
          "& .MuiTableBody-root .MuiTableRow-root:hover": {
            bgcolor: "action.hover",
          },
          "& .MuiTableBody-root .MuiTableCell-root": { py: 1.75 },
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: "flex-end",
            minHeight: 48,
            px: { xs: 0, sm: 1 },
          },
          "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
          "& .MuiTablePagination-selectLabel": { ml: { xs: 0, sm: 1 } },
        }}
      >
        <Box
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              flex: "0 1 auto",
              maxWidth: { sm: 420 },
              minWidth: 0,
              "& .MuiFormControl-root": { width: "100%" },
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: 2,
              },
            }}
          >
            <SearchInput search={searchValue} setSearch={handleSearchChange} />
          </Box>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{
              flexShrink: 0,
              justifyContent: "flex-end",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {
              hasAddPermission &&
              <AppButton
                startIcon={<ListAltOutlined className="fs-20" />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  height: 36,
                  px: 1.5,
                  whiteSpace: "nowrap",
                }}
                variant="outlined"
                onClick={() => navigate("/noticeboard/notices/mynotices")}
              >
                {formatMessage({ id: "NOTICE.TITLES.MY_NOTICE" })}
              </AppButton>
            }
            <Badge badgeContent={countAppliedFilter(noticeBoardFilter)} color="primary">
              <CustomIconButton
                ariaLabel="Filter notices"
                icon={<FilterList />}
                handleClick={handleFilterOpen}
                tooltip="Filter notices"
                toolbar
              />
            </Badge>
            {
              hasAddPermission &&
              <CustomIconButton
                ariaLabel={formatMessage({ id: "TOOLTIP.POST_NOTICE" })}
                tooltip={formatMessage({ id: "TOOLTIP.POST_NOTICE" })}
                icon={<Add />}
                handleClick={() => setModalOpen(true)}
                toolbar
              />
            }
          </Stack>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <CustomisedTable
            keyName="noticeId"
            tabName={ModulesName.NoticeBoard}
            rows={NoticeList}
            columns={NoticeBoardTableColumnList}
            rowClickHandler={handleRowClick}
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            loading={loading}
          />
        </Box>
        <Stack
          spacing={1.25}
          sx={{ display: { xs: "flex", sm: "none" } }}
        >
          {loading ? (
            <Box sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
              Loading notices…
            </Box>
          ) : NoticeList.length === 0 ? (
            <Box sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
              {formatMessage({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
            </Box>
          ) : (
            NoticeList.map((notice, index) => {
              const noticeType = notice.noticeType === 1 ? "General" : notice.noticeType === 2 ? "Important" : "Urgent";
              const tone = notice.noticeType === 1 ? "success" : notice.noticeType === 2 ? "warning" : "error";
              const designation = typeof notice.userDesignation === "string"
                ? notice.userDesignation
                : notice.userDesignation && typeof notice.userDesignation === "object"
                  ? Object.values(notice.userDesignation).filter(Boolean).join(" · ")
                  : "Notice";
              return (
                <Card
                  key={notice.noticeId}
                  onClick={() => handleRowClick(notice)}
                  sx={{
                    border: "1px solid",
                    borderColor: notice.viewedStatus ? "divider" : "primary.light",
                    borderRadius: 2.5,
                    boxShadow: "none",
                    cursor: "pointer",
                    px: 1.75,
                    py: 1.5,
                    "&:active": { bgcolor: "action.selected" },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                    <Stack direction="row" minWidth={0} spacing={1.25}>
                      <Box
                        sx={{
                          alignItems: "center",
                          bgcolor: "primary.50",
                          borderRadius: 1.5,
                          color: "primary.main",
                          display: "flex",
                          flex: "0 0 auto",
                          fontSize: 12,
                          fontWeight: 800,
                          height: 30,
                          justifyContent: "center",
                          width: 30,
                        }}
                      >
                        {paginationValues.pageNo * paginationValues.records + index + 1}
                      </Box>
                      <Box minWidth={0}>
                        <Typography noWrap fontSize={14} fontWeight={800}>{notice.userName}</Typography>
                        <Typography color="text.secondary" fontSize={12} noWrap>{designation}</Typography>
                      </Box>
                    </Stack>
                    <Chip color={tone} label={noticeType} size="small" sx={{ flexShrink: 0, fontWeight: 700 }} />
                  </Stack>
                  <Typography
                    color={notice.viewedStatus ? "text.secondary" : "text.primary"}
                    sx={{ display: "-webkit-box", fontSize: 14, fontWeight: notice.viewedStatus ? 400 : 600, mt: 1.25, overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}
                  >
                    {notice.noticeTitle}
                  </Typography>
                  <Typography color="text.secondary" fontSize={12} sx={{ mt: 1 }}>
                    {new Date(notice.createdDateTime).toLocaleString()}
                  </Typography>
                </Card>
              );
            })
          )}
        </Stack>
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
        selectedNotice && <NoticeViewModel open={true} noticeId={selectedNotice} handleClose={handleNoticeViewClose} updateNoticeViewedStatus={NoticeList.find(notice => notice.noticeId === selectedNotice)?.viewedStatus ? undefined : updateNoticeViewedStatus} />
      }
    </>
  );
}
