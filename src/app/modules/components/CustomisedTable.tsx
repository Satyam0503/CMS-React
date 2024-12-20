import { Avatar, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { SubTitle } from "chart.js";

interface ColumnTypes {
  id: string;
  // align?: "center" | "left" | "right" | "inherit" | "justify";
  align?:any;
  label: string;
  minWidth: number;
  build?:any,
  format?:(value:any)=>any
}

interface PropsTypes<Row, Columns> {
  tabName: string;
  loading: boolean;
  rows: Row[];
  columns: Columns[];
  totalRecords:number
  page: number;
  rowsPerPage: number;
  handleEdit?:(row:Row)=>void;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const CustomisedTable = <Row extends { id: string }, Column extends ColumnTypes>(props: PropsTypes<Row, Column>) => {
  const { rows, columns, page, rowsPerPage, setRowPerPage, setPage,handleEdit, loading ,totalRecords } = props;

  function handlePageChange(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowPerPage(+event.target.value);
    setPage(0);
  }
  return (
    <Grid container >
      <TableContainer sx={{ minHeight: 600 }}>
        <Table stickyHeader aria-label="table">
          <TableHead>
            <TableRow>
              {
                columns.map(column => (
                  <TableCell key={column.id} align={column?.align} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          {
            loading
              ? <TableBody>
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <Typography variant="h6"> Loading... </Typography>
                  </TableCell>
                </TableRow>
              </TableBody> 
              :<TableBody>
                {
                  rows?.length === 0 ?
                    <TableRow>
                      <TableCell colSpan={12} align="center">
                        No Data Available
                      </TableCell>
                    </TableRow> :
                    <>
                      {
                        rows.map((row: any, index: number) => (
                          <TableRow hover key={row.id}>
                            {
                              columns.map(column => {
                                const value = (column.id === 'serialNo')
                                  ? ((page * rowsPerPage) + (index+1))
                                  : (column.id === "name")
                                    ? (row.firstName + " " + row.lastName)
                                    : row[column.id];
                                return (
                                  <TableCell key={column.id} align={column?.align} sx={{ minWidth: column.minWidth }}>
                                    {
                                      (column.id === "name" || column.id === "jobTitle") 
                                        ? <AvatarCell title={value} subTitle={row.jobRole} />
                                        : column.build 
                                        ? ( column.id === "action") 
                                        ? column.build(row,handleEdit)
                                        : column.build(value)
                                        : value
                                    }
                                  </TableCell>
                                )
                              })
                            }
                          </TableRow>
                        ))
                      }
                    </>
                }
              </TableBody>
          }
        </Table>
      </TableContainer>
      <Grid item xs={12}>
        <TablePagination
          count={totalRecords && totalRecords}
          component="div"
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </Grid>
  )
}

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: string;
  avatarSrc?: any
}

export const AvatarCell = ({ title, avatarSrc, subTitle }: AvatarCellPropsTypes) => {
  return (
    <Stack direction="row" spacing={1}>
      <Avatar src={avatarSrc || ""}>{title?.at(0)?.toLocaleUpperCase()}</Avatar>
      <Stack direction="column">
        <Typography variant="body1" className="fw-semibold d-block">{title || "NA"}</Typography>
        <Typography variant="body2" className="text-muted">{subTitle || "NA"}</Typography>
      </Stack>
    </Stack>
  )
}