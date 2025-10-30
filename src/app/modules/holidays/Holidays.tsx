import {
  Avatar,
  Badge,
  Box,
  Card,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  CalendarToday,
  Delete,
  Edit,
  FilterList,
  MoreVertOutlined,
} from "@mui/icons-material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import HolidayForm from "./components/HolidayForm";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";
import { addEditCalendarItem, deleteCalendarItem, getAllCalendarItem } from "./holidayServices";
import { GetCalendarItemPayload, CalendarItem } from "./models";
import { toast } from "react-toastify";
import { HolidayFilter, initialFilterValues } from "./components/HolidayFilter";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName, Permission } from "../../../utils/enums";
import { countAppliedFilter, dateFormatter, hasModuleFeaturePermission } from "../../../utils/common";
import { usePageData } from "../../Context/PageDataProvider";

const monthMap = {
  JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
  JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
} as const;

// const holidayMonth: (keyof typeof monthMap)[] = [
//   "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
//   "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
// ];
const holidayMonth = [
  { id: 1, name: "MONTHS.JANUARY" },
  { id: 2, name: "MONTHS.FEBRUARY" },
  { id: 3, name: "MONTHS.MARCH" },
  { id: 4, name: "MONTHS.APRIL" },
  { id: 5, name: "MONTHS.MAY" },
  { id: 6, name: "MONTHS.JUNE" },
  { id: 7, name: "MONTHS.JULY" },
  { id: 8, name: "MONTHS.AUGUST" },
  { id: 9, name: "MONTHS.SEPTEMBER" },
  { id: 10, name: "MONTHS.OCTOBER" },
  { id: 11, name: "MONTHS.NOVEMBER" },
  { id: 12, name: "MONTHS.DECEMBER" }
];

