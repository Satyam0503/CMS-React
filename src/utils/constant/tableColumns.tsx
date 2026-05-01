import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import clsx from "clsx";
import { ColumnListTypes } from "../common_types";
import {
  applicantStatusDecoder,
  commentActionMapper,
  dateFormatter,
  jobStatusMapper,
  JobTypeMapper,
  noticeTypeDecoder,
  relativeTimeFormatter,
  sanitizeHtmlContent,
} from "../common";
import { ApplicantStatus, NOTICE_TYPE } from "../enums";
import { Applicant, JobModal } from "../../app/modules/recruitment/models";
import { ActionComponent } from "../../app/shared/components/ActionComponent";
import { StyleStatus } from "../../app/shared/components/StyledStatus";
import { AvatarCell } from "../../app/shared/components/AvatarCell";
import { RoleModel } from "../../app/modules/admin/models";
import {
  NoticeModel,
  NoticeResponseModel,
  ViewModel,
} from "../../app/modules/noticeboard/models";
import {
  LeaveBalance,
  LeaveBalanceType,
  LeaveType,
} from "../../app/modules/leaves/model";
import { DEFAULT_USER_AVATAR } from "./data";

export const NoticeBoardTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "NOTICE.POSTED_BY",
    minWidth: 200,
    avatarCell: (notice: NoticeResponseModel) => {
      return (
        <AvatarCell
          avatarSrc={notice.userProfile}
          title={notice.userName}
          subTitle={notice.userDesignation}
        />
      );
    },
  },
  {
    id: "createdDateTime",
    label: "NOTICE.POSTED_DATETIME",
    minWidth: 150,
    format: (value: string) => relativeTimeFormatter(value),
  },

  {
    id: "noticeType",
    label: "NOTICE.TYPE",
    build: (noticeType: number) => {
      const type = noticeTypeDecoder[noticeType];
      return (
        <StyleStatus
          label={type}
          className={clsx({
            success: noticeType === NOTICE_TYPE.GENERAL,
            warning: noticeType === NOTICE_TYPE.IMPORTANT,
            danger: noticeType === NOTICE_TYPE.URGENT,
          })}
        />
      );
    },
  },
  {
    id: "noticeTitle",
    label: "NOTICE.MESSAGE",
    build: (notice: NoticeResponseModel) => {
      return (
        <Box
          component="span"
          sx={{
            textOverflow: "ellipsis",
            maxWidth: 250,
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            margin: 0,
            fontSize: 14,
            color: notice.viewedStatus ? "text.secondary" : "text.primary",
          }}
        >
          {notice.noticeTitle}
        </Box>
      );
    },
  },
];

