import { Card, Skeleton, Stack } from "@mui/material";

const EmpCardSkeleton = () => {
  return (
    <Card
      sx={{
        height: "270px",
        padding: 2,
      }}
      className="shadow-sm"
    >
      <Stack spacing={2} className="justify-content-between align-items-center h-100">
        <Skeleton variant="circular" height={100} width={100} />

        <Stack className="justify-content-center align-items-center">
          <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} width={180} />
          <Skeleton variant="text" sx={{ fontSize: "1rem" }} width={150} />
        </Stack>
      </Stack>
    </Card>
  );
};

export { EmpCardSkeleton };
