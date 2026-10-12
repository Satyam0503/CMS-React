import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import CustomisedButton from "../../../shared/components/C_Button";
import { CustomisedModal } from "../../../shared/components/C_Modal";

export type AttendanceLockBlockingIssue = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  exceptionType: string;
  currentAttendanceStatus?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  message: string;
};

type Props = {
  blockingIssues: AttendanceLockBlockingIssue[];
  onClose: () => void;
  onResolveIssue: (issue: AttendanceLockBlockingIssue) => void;
};

export function AttendanceLockBlockingModal({
  blockingIssues,
  onClose,
  onResolveIssue,
}: Props) {
  return (
    <CustomisedModal
      open={blockingIssues.length > 0}
      handleClose={onClose}
      title="Attendance validation failed"
      maxWidth="lg"
      allowMaximize
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Attendance cannot be locked because <strong>{blockingIssues.length}</strong> blocking issue
          {blockingIssues.length === 1 ? "" : "s"} need to be resolved before generating payroll.
        </Typography>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small" stickyHeader aria-label="Blocking attendance issues">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell>Status / timing</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blockingIssues.map((issue, index) => (
                <TableRow
                  key={`${issue.employeeId}-${issue.attendanceDate}-${issue.exceptionType}-${index}`}
                  hover
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {issue.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {issue.employeeCode}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {dayjs(issue.attendanceDate).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell>{issue.message}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {issue.currentAttendanceStatus ?? "—"}
                    {issue.checkInTime ? ` | In: ${dayjs(issue.checkInTime).format("HH:mm")}` : ""}
                    {issue.checkOutTime ? ` | Out: ${dayjs(issue.checkOutTime).format("HH:mm")}` : ""}
                  </TableCell>
                  <TableCell align="right">
                    <CustomisedButton
                      label="Resolve in Attendance"
                      variant="outlined"
                      handleClick={() => onResolveIssue(issue)}
                      sx={{ whiteSpace: "nowrap" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Stack>
    </CustomisedModal>
  );
}