export const MyNoticeTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "createdDate",
    label: "NOTICE.POSTED_DATETIME",
    minWidth: 150,
    format: (value: string) => relativeTimeFormatter(value),
  },

  {
    id: "noticeType",
    label: "NOTICE.TYPE",
    build: (noticeType: number) => {
      const type = noticeTypeDecoder[noticeType];
      return (
        <StyleStatus
          label={type}
          className={clsx({
            success: noticeType === NOTICE_TYPE.GENERAL,
            warning: noticeType === NOTICE_TYPE.IMPORTANT,
            danger: noticeType === NOTICE_TYPE.URGENT,
          })}
        />
      );
    },
  },
  {
    id: "title",
    label: "NOTICE.MESSAGE",
    build: (message: string) => {
      return (
        <Stack direction="row">
          <Box
            component="span"
            sx={{
              textOverflow: "ellipsis",
              maxWidth: 200,
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "inline-block",
              margin: 0,
            }}
          >
            {message}
          </Box>
        </Stack>
      );
    },
  },
  {
    id: "views",
    label: "NOTICE.VIEWS",
    build: (views: ViewModel) => {
      return views.length === 0 ? (
        "_"
      ) : (
        <AvatarGroup
          spacing={20}
          className="justify-content-end"
          total={views.length}
          slotProps={{
            additionalAvatar: {
              sx: {
                width: 32,
                height: 32,
                left: 10,
              },
            },
          }}
          renderSurplus={(surplus) => <span>+{surplus.toString()[0]}</span>}
        >
          {views.slice(0, 8).map((view) => (
            <Tooltip key={view.employeeId} title={view.employeeName}>
              <Avatar
                alt={view.employeeName}
                src={view.profileUrl ?? DEFAULT_USER_AVATAR}
                sx={{ width: 32, height: 32 }}
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: NoticeModel,
      handleNoticeEdit: (row: NoticeModel) => void,
      openConfirmationModal: (row: NoticeModel) => void,
    ) => (
      <ActionComponent
        row={row}
        openConfirmationModal={openConfirmationModal}
      />
    ),
  },
];

export const ProcessLogTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "applicantName",
    label: "APPLICANT.NAME",
    minWidth: 150,
  },
  {
    id: "jobRole",
    label: "FORM.JOB_ROLE",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "COMMENT.COMMENT_ON",
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
    minWidth: 150,
    sorting: true,
  },
  {
    id: "userName",
    label: "COMMENT.COMMENT_BY",
    minWidth: 150,
  },
  {
    id: "activityCategory",
    label: "COMMENT.ACTION_CATEGORY",
    minWidth: 150,
    format: (value: number) => (
      <FormattedMessage id={commentActionMapper[value]} />
    ),
  },
  {
    id: "description",
    label: "COMMENT.COMMENT",
    minWidth: 200,
    build: (value: string) => (
      <Tooltip
        title={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(value) }}
            sx={{
              fontSize: "12px",
              "& p": {
                margin: 0,
                color: "#FFFFFF",
              },
            }}
          />
        }
        arrow
        placement="top"
      >
        <Typography
          variant="body1"
          style={{
            width: "200px",
            overflow: "hidden",
            textWrap: "nowrap",
            textOverflow: "ellipsis",
            fontSize: "12px",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          sx={{
            "& p": {
              margin: 0,
            },
          }}
        />
      </Tooltip>
    ),
  },
];

export const AttendanceMangementTableColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "first_in",
    label: "First_In",
  },

  {
    id: "break",
    label: "Break",
  },

  {
    id: "Last_Out",
    label: "Last_Out",
  },
  {
    id: "total_hours",
    label: "Total_Hours",
  },
  {
    id: "shift",
    label: "Shift",
  },
  {
    id: "status",
    label: "STATUS",
  },

  {
    id: "action",
    label: "ACTION",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];

export const ApplicationTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },

  {
    id: "fullName",
    label: "FORM.FULL_NAME",
    minWidth: 150,
  },
  {
    id: "vacancyName",
    label: "JOB.JOB_TITLE",
    minWidth: 150,
  },
  {
    id: "status",
    label: "STATUS",
    build: (status: number) => {
      const values = applicantStatusDecoder[status];
      return (
        <StyleStatus
          label={values}
          className={clsx({
            success: status === ApplicantStatus.Active,
            danger: status === ApplicantStatus.InActive,
          })}
        />
      );
    },
  },
  {
    id: "experience",
    label: "FORM.EXPERIENCE",
    align: "center",
    sorting: true,
    format: (value: number) => {
      const experience = (value / 12).toFixed(1);
      return (
        <FormattedMessage id={"PLURAL.YEAR"} values={{ years: experience }} />
      );
    },
  },
  {
    id: "applyDate",
    label: "APPLICATION.APPLIED_DATE",
    minWidth: 180,
    sorting: true,
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
  },
  {
    id: "action",
    label: "APPLICATION.CV",
    build: (
      row: Applicant,
      handleApplicationEdit: (row: Applicant) => void,
      openConfirmationModal: (row: Applicant) => void,
      openViewApplication: (row: Applicant) => void,
    ) => <ActionComponent row={row} openViewModal={openViewApplication} />,
  },
];

export const RoleTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "titles",
    label: "ROLE.NAME",
    minWidth: 200,
  },
  {
    id: "description",
    label: "ROLE.DESCRIPTION",
    minWidth: 200,
  },
  {
    id: "hasAppAccess",
    label: "ROLE.HAS_APP_ACCESS",
    minWidth: 180,
    format: (hasAccess: boolean) => (
      <StyleStatus
        label={hasAccess ? "ROLE.HAS_ACCESS" : "ROLE.NO_ACCESS"}
        className={clsx({ success: hasAccess, danger: !hasAccess })}
      />
    ),
  },
  {
    id: "action",
    label: "ACTION",
    minWidth: 180,
    build: (row: RoleModel) => (
      <Link to={`/admin/roles/edit/${row.rolesId}`}>
        <Button variant="contained">
          <FormattedMessage
            id={
              row.isNotEditable
                ? "ROLE.VIEW_PERMISSION"
                : "ROLE.EDIT_PERMISSION"
            }
          />
        </Button>
      </Link>
    ),
  },
];

