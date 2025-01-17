import { Stack, TablePagination } from "@mui/material";

type PropsTypes = {
  page: number;
  rowsPerPage: number;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
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
    setRowPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <Stack direction={"column"} spacing={2}>
      <TablePagination
        count={totalRecords && totalRecords}
        component="div"
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Stack>
  );
};
