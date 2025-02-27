import * as React from "react";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";

export default function HalfRating() {
  return (
    <Stack>
      <Rating
        name="half-rating"
        defaultValue={2.5}
        precision={0.5}
        sx={{ fontSize: "14px", ml: 2 }}
      />
    </Stack>
  );
}
