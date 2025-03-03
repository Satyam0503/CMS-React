import { Card, Popover, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";
import { CustomisedTable } from "../../components/CustomisedTable";
import { ApplicationTabTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import { AddApplicant } from "./AddApplicant";
import { CustomIconButton } from "../../components/CustomIconButton";
import { useCallback, useEffect, useState } from "react";
import { getAllApplicantList } from "../services";
import { useNavigate } from "react-router-dom";
import { Applicant } from "../../../../utils/common_types";
import { ApplicationPreview } from "./ApplicationPreview";
import { ApplicationFilter } from "./ApplicationFilter";

export default function Applications() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [applicationsList, setApplicationsList] = useState<Applicant[]>([]);
  const [viewApplicant, setViewApplicant] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    Applicant | undefined
  >();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const open = Boolean(anchorEl);
  const id = open ? "application-filter" : undefined;

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };


  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleApplicantEdit = (applicant: Applicant) => {
    if (applicant) {
      navigate(`/recruitment/applicant/${applicant.applicantId}`);
    }
  };

  const handleOpenPreview = (applicant: Applicant) => {
    setViewApplicant(true);
    setSelectedApplicant(applicant);
  };

  const closePreview = () => {
    setViewApplicant(false);
    setSelectedApplicant(undefined);
  };

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await getAllApplicantList();
        if (!data.success) {
          throw new Error(data.message);
        }
        setApplicationsList(data.methodResults.reverse());
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [refresh]);

  return (
    <>
      <Card sx={{ p: 2.6 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap-reverse"}
            gap={2}
          >
            <SearchInput search={search} setSearch={handleSearchChange} />

            <Stack direction="row" spacing={1}>
              <CustomIconButton
                icon={<FilterList />}
                tooltip="Filter Application"
                ariaLabel="Filter Application"
                handleClick={handleFilterClick}
              />
              <CustomIconButton
                icon={<Add />}
                handleClick={() => setAddModalOpen(true)}
              />

              <CustomIconButton
                icon={<Download />}
                tooltip="Import Excel"
                ariaLabel="import excel"
              />
            </Stack>
            <ApplicationFilter open={open} id={id} anchorEl={anchorEl} handleClose={()=> setAnchorEl(null)}/>
          </Stack>

          <CustomisedTable
            rows={applicationsList}
            columns={ApplicationTabTableColumnList}
            page={page}
            rowsPerPage={rowPerPage}
            handleEdit={handleApplicantEdit}
            openViewModal={handleOpenPreview}
            loading={loading}
          />

          {totalRecords > rowPerPage && (
            <Pagination
              page={page}
              setPage={setPage}
              rowsPerPage={rowPerPage}
              setRowPerPage={setRowPerPage}
              totalRecords={totalRecords}
            />
          )}
        </Stack>
      </Card>

      {isAddModalOpen && (
        <AddApplicant
          open={isAddModalOpen}
          setOpen={setAddModalOpen}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )}

      {viewApplicant && selectedApplicant && (
        <ApplicationPreview
          open={viewApplicant}
          handleClose={closePreview}
          applicantData={selectedApplicant}
        />
      )}
    </>
  );
}
