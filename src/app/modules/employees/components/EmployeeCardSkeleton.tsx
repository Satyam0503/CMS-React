import { Card, Skeleton, Stack } from "@mui/material";

const EmpCardSkeleton = () => {
  return (
    <Card
      sx={{
        height: "310px",
        padding: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: 'background.body'
      }}

    >
      <Stack spacing={2} className="justify-content-between align-items-center h-100">
        <Skeleton variant="rounded" height={210} width="100%" sx={{ borderRadius: 2 }} />

        <Stack className="justify-content-center align-items-center">
          <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} width={180} />
          <Skeleton variant="text" sx={{ fontSize: "1rem" }} width={150} />
        </Stack>
      </Stack>
    </Card>
  );
};

export { EmpCardSkeleton };
