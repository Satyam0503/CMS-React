import { Box } from "@mui/material";
import { CardSkeleton } from "./CardSkeleton";
import { UpcomingCelebration as UpcomingCelebrationType } from "../model";
import { useUpcomingCelebrationsQuery } from "../dashboardQueries";
import { UpcomingBirthdays } from "./UpcomingBirthdays";
import { UpcomingAnniversaries } from "./UpcomingAnniversaries";

export { UpcomingBirthdays } from "./UpcomingBirthdays";
export { UpcomingAnniversaries } from "./UpcomingAnniversaries";

export const UpComingCelebration = () => {
  const { data: response, isPending: isLoading } = useUpcomingCelebrationsQuery();
  const data: UpcomingCelebrationType = {
    birthday: response?.success && Array.isArray(response.methodResult?.birthday) ? response.methodResult.birthday : [],
    workAnniversary: response?.success && Array.isArray(response.methodResult?.workAnniversary) ? response.methodResult.workAnniversary : [],
  };



  if (isLoading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "1fr" },
          gap: { xs: 2, md: 3 },
          width: "100%",
        }}
      >
        <CardSkeleton />
        <CardSkeleton />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "1fr" },
        gap: { xs: 2, md: 3 },
        width: "100%",
      }}
    >
      <UpcomingBirthdays birthdays={data.birthday} />
      <UpcomingAnniversaries anniversaries={data.workAnniversary} />
    </Box>
  );
};

export const UpcomingCelebration = UpComingCelebration;