export const JobRequirementTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 30,
  },

  {
    id: "title",
    label: "JOB.JOB_TITLE",
  },
  {
    id: "vacancies",
    label: "JOB.NO_OF_VACANCIES",
    align: "center",
    sorting: true,
  },
  {
    id: "jobType",
    label: "JOB.TYPE",
    format: (jobType: number) => (
      <FormattedMessage id={JobTypeMapper[jobType]} />
    ),
  },
  {
    id: "status",
    label: "STATUS",
    build: (status: boolean) => {
      return (
        <StyleStatus
          label={jobStatusMapper[Number(status)]}
          className={clsx({ success: status, danger: !status })}
        />
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: JobModal,
      handleJobEdit: (row: JobModal) => void,
      openDeleteModal: (row: JobModal) => void,
      openViewJobDetail: (row: JobModal) => void,
    ) => <ActionComponent row={row} openViewModal={openViewJobDetail} />,
  },
];

export const CommentTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "COMMENT.ACTION_BY",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "COMMENT.COMMENT_ON",
    minWidth: 200,
    format: (value: string) => dateFormatter(value, "MMMM DD YYYY  hh:mm A"),
  },
  {
    id: "activityCategory",
    label: "COMMENT.ACTION_CATEGORY",
    minWidth: 150,
    format: (value: number) => (
      <FormattedMessage id={commentActionMapper[value]} />
    ),
  },
  {
    id: "description",
    label: "COMMENT.COMMENT",
    minWidth: 200,
    build: (value: string) => (
      <Tooltip
        title={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(value) }}
            sx={{
              fontSize: "12px",
              "& p": {
                margin: 0,
                color: "#FFFFFF",
              },
            }}
          />
        }
        arrow
        placement="top"
      >
        <Typography
          variant="body1"
          style={{
            width: "200px",
            overflow: "hidden",
            textWrap: "nowrap",
            textOverflow: "ellipsis",
            fontSize: "12px",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          sx={{
            "& p": {
              margin: 0,
            },
          }}
        />
      </Tooltip>
    ),
  },
];

export const EmployeeLeaveBalanceColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "employeeName",
    label: "LEAVE.EMPLOYEE_NAME",
    minWidth: 200,
    avatarCell: (data: LeaveBalance) => {
      return (
        <AvatarCell
          avatarSrc={data.profileUrl}
          title={data.employeeName}
          subTitle={data.jobRole}
        />
      );
    },
  },
  {
    id: "sickLeave",
    label: "LEAVE.TYPES.SICK_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "casualLeave",
    label: "LEAVE.TYPES.CASUAL_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "earnedLeave",
    label: "LEAVE.TYPES.EARNED_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "maternityLeave",
    label: "LEAVE.TYPES.MATERNITY_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "paternityLeave",
    label: "LEAVE.TYPES.PATERNITY_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: LeaveBalance,
      handleLeaveBalanceEdit: (row: LeaveBalance) => void,
    ) => <ActionComponent row={row} handleEdit={handleLeaveBalanceEdit} />,
  },
];

export const EmployeeLeavePoliciesColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "LEAVE.TYPES.POLICY_NAME",
  },
  {
    id: "code",
    label: "LEAVE.TYPES.POLICY_CODE",
  },
  {
    id: "paid",
    label: "LEAVE.TYPES.POLICY_PAID",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "accrualPeriod",
    label: "LEAVE.TYPES.POLICY_ACCURAL_PERIOD",
    build: (value: number) => {
      return (
        value &&
        (value === 1 ? (
          <Typography>Monthly</Typography>
        ) : value === 2 ? (
          <Typography>Yearly</Typography>
        ) : (
          <Typography>None</Typography>
        ))
      );
    },
  },
  {
    id: "carryOverAllowed",
    label: "LEAVE.TYPES.POLICY_CARRY_OVER_ALLOWED",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "minNoticeDays",
    label: "LEAVE.TYPES.POLICY_MIN_NOTICE_DAYS",
  },
  {
    id: "halfDayAllowed",
    label: "LEAVE.TYPES.POLICY_HALF_DAYS_ALLOWED",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "status",
    label: "LEAVE.TYPES.POLICY_STATUS",
    build: (status: boolean) => {
      return (
        <StyleStatus
          label={jobStatusMapper[Number(status)]}
          className={clsx({ success: status, danger: !status })}
        />
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (row: LeaveType, handleLeaveTypeEdit: (row: LeaveType) => void) => (
      <ActionComponent row={row} handleEdit={handleLeaveTypeEdit} />
    ),
  },
];
