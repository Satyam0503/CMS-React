import React, { useState } from "react";
import { Avatar, Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Popover, Stack, Typography } from "@mui/material";
import { CalendarToday, Delete, Edit, MoreVertOutlined } from "@mui/icons-material";
import { CalendarItem } from "../models";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import HolidayForm from "./HolidayForm";
import { toast } from "react-toastify";
import { deleteCalendarItem } from "../holidayServices";

const initialValues: CalendarItem = {
    id: "",
    name: "",
    type: 1,
    date: dayjs(Date.now()),
    description: "",
    recurring: false,
    imageUrl: null
};

interface Props {
    key: string
    occasion: CalendarItem,
    occasions: Array<CalendarItem>,
    handleRefresh: () => void
}

function UpcomingHolidayCard(props: Props) {

    const { formatMessage: i } = useIntl();
    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? [];

    const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(null);
    const [selectedHolidayId, setSelectedHolidayId] = useState<string>();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);
    const [edit, setEdit] = useState<boolean>(false)
    const [isModalOpen, setModalOpen] = useState(false);

    const hasEditPermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Edit, modulePermission);
    const hasDeletePermission = hasModuleFeaturePermission(ModulesName.Holidays, Permission.Delete, modulePermission);

    const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>, holidayId?: string) => {
        setActionBtnAnchor(event.currentTarget);
        setSelectedHolidayId(holidayId);
    };

    const handleActionMenuClose = () => {
        setActionBtnAnchor(null);
        setSelectedHolidayId(undefined);
        props.handleRefresh()
    }

    const handleHolidayDeleteClick = () => {
        if (selectedHolidayId) {
            setDeleteModalOpen(true);
        }
    }

    const handleHolidayEdit = () => {
        if (selectedHolidayId) {
            const holiday = props.occasions.find(item => item.id === selectedHolidayId);

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

    const handleCloseModal = () => {
        setModalOpen(false);
        setEdit(false);
        setInitialHolidayValues(initialValues);
        handleActionMenuClose();
        props.handleRefresh()
    };

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
        handleActionMenuClose();
        props.handleRefresh()
    }

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

    return (
        <Stack
            component="div"
            className="gap-2 holiday-card flex-row justify-content-between align-items-center p-1 rounded hover-secondary "
        >
            <Box component={'div'} className="d-flex gap-2 align-items-center">
                {props.occasion.imageUrl ? (
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            boxShadow: 2,
                            bgcolor: "secondary.main",
                        }}
                        src={String(props.occasion.imageUrl)}
                        variant="rounded"
                    />
                ) : (
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "secondary.main",
                        }}
                    >
                        <CalendarToday className="fs-32" />
                    </Avatar>
                )}
                <Box component={"div"} className="d-flex flex-column gap-1"
                    sx={{
                        whiteSpace: 'nowrap',
                        width: '115px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    <Typography variant="body1">{props.occasion.name.length > 20
                        ? props.occasion.name.slice(0, 19).concat("...")
                        : props.occasion.name}
                    </Typography>
                    <Typography variant="body2">
                        {props.occasion.description.length > 20
                            ? props.occasion.description.slice(0, 19).concat("...")
                            : props.occasion.description}
                    </Typography>
                </Box>
            </Box>

            {((hasEditPermission || hasDeletePermission) && (props.occasion.type != 3 && props.occasion.type != 4)) && (
                <IconButton
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
                </IconButton>
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
                        <Divider
                            sx={{
                                borderColor: 'black'
                            }}
                        />
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
        </Stack>
    );
}

UpcomingHolidayCard.propTypes = {};

export default UpcomingHolidayCard;
