import dayjs, { Dayjs } from "dayjs";

export const getYearsAtCurrentCompany = (dateOfJoining?: string | Dayjs | null) => {
  if (!dateOfJoining) {
    return 0;
  }

  const doj = dayjs.isDayjs(dateOfJoining) ? dateOfJoining : dayjs(dateOfJoining as string);
  const diff = dayjs().diff(doj, "years");
  return Number.isFinite(diff) ? diff : 0;
};
