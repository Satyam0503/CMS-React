import { Card, Skeleton, Stack } from "@mui/material"

export const CompanyInfoSkeleton = () => {
    return (
        <Stack spacing={2} sx={{
            marginBlock: 1
        }}>
            {
                Array.from({ length: 3 }).map((_, index) =>
                (
                    <Card sx={{ padding: 3 }} key={index}>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                                <Skeleton variant="rounded" width={500} height={25} />
                                <Skeleton variant="rounded" width={100} height={25} />
                            </Stack>
                            <Stack spacing={2}>
                                <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
                                <Stack direction={"row"} className="flex-wrap gap-4">
                                    <Stack className="flex-grow-1" spacing={1}>
                                        <Skeleton variant="rounded" height={15} width={250} />
                                        <Skeleton variant="rounded" height={10} width={120} />
                                    </Stack>
                                    <Stack className="flex-grow-1" spacing={1}>
                                        <Skeleton variant="rounded" height={15} width={250} />
                                        <Skeleton variant="rounded" height={10} width={120} />
                                    </Stack>
                                </Stack>
                            </Stack>
                            <Stack spacing={2}>
                                <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
                                <Stack direction={"row"} className="flex-wrap gap-4">
                                    <Stack className="flex-grow-1" spacing={1}>
                                        <Skeleton variant="rounded" height={15} width={250} />
                                        <Skeleton variant="rounded" height={10} width={120} />
                                    </Stack>
                                    <Stack className="flex-grow-1" spacing={1}>
                                        <Skeleton variant="rounded" height={15} width={250} />
                                        <Skeleton variant="rounded" height={10} width={120} />
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                )
                )
            }
        </Stack>
    );
}