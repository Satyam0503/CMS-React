import { Grid, Skeleton } from "@mui/material"

export const PolicySkeleton = () => {
    return (
        <Grid container spacing={2}>
            {
                Array.from({ length: 4 }).map((_, index) => (
                    <Grid
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        key={index}
                    >
                        <Skeleton variant="rounded" animation="wave" sx={{ width: "100%", height: 150 }} />
                    </Grid>
                ))
            }
        </Grid>
    )
}