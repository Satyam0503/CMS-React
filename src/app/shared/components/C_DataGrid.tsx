import { Stack } from "@mui/system";
import type { SxProps, Theme } from "@mui/material/styles";

import {
  DataGrid,
  gridClasses,
  GridColDef,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridValidRowModel,
} from "@mui/x-data-grid";

interface Props<R extends GridValidRowModel> {
  row: R[];
  columns: GridColDef<R>[];
  keyName: keyof R;
  loading: boolean;
  showToolbar?: boolean;
  hidePagination?: boolean;
  rowClickHandler?: (param: GridRowParams<R>) => void;
  rowClassName?: (param: GridRowParams<R>) => string;
  paginationModel?: GridPaginationModel;
  rowCount?: number;
  handlePaginationModelChange?: (model: GridPaginationModel) => void;
  checkboxSelection?: boolean;
  onRowSelectionModelChange?: (ids: GridRowSelectionModel) => void;
  autoHeight?: boolean;
  sx?: SxProps<Theme>;
}

export const CustomDataGrid = <R extends GridValidRowModel>(
  props: Props<R>
) => {
  const getRowKey = (row: R) => {
    return row[props.keyName];
  };
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <DataGrid
        autoHeight={props.autoHeight ?? false}
        disableColumnSelector={false}
        loading={props.loading}
        showToolbar={props.showToolbar ?? false}
        className="data-grid-parent-container"
        rows={props.row}
        columns={props.columns}
        density="comfortable"
        disableRowSelectionOnClick
        slotProps={{
          baseIconButton: {
            style: {
              border: 0,
            },
          },
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
        }}
        getRowClassName={(params) => [
          props.rowClickHandler ? "pointer-cursor" : "",
          props.rowClassName?.(params) ?? "",
        ].filter(Boolean).join(" ")}
        onRowClick={props.rowClickHandler}
        paginationMode="server"
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={props.paginationModel}
        onPaginationModelChange={props.handlePaginationModelChange}
        rowCount={props.rowCount}
        getRowId={getRowKey}
        hideFooterPagination={props.hidePagination ?? false}
        checkboxSelection={props.checkboxSelection}
        onRowSelectionModelChange={props.onRowSelectionModelChange}
        sx={{
          borderInline: 0,
          backgroundColor: "transparent",
          width: "100%",
          minWidth: 0,
          ...props.sx,
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
            {
              outline: "none",
            },
          [`& .${gridClasses.cell}:focus-visible, & .${gridClasses.columnHeader}:focus-visible`]:
            {
              outline: "2px solid var(--mui-palette-primary-main)",
              outlineOffset: "-2px",
            },
          [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
            {
              outline: "none",
            },
        }}
      />
    </Stack>
  );
};
