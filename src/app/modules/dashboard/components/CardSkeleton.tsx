import { Card, Skeleton, Stack } from "@mui/material";

const CardSkeleton = () => {
  return (
    <Card
      className="dashboard-card-skeleton"
      aria-busy="true"
      aria-label="Loading dashboard data"
      sx={{
        height: "310px",
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <Skeleton
          className="dashboard-skeleton-line"
          animation="wave"
          variant="text"
          sx={{ fontSize: "1.5rem", width: "48%" }}
        />
        <Stack spacing={1}>
          {
            Array.from({ length: 4 }).map((_, index) => (
              <Stack key={index} className="flex-row gap-2 align-items-start">
                <Skeleton
                  className="dashboard-skeleton-avatar"
                  animation="wave"
                  variant="rounded"
                  height={40}
                  width={40}
                />
                <Stack className="flex-grow-1">
                  <Skeleton
                    className="dashboard-skeleton-line"
                    animation="wave"
                    variant="text"
                    sx={{ fontSize: "1rem" }}
                  />
                  <Skeleton
                    className="dashboard-skeleton-line dashboard-skeleton-line-short"
                    animation="wave"
                    variant="text"
                    sx={{ fontSize: ".6rem" }}
                  />
                </Stack>
              </Stack>
            ))
          }
        </Stack>
      </Stack>
    </Card>
  );
};

export { CardSkeleton };
