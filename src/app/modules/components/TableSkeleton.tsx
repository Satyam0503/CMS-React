import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { colors } from "../theme/MuiTheme";
import { Grid } from "@mui/material";

export default function TableSkeleton() {
  return (
    <Grid container display={"flex"} flexDirection={"column"} gap={1}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        {/* <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid> */}
      </Grid>
      {/* <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Skeleton
            sx={{
              bgcolor: colors.alpha.neutral[100],
              borderRadius: 1,
              boxShadow: "unset",
            }}
            variant="rectangular"
            animation="pulse"
            width="100%"
            height={60}
          />
        </Grid>
      </Grid> */}
    </Grid>
  );
}
