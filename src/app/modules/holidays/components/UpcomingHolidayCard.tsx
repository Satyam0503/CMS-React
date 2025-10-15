import React, { useState } from "react";
import PropTypes from "prop-types";
import { Avatar, Box, Card, IconButton, List, ListItem, ListItemButton, ListItemText, Popover, Typography } from "@mui/material";
import { CalendarToday, Delete, Edit, MoreVertOutlined } from "@mui/icons-material";
import { HolidayModel, HolidayResponseModel } from "../models";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import HolidayForm from "./HolidayForm";
import { toast } from "react-toastify";
import { deleteHoliday } from "../holidayServices";

import { useContext } from "react";
import { ThemeContext } from "@emotion/react";

const initialValues: HolidayModel = {
    holidayId: "",
    holidayName: "",
    holidayType: 1,
    date: dayjs(Date.now()),
    detail: "",
};

interface Props{
    key: string
    holiday: HolidayResponseModel,
    holidayList: Array<HolidayModel>,
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
            const holiday = props.holidayList.find(item => item.holidayId === selectedHolidayId);
            if (holiday) {
                setInitialHolidayValues({
                holidayId: holiday.holidayId,
                holidayName: holiday.holidayName,
                holidayType: holiday.holidayType,
                date: dayjs(holiday.date),
                detail: holiday.detail
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
                const { data } = await deleteHoliday(selectedHolidayId);
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
        <Card
        component={"div"}
        className="gap-2 holiday-card hover-secondary w-100"
        >
            <Box component={'div'} className="d-flex gap-4 align-items-center">
                {props.holiday.holidayImageUrl ? (
                    <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        boxShadow: 2,
                        bgcolor: "secondary.main",
                    }}
                    src={String(props.holiday.holidayCoverImageUrl)}
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
                <Box component={"div"} className="d-flex flex-column gap-1">
                    <Typography variant="body1">{props.holiday.holidayName}</Typography>
                    <Typography variant="body2">
                    {props.holiday.detail.length > 30
                        ? props.holiday.detail.slice(0, 23).concat("...")
                        : props.holiday.detail}
                    </Typography>
                </Box>
            </Box>

            {(hasEditPermission || hasDeletePermission) && (
                <IconButton
                className="holiday-card-action-button"
                id="holiday-action-button"
                onClick={(e) => {
                    handleActionButtonClick(e, props.holiday.holidayId);
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
        </Card>
    );
}

UpcomingHolidayCard.propTypes = {};

export default UpcomingHolidayCard;
