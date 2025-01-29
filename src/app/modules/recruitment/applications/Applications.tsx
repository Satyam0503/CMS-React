import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {  Add, Download, FilterList } from "@mui/icons-material";
import { CustomisedTable } from "../../components/CustomisedTable";
import { ApplicationTabTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AddApplicant } from "./AddApplicant";
import { CustomIconButton } from "../../components/CustomIconButton";
import { useEffect, useState } from "react";
import { getAllApplicantList } from "../services";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { Applicant, ApplicantModel, JobModal } from "../../../../utils/common_types";
import { ApplicationPreview } from "./ApplicationPreview";

export default function Applications() {
  const intl = useIntl();
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [applicationsList, setApplicationsList] = useState<Applicant[]>([]);
  const [viewApplicant, setViewApplicant] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | undefined>();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isAddModalOpen,setAddModalOpen]= useState(false);
  const [loading, setLoading] = useState(false);
  const token = useAppSelector((state) => state.auth.token)!;

  const navigate = useNavigate();

  const handleApplicantEdit = (applicant: Applicant) => {
     navigate("/recruitment/editapplicant",{state: {applicantId:applicant.applicantId}});  
  };
  
  const openConfirmationModal = (applicant:Applicant) => {
    setConfirmModalOpen(true);
    setSelectedApplicant(applicant);
  };

  const handleOpenPreview = (applicant:Applicant) => {
    setViewApplicant(true);
    setSelectedApplicant(applicant);
  };

  const closePreview = () => {
    setViewApplicant(false);
    setSelectedApplicant(undefined);
  };

  const handleResumeDownload = () => {
    // console.log("download resume");
  };

  const handleApplicantDeletion = () => {
    // console.log("delete Applicant");
  };

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await getAllApplicantList(token);
        if (!data.success) {
          throw new Error(data.message);
        }
        setApplicationsList(data.methodResults);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

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
            <SearchInput search={search} setSearch={setSearch} />

            <Stack direction="row" spacing={1}>
              <CustomIconButton
                icon={<FilterList />}
                tooltip="Filter Application"
                ariaLabel="Filter Application"
              />
              <CustomIconButton
                icon={<Add/>}
                handleClick={()=>setAddModalOpen(true)}
              />

              <CustomIconButton
                icon={<Download />}
                tooltip="Import Excel"
                ariaLabel="import excel"
              />
            </Stack>
          </Stack>

          <CustomisedTable
            rows={applicationsList}
            columns={ApplicationTabTableColumnList}
            page={page}
            rowsPerPage={rowPerPage}
            handleEdit={handleApplicantEdit}
            openConfirmationModal={openConfirmationModal}
            openViewModal={handleOpenPreview}
            handleDownload={handleResumeDownload}
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
      {
        isAddModalOpen && (
          <AddApplicant
            open={isAddModalOpen}
            setOpen={setAddModalOpen}
          />
        )
      }

      {viewApplicant && selectedApplicant && (
        <ApplicationPreview 
          open={viewApplicant}
          handleClose={closePreview}
          applicantData={selectedApplicant}
        />
      )}
      <ConfirmationModal
        title={"Delete Applicant"}
        content="Are you sure you want to delete this applicant?"
        open={isConfirmModalOpen}
        handleClose={() => setConfirmModalOpen(false)}
        handleConfirmation={handleApplicantDeletion}
      />
    </>
  );
}
