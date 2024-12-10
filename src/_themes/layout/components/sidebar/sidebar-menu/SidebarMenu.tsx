import { toAbsoluteUrl } from "../../../../helpers";
import { SidebarMenuMain } from "./SidebarMenuMain";
import { Avatar, Grid } from "@mui/material";
import { Stack } from "react-bootstrap";

const SidebarMenu = () => {
  return (
    <div className="app-sidebar-menu overflow-hidden flex-column-fluid">
      <div
        id="kt_app_sidebar_menu_wrapper"
        className="app-sidebar-wrapper hover-scroll-overlay-y my-5"
        data-kt-scroll="true"
        data-kt-scroll-activate="true"
        data-kt-scroll-height="auto"
        data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
        data-kt-scroll-wrappers="#kt_app_sidebar_menu"
        data-kt-scroll-offset="5px"
        data-kt-scroll-save-state="true"
      >
        <Stack>
          <Avatar
            alt=""
            src={toAbsoluteUrl("media/avatars/300-6.jpg")}
            sx={{ width: 128, height: 128 }}
          />
        </Stack>
        <div
          className="menu menu-column menu-rounded menu-sub-indention px-3"
          id="#kt_app_sidebar_menu"
          data-kt-menu="true"
          data-kt-menu-expand="false"
        >
          <SidebarMenuMain />
        </div>
      </div>
    </div>
  );
};

export { SidebarMenu };
