import { Card, Skeleton, Stack } from "@mui/material"

export const ListSkeleton = () => {
    return (
        <Card
            sx={{
                // height: "300px",
                padding: 2,
            }}
        >
            <Stack spacing={3}>
                <Skeleton variant="text" sx={{ fontSize: "1.2rem", flexGrow: 1 }} />
                <Stack spacing={1}>
                    {
                        Array.from({ length: 5 }).map((_, index) => (
                            <Stack key={index} className="flex-row gap-4" >
                                <Skeleton variant="rounded" height={48} width={48} />
                                <Stack className="flex-grow-1">
                                    <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                                    <Skeleton variant="text" width={200} />
                                </Stack>
                            </Stack>
                        ))
                    }
                </Stack>
            </Stack>
        </Card >
    )
}