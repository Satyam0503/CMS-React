import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { colors } from "../../modules/theme/MuiTheme";
import { Stack } from "@mui/material";

export default function TableSkeleton() {
  const array = [1, 2, 3, 4, 5, 6];
  return (
    <>
      {array.map((item) => (
        <Box
          key={item}
          sx={{
            border: "2px solid" + colors.alpha.neutral[100],
            borderRadius: 1,
            padding:1,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
            mb: 1,
          }}
        >
          <Skeleton
            sx={{ bgcolor: colors.alpha.neutral[100] }}
            variant="circular"
            width={45}
            height={45}
          />
          <Stack sx={{flex:"auto" }}>
            <Skeleton
              animation="wave"
              height={10}
              sx={{
                bgcolor: colors.alpha.neutral[100],
                width: "100%",
                mb: 1,
              }}
            />
            <Skeleton
              animation="wave"
              height={10}
              width="100%"
              sx={{
                bgcolor: colors.alpha.neutral[100],
                width: "100%",
                mb: 1,
              }}
            />
            <Skeleton
              animation="wave"
              height={10}
              width="100%"
              sx={{
                bgcolor: colors.alpha.neutral[100],
                width: "100%",
                borderRadius: 1,
              }}
            />
          </Stack>

          <Stack spacing={1} direction={"row"}>
            <Skeleton
              sx={{ bgcolor: colors.alpha.neutral[100], borderRadius: 1 }}
              variant="rounded"
              width={35}
              height={35}
            />

            <Skeleton
              sx={{ bgcolor: colors.alpha.neutral[100], borderRadius: 1 }}
              variant="rounded"
              width={35}
              height={35}
            />

            <Skeleton
              sx={{ bgcolor: colors.alpha.neutral[100], borderRadius: 1 }}
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