const initialValues: CalendarItem = {
  id: "",
  name: "",
  type: 1,
  date: dayjs(Date.now()),
  description: "",
  imageUrl: null,
  recurring: false
};
export default function Holidays() {
  const { setPageTitle } = usePageData();
  const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [holidayList, setHolidayList] = useState<CalendarItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const { formatMessage: i } = useIntl();
  const [anchorE1, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const holidayFilters = useAppSelector((state) => state.filters.holiday);
  const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const [actionBtnAnchor, setActionBtnAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>();

  const hasEditPermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Edit, modulePermission);
  const hasDeletePermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Delete, modulePermission);
  const hasAddPermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Create, modulePermission);


  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialHolidayValues(initialValues);
    handleActionMenuClose();
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHolidayEdit = () => {
    if (selectedHolidayId) {
      const holiday = holidayList.find(item => item.id === selectedHolidayId);
      if (holiday) {
        setInitialHolidayValues({
          id: holiday.id,
          name: holiday.name,
          type: holiday.type,
          date: dayjs(holiday.date),
          description: holiday.description,
          imageUrl: holiday.imageUrl,
          recurring: holiday.recurring
        });
        setEdit(true);
        setModalOpen(true);
      }
    }
  };


  const handleHolidayDeletion = async (res: string) => {
    if (res !== "ok" || !selectedHolidayId) {
      handleDeleteModalClose();
    } else {
      try {
        const { data } = await deleteCalendarItem(selectedHolidayId);
        if (data.success) {
          handleRefresh();
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

  const closeFilterModal = () => {
    setAnchorEl(null);
  }
  const handleRefresh = () => {
    setRefresh(!isRefresh);
  }

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>, holidayId?: string) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedHolidayId(holidayId);
  };
  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedHolidayId(undefined);
  }
  const handleHolidayDeleteClick = () => {
    if (selectedHolidayId) {
      setDeleteModalOpen(true);
    }
  }

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    handleActionMenuClose();
  }

  useEffect(() => {
    setLoading(true);
    const payload: GetCalendarItemPayload = {
      type: null,
      year: null
    }
      
      )
    };
    const fetchedHolidayData = async () => {
      try {
        const response = await getAllCalendarItem(payload);
        const { success, methodResults, } = response.data;
        if (success) {
          setHolidayList(methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchedHolidayData()
  }, [searchValue, holidayFilters, isRefresh]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.HOLIDAYS" }))
  }, [])

  return (
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-6 p-4 p-md-6">
        <Stack className="flex-row flex-wrap-reverse justify-content-end align-items-center gap-2" >
          <Stack direction="row" spacing={1.5}>
            <Badge badgeContent={countAppliedFilter(holidayFilters)}
              anchorOrigin={{ horizontal: "left", vertical: "top" }}
              color="primary">
              <CustomIconButton
                tooltip={i({ id: "TOOLTIP.FILTER_HOLIDAY" })}
                icon={<FilterList />}
                handleClick={handleFilterClick}
              />
            </Badge>
            {
              hasAddPermission &&
              <CustomIconButton
                tooltip={i({ id: "TOOLTIP.ADD_HOLIDAY" })}
                icon={<Add />}
                handleClick={() => {
                  setModalOpen(true)
                }}
              />
            }
          </Stack>
        </Stack>
        <Box component="div" className="holiday_container">
          {
            holidayMonth.map(month => {
              const currentMonthHolidays = holidayList.filter(holiday => {
                return dayjs(holiday.date).month() + 1 === month.id;
              })
              return <Stack className="holiday-month" key={month.id}>
                <Typography variant="h4" >{i({ id: month.name })}</Typography>
                <Stack className="gap-3">
                  {
                    currentMonthHolidays.length === 0 ?
                      <>
                        <Stack className="holiday-card">
                          <Avatar variant="rounded" sx={{
                            width: 72,
                            height: 72,
                            bgcolor: "secondary.main"
                          }}><CalendarToday className="fs-32" /></Avatar>
                          <Typography variant="h6">{i({ id: "HOLIDAY.NO_HOLIDAYS" })}</Typography>
                        </Stack>
                        <Divider />
                      </>
                      :
                      currentMonthHolidays.map(holiday => (
                        <React.Fragment key={holiday.id}>
                          <Stack className="holiday-card">
                            {
                              holiday.imageUrl ?
                                <Avatar sx={{
                                  width: 72,
                                  height: 72,
                                  boxShadow: 2,
                                  bgcolor: "secondary.main"
                                }} src={holiday.imageUrl} variant="rounded" />
                                : <Avatar variant="rounded" sx={{
                                  width: 72,
                                  height: 72,
                                  bgcolor: "secondary.main"
                                }}><CalendarToday className="fs-32" /></Avatar>
                            }
                            <Stack className="">
                              <Typography className="fs-20">{holiday.name}</Typography>
                              <Typography variant="body1">{dateFormatter(holiday.date, "MMM D, YYYY")}</Typography>
                            </Stack>
                            {
                              (hasEditPermission || hasDeletePermission) &&
                              <IconButton
                                className="holiday-card-action-button"
                                id="holiday-action-button"
                                onClick={(e) => {
                                  handleActionButtonClick(e, holiday.id);
                                }}
                              >
                                <MoreVertOutlined />
                              </IconButton>
                            }
                          </Stack>
                          <Divider />
                        </React.Fragment>
                      ))}
                </Stack>
              </Stack>
            })
          }
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
                    boxShadow: 1
                  }
                }
              }}
            >
              <List disablePadding>
                {
                  hasEditPermission &&
                  <ListItem disablePadding divider onClick={handleHolidayEdit}>
                    <ListItemButton >
                      <ListItemText primary={
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
        </Box>
      </Card >
      {Boolean(anchorE1) && (
        <HolidayFilter
          open={true}
          anchorEl={anchorE1}
          handleClose={closeFilterModal}
        />
      )
      }

      {
        isModalOpen && (
          <HolidayForm
            open={isModalOpen}
            handleRefresh={handleRefresh}
            handleClose={handleCloseModal}
            initialValues={initialHolidayValues}
            isEdit={isEdit}
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
    </>
  );
}
