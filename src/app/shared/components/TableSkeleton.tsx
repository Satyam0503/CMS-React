import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";

export default function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            padding: 1,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            alignItems: "center",
            mb: 1,
          }}
        >
          <Skeleton
            variant="circular"
            width={45}
            height={45}
          />
          <Stack sx={{ flex: "auto" }}>
            <Skeleton
              animation="wave"
              height={10}
              sx={{
                width: "100%",
                mb: 1,
              }}
            />
            <Skeleton
              animation="wave"
              height={10}
              width="100%"
              sx={{
                width: "100%",
                mb: 1,
              }}
            />
            <Skeleton
              animation="wave"
              height={10}
              width="100%"
              sx={{
                width: "100%",
                borderRadius: 1,
              }}
            />
          </Stack>

          <Stack spacing={1} direction={"row"}>
            <Skeleton
              sx={{ borderRadius: 1 }}
              variant="rounded"
              width={35}
              height={35}
            />

            <Skeleton
              sx={{ borderRadius: 1 }}
              variant="rounded"
              width={35}
              height={35}
            />

            <Skeleton
              sx={{ borderRadius: 1 }}
              variant="rounded"
              width={35}
              height={35}
            />
          </Stack>
        </Box>
      ))}
    </>
  );
}
