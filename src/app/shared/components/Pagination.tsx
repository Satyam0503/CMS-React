import { Stack, TablePagination } from "@mui/material";

type PropsTypes = {
  page: number;
  rowsPerPage: number;
  setRowPerPage: (rowPerPage: number) => void;
  setPage: (pageValue: number) => void;
  totalRecords: number;
};

export const Pagination = (props: PropsTypes) => {
  const { page, rowsPerPage, setPage, setRowPerPage, totalRecords } = props;

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowPerPage(Number(event.target.value));
  };

  return (
    <Stack direction={"column"} spacing={2}>
      <TablePagination
        count={totalRecords}
        component="div"
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Stack>
  );
};
