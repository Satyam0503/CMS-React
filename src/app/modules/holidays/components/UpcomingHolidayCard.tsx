import { parseInterviewCalendarItem } from "../../recruitment/utils/interviewCalendarUtils";
import { InterviewDossierModal } from "../../recruitment/applications/components/InterviewDossierModal";
import React, { useState } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, Edit, MoreVertOutlined } from "@mui/icons-material";
import { CalendarItem } from "../models";
import { calendarItemStyleMapper, dateFormatter, formatServerDate, getOrdinalSuffix, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import HolidayForm from "./HolidayForm";
import { toast } from "react-toastify";
import { deleteCalendarItem } from "../calendarServices";

import { AppIconButton } from "../../../shared/components/ui";
const initialValues: CalendarItem = {
  id: "",
  name: "",
  type: 1,
  date: dayjs(Date.now()),
  description: "",
  recurring: false,
  imageUrl: null,
};

interface Props {
  key: string;
  occasion: CalendarItem;
  occasions: Array<CalendarItem>;
  handleRefresh: () => void;
}

export const UpcomingHolidayCard = (props: Props) => {

  const { formatMessage: i } = useIntl();
  const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];

  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [initialHolidayValues, setInitialHolidayValues] =
    useState(initialValues);
  const [edit, setEdit] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const interviewMeta = parseInterviewCalendarItem(props.occasion);

  const hasEditPermission = hasModuleFeaturePermission(
    ModulesName.Calendar,
    Permission.Edit,
    modulePermission
  );
  const hasDeletePermission = hasModuleFeaturePermission(
    ModulesName.Calendar,
    Permission.Delete,
    modulePermission
  );

  const handleActionButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    holidayId?: string
  ) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedHolidayId(holidayId);
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedHolidayId(undefined);
    props.handleRefresh();
  };

  const handleHolidayDeleteClick = () => {
    if (selectedHolidayId) {
      setDeleteModalOpen(true);
    }
  };

  const handleHolidayEdit = () => {
    if (selectedHolidayId) {
      const holiday = props.occasions.find(
        (item) => item.id === selectedHolidayId
      );

      if (holiday) {
        setInitialHolidayValues({
          id: holiday.id,
          name: holiday.name,
          type: holiday.type,
          date: dayjs(holiday.date),
          description: holiday.description,
          imageUrl: holiday.imageUrl,
          recurring: holiday.recurring,
        });
        setEdit(true);
        setModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialHolidayValues(initialValues);
    handleActionMenuClose();
    props.handleRefresh();
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    handleActionMenuClose();
    props.handleRefresh();
  };

  const handleHolidayDeletion = async (res: string) => {
    if (res !== "ok" || !selectedHolidayId) {
      handleDeleteModalClose();
    } else {
      try {
        const { data } = await deleteCalendarItem(selectedHolidayId);
        if (data.success) {
          props.handleRefresh();
          toast.success(i({ id: "TOAST.SUCCESS.DELETE" }));
          handleDeleteModalClose();
        } else {
          toast.error(i({ id: "TOAST.FAILED.DELETE" }))
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : error)
      }
    }
  };

  const date = dayjs(formatServerDate(props.occasion.date, "YYYY-MM-DD"));

  return (

    <Stack
      component="div"
      className="gap-1 flex-row justify-content-between align-items-center p-2 rounded hover-secondary "
    >
      <Tooltip title={
        <>
          <span>{props.occasion.name}</span> <br />
          <span>{props.occasion.description}</span>
        </>
      }
        slotProps={{
          tooltip: {
            sx: {
              padding: 1,
            }
          }
        }}
        arrow
      >
        <Box
          component='div'
          className="d-flex gap-2 align-items-center"
          sx={{
            flexGrow: 1,
            cursor: interviewMeta.isInterview ? "pointer" : "default",
          }}
          onClick={() => {
            if (interviewMeta.isInterview) {
              setInterviewModalOpen(true);
            }
          }}
        >
          <Box className={`date-box ${calendarItemStyleMapper[props.occasion.type]}`}>
            <span>{getOrdinalSuffix(date.date())}</span>
            <span>{dateFormatter(date, "MMM")}</span>
          </Box>
          <Box component="div" sx={{
            width: "120px",
            flexGrow: 1,
            overflow: 'hidden',
          }}>
            <Typography variant="body1" className="text-truncate">{props.occasion.name} </Typography>
            <Typography variant="body2" className="text-truncate">
              {interviewMeta.isInterview ? "📋 Click to open Interview Dossier & Scorecard" : props.occasion.description}
            </Typography>
          </Box>
        </Box>
      </Tooltip >

      {((hasEditPermission || hasDeletePermission) && (props.occasion.type != 3 && props.occasion.type != 4)) && (
        <AppIconButton
          className="holiday-card-action-button"
          sx={{
            border: 'none'
          }}
          id="holiday-action-button"
          onClick={(e) => {
            handleActionButtonClick(e, props.occasion.id);
          }}
        >
          <MoreVertOutlined />
        </AppIconButton>
      )}
      {
        Boolean(actionBtnAnchor) &&
        <Popover
          id="holiday-action-menu"
          open={true}
          anchorEl={actionBtnAnchor}
          onClose={handleActionMenuClose}
          anchorOrigin={{
            horizontal: "right",
            vertical: "bottom",
          }}
          transformOrigin={{
            horizontal: "left",
            vertical: "top",
          }}
          slotProps={{
            paper: {
              sx: {
                boxShadow: 2
              }
            }
          }}
        >
          <List disablePadding className="popover-list">
            {
              hasEditPermission &&
              <ListItem disablePadding divider onClick={handleHolidayEdit}>
                <ListItemButton >
                  <ListItemText
                    primary={
                      <Typography>
                        <Edit className="fs-16 me-2" />
                        {i({ id: "BUTTON.EDIT" })}
                      </Typography>
                    } />
                </ListItemButton>
              </ListItem>
            }
            {
              hasDeletePermission &&
              <ListItem disablePadding onClick={handleHolidayDeleteClick}>
                <ListItemButton>
                  <ListItemText primary={
                    <Typography className="text-center">
                      <Delete color="error" className="fs-16 me-2" />
                      {i({ id: "BUTTON.DELETE" })}
                    </Typography>
                  } />
                </ListItemButton>
              </ListItem>
            }
          </List>
        </Popover>
      }
      {
        isModalOpen && (
          <HolidayForm
            open={isModalOpen}
            handleRefresh={props.handleRefresh}
            handleClose={handleCloseModal}
            initialValues={initialHolidayValues}
            isEdit={edit}
          />
        )
      }
      {
        isDeleteModalOpen && (
          <ConfirmationModal
            title={i({ id: "CONFIRMATION.TITLE.DELETE_HOLIDAY" })}
            content={i({ id: "CONFIRMATION.CONTENT.DELETE_HOLIDAY" })}
            open={true}
            handleClose={handleDeleteModalClose}
            handleConfirmation={handleHolidayDeletion}
          />
        )
      }
      {interviewMeta.isInterview && (
        <InterviewDossierModal
          open={interviewModalOpen}
          onClose={() => setInterviewModalOpen(false)}
          occasion={props.occasion}
          onScorecardSubmitted={props.handleRefresh}
        />
      )}
    </Stack>

  );
}
