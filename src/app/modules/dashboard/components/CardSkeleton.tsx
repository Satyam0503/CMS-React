import { Card, Skeleton, Stack } from "@mui/material";

const CardSkeleton = () => {
  return (
    <Card
      sx={{
        height: "310px",
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
        <Stack spacing={1}>
          {
            Array.from({ length: 4 }).map((_, index) => (
              <Stack key={index} className="flex-row gap-2 align-items-start">
                <Skeleton variant="rounded" height={40} width={40} />
                <Stack className="flex-grow-1">
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: ".6rem" }} />
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
