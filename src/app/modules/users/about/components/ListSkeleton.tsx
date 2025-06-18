import { Card, Skeleton, Stack } from "@mui/material"

export const ListSkeleton = () => {
    return (
        <Card
            sx={{
                height: "300px",
                padding: 2,
            }}
        >
            <Stack spacing={3}>
                <Stack className="flex-row gap-4 align-items-start" >
                    <Skeleton variant="text" sx={{ fontSize: "1.2rem", flexGrow: 1 }} />
                    <Skeleton variant="rounded" height={32} width={32} />
                </Stack>
                <Stack spacing={1}>
                    {
                        Array.from({ length: 4 }).map((_, index) => (
                            <Stack className="flex-row gap-4" >
                                <Stack className="flex-row flex-grow-1 gap-2">
                                    <Skeleton variant="rounded" height={48} width={48} />
                                    <Stack className="flex-grow-1">
                                        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                                        <Stack className="flex-row gap-2">
                                            <Skeleton variant="text" width={80} />
                                            <Skeleton variant="text" width={100} />
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Skeleton variant="rounded" height={32} width={32} />
                            </Stack>
                        ))
                    }
                </Stack>
            </Stack>
        </Card >
    )
}