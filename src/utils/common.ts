import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel } from "./common_types";
import { ApplicantStatus, ApplicationStatus, CommentAction } from "./enums";

export const dateFormatter = (
  date: Date | Dayjs | string | null,
  format: string
) => {
  if (!date) {
    return "NA";
  }
  return dayjs(date).format(format);
};

export const employeesListMapperforExport = (
  employeesList: EmployeeModel[]
) => {
  const mappedData = employeesList.map((employee) => {
    return {
      Id: employee.userId,
      "First Name": employee.firstName,
      "Last Name": employee.lastName,
      Email: employee.email,
      "Phone Number": employee.phoneNumber,
      Gender: employee.gender,
      "Date of Birth": dateFormatter(employee.dateOfBirth, "DD MMMM YYYY"),
      "Date of Joining": dateFormatter(employee.dateOfJoining, "DD MMMM YYYY"),
      Department: employee.department,
      Address: employee.address,
    };
  });
  return mappedData;
};

export const applicationStatusDecoder = (applicationStatus: number) => {
  switch (applicationStatus) {
    case ApplicationStatus.New:
      return "New";
    case ApplicationStatus.InProgress:
      return "In Progress";
    case ApplicationStatus.OnHold:
      return "On Hold";
    case ApplicationStatus.Shortlisted:
      return "Shortlisted";
    case ApplicationStatus.Selected:
      return "Selected";
    case ApplicationStatus.Rejected:
      return "Rejected";
    default:
      return "";
  }
};

export const getApplicationStatusClass = (applicationStatus: number) => {
  switch (applicationStatus) {
    case ApplicationStatus.New:
      return "info";
    case ApplicationStatus.InProgress:
    case ApplicationStatus.OnHold:
    case ApplicationStatus.Shortlisted: {
      return "warning";
    }
    case ApplicationStatus.Selected:
      return "success";
    case ApplicationStatus.Rejected:
      return "danger";
    default:
      return "";
  }
};

export const applicantStatusDecoder = (applicantStatus: number) => {
  switch (applicantStatus) {
    case ApplicantStatus.New:
      return "New";
    case ApplicantStatus.Active:
      return "Active";
    case ApplicantStatus.InActive:
      return "Inactive";
    default:
      return "";
  }
};

export const getApplicantStatusClass = (applicantStatus: number) => {
  switch (applicantStatus) {
    case ApplicantStatus.New:
      return "info";
    case ApplicantStatus.Active:
      return "success";
    case ApplicantStatus.InActive:
      return "danger";
    default:
      return "";
  }
};

export const commentActionEncoderForApplicationStatus = (
  activityStatus: number
) => {
  switch (activityStatus) {
    case ApplicationStatus.InProgress:
      return CommentAction.InProgress;
    case ApplicationStatus.OnHold:
      return CommentAction.OnHold;
    case ApplicationStatus.Shortlisted:
      return CommentAction.Shortlisted;
    case ApplicationStatus.Selected:
      return CommentAction.Selection;
    case ApplicationStatus.Rejected:
      return CommentAction.Rejection;
    default:
      CommentAction.InProgress;
  }
};

export const commentActionDecoder = (commentAction: number) => {
  switch (commentAction) {
    case CommentAction.InProgress:
      return "In Process";
    case CommentAction.OnHold:
      return "On Hold";
    case CommentAction.Shortlisted:
      return "Shortlisted";
    case CommentAction.Selection:
      return "Selection";
    case CommentAction.Rejection:
      return "Rejection";
    default:
      "In Process";
  }
};

export const statusEncoder = (status: string) => {
  switch (status) {
    case "Active":
      return true;
    case "Inactive":
      return false;
    default:
      return false;
  }
};
export const statusDecoder = (status: boolean) => {
  switch (status) {
    case true:
      return "Active";
    case false:
      return "Inactive";
    default:
      return "";
  }
};

export const ApplicantStatusMapper: {
  [index: number]: ApplicantStatus;
} = {
  [ApplicationStatus.New]: ApplicantStatus.New,
  [ApplicationStatus.InProgress]: ApplicantStatus.Active,
  [ApplicationStatus.OnHold]: ApplicantStatus.Active,
  [ApplicationStatus.Shortlisted]: ApplicantStatus.Active,
  [ApplicationStatus.Selected]: ApplicantStatus.Active,
  [ApplicationStatus.Rejected]: ApplicantStatus.InActive,
};


export const experienceCategoryList = [
  { id: 1, label: "0 - 1", value: 1 },
  {
    id: 2,
    label: "1 - 2",
    value: 2,
  },
  {
    id: 3,
    label: "2 - 3",
    value: 3,
  },
  {
    id: 4,
    label: "3 - 4",
    value: 4,
  },
  {
    id: 5,
    label: "4 - 5",
    value: 5,
  },
  {
    id: 6,
    label: "5 - 6",
    value: 6,
  },
  {
    id: 7,
    label: "6 - 7",
    value: 7,
  },
  {
    id: 8,
    label: "7 - 8",
    value: 8,
  },
  {
    id: 9,
    label: "8 - 9",
    value: 9,
  },
  {
    id: 10,
    label: "9 - 10",
    value: 10,
  },
  {
    id: 11,
    label: "10 - 11",
    value: 11,
  },
  {
    id: 12,
    label: "11 - 12",
    value: 12,
  },
  {
    id: 13,
    label: "12 - 13",
    value: 13,
  },
  {
    id: 14,
    label: "13 - 14",
    value: 14,
  },
  {
    id: 15,
    label: "14 - 15",
    value: 15,
  },
];
export const monthsExperienceList = [
  { id: 1, label: "0", value: 0 },
  {
    id: 2,
    label: "1",
    value: 1,
  },
  {
    id: 3,
    label: "2",
    value: 2,
  },
  {
    id: 4,
    label: "3",
    value: 3,
  },
  {
    id: 5,
    label: "4",
    value: 4,
  },
  {
    id: 6,
    label: "5",
    value: 5,
  },
  {
    id: 7,
    label: "6",
    value: 6,
  },
  {
    id: 8,
    label: "7",
    value: 7,
  },
  {
    id: 9,
    label: "8",
    value: 8,
  },
  {
    id: 10,
    label: "9",
    value: 9,
  },
  {
    id: 11,
    label: "10",
    value: 10,
  },
  {
    id: 12,
    label: "11",
    value: 11,
  },
  {
    id: 13,
    label: "12",
    value: 12,
  },
];

export const getAgeInYears = (dob: Dayjs) => {
  return dayjs(new Date()).diff(dob, "years");
};

export const convertMonthsToYear = (months: number) => {
  let years = Math.round(months / 12);
  let suffix = years > 1 ? "Years" : "Year";
  return years + " " + suffix;
};
