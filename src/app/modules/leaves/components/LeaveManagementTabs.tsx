import { AccountBalanceWallet, EditCalendar, HomeWork } from "@mui/icons-material";
import { Box, Card, Stack } from "@mui/material"
import { Outlet, useNavigate } from "react-router-dom"
import { TabModel } from "../../../../utils/common_types";
import clsx from "clsx";
import { checkIsActive } from "../../../../_themes/helpers";
import PolicyIcon from '@mui/icons-material/Policy';
import { useIntl } from "react-intl";

const tabsRoutes: TabModel[] = [
    {
        tabId: 1,
        to: "leaverequest",
        title: "LEAVE.TITLES.LEAVE_REQUESTS",
        icon: <EditCalendar />,
    },
    {
        tabId: 2,
        to: "leavebalance",
        title: "LEAVE.TITLES.LEAVE_BALANCE",
        icon: <AccountBalanceWallet />,
    },
    // {
    //     tabId: 3,
    //     to: "leavetypes",
    //     title: "LEAVE.TITLES.LEAVE_TYPES",
    //     icon: <DynamicFeed />,
    // },
    {
        tabId: 4,
        to: "leavepolicies",
        title: "LEAVE.TITLES.LEAVE_POLICIES",
        icon: <PolicyIcon />,
    },
    {
        tabId: 5,
        to: "work-from-home",
        title: "Work from home",
        icon: <HomeWork />,
    },
];

export const LeaveManagementTabs = () => {
    const { formatMessage: i } = useIntl();
    const navigate = useNavigate();
    return (
        <Stack spacing={1} className="flex-grow-1">
            <Card className="tab-container d-flex flex-row">
                {tabsRoutes.map((tab) => {
                    return (
                        <Box
                            component="div"
                            key={tab.tabId}
                            className={clsx("tab-box", {
                                tab_active: checkIsActive(location.pathname, tab.to),
                            })}
                            onClick={() => navigate(tab.to)}
                            sx={{ color: "text.secondary" }}
                        >
                            {tab.icon}
                            {tab.title.startsWith("LEAVE.") ? i({ id: tab.title }) : tab.title}
                        </Box>
                    );
                })}
            </Card>
            <Box component="div" className="d-flex flex-column flex-grow-1">
                <Outlet />
            </Box>
        </Stack>
    )
}
