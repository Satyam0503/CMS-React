import { Stack } from "@mui/system"
import { DataGrid, GridColDef, GridPaginationModel, GridRowParams, GridValidRowModel } from '@mui/x-data-grid';


interface Props<R extends GridValidRowModel> {
    row: R[],
    columns: GridColDef<R>[],
    keyName: keyof R,
    loading: boolean,
    showToolbar?: boolean,
    hidePagination?: boolean,
    rowClickHandler?: (param: GridRowParams<R>) => void,
    paginationModel?: GridPaginationModel
    rowCount?: number,
    handlePaginationModelChange?: (model: GridPaginationModel) => void;
}


export const CustomDataGrid = <R extends GridValidRowModel,>(props: Props<R>) => {
    const getRowKey = (row: R) => {
        return row[props.keyName]
    }
    return (
        <Stack direction="row">
            <DataGrid
                autoHeight
                disableColumnSelector={false}
                loading={props.loading}
                showToolbar={props.showToolbar ?? false}
                className="data-grid-parent-container"
                disableVirtualization
                rows={props.row}
                columns={props.columns}
                density="comfortable"
                disableRowSelectionOnClick
                slotProps={{
                    baseIconButton: {
                        style: {
                            border: 0,
                        }
                    },
                    loadingOverlay: {
                        variant: 'skeleton',
                        noRowsVariant: 'skeleton',
                    },
                }}
                getRowClassName={() => props.rowClickHandler ? "pointer-cursor" : ""}
                onRowClick={props.rowClickHandler}
                paginationMode="server"
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={props.paginationModel}
                onPaginationModelChange={props.handlePaginationModelChange}
                rowCount={props.rowCount}
                getRowId={getRowKey}
                hideFooterPagination={props.hidePagination ?? false}
                sx={{
                    borderInline: 0,
                    backgroundColor: "transparent"
                }}

            />
        </Stack>
    )
}

