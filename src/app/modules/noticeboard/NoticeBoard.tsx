import * as React from "react";
import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  FilterList,
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
import { NoticeModel } from "./models";
import { getAllNotices } from "./services";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";

export default function NoticeBoard() {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [NoticeList, setNoticeList] = React.useState<NoticeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationValues, setPaginationValues] = useState({ pageNo: 1, records: 10 })
  const { setPageTitle } = usePageData();
  const userModulesPermissions = useAppSelector(state => state.user.userData?.modulePermission) || [];
  const navigate = useNavigate();
  const hasAddPermission = hasModuleFeaturePermission(ModulesName.NoticeBoard, Permission.Create, userModulesPermissions);

  const handleClose = () => {
    setModalOpen(false);
  }
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.NOTICE_BOARD" }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data, } = await getAllNotices();
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
            <CustomisedButton
              variant="outlined"
              Icon={<ListAltOutlined />}
              label={formatMessage({ id: "NOTICE.MY_NOTICE" })}
              handleClick={() => {
                navigate("/noticeboard/usernoticeboard");
              }}
            />
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
        <Stack sx={{ mt: "1rem" }}>
          <CustomisedTable
            tabName="Notice Board"
            rows={NoticeList}
            columns={NoticeBoardTableColumnList}
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            loading={loading}
          // handleEdit={handleNoticeEdit}
          />
        </Stack>
      </Card>
      {
        isModalOpen &&
        < AddNotice open={isModalOpen} handleClose={handleClose} isEdit={false} />
      }
    </>
  );
}
