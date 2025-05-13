import { Link } from "react-router-dom";
import clsx from "clsx";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import { useLayout } from "../../core";
import { MutableRefObject, useEffect, useRef } from "react";
import { ToggleComponent } from "../../../assets/ts/components";
import { Avatar, Grid, Stack } from "@mui/material";

type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>;
};

const SidebarLogo = (props: PropsType) => {
  const { config } = useLayout();
  const toggleRef = useRef<HTMLDivElement>(null);

  const appSidebarDefaultMinimizeDesktopEnabled =
    config?.app?.sidebar?.default?.minimize?.desktop?.enabled;
  const appSidebarDefaultCollapseDesktopEnabled =
    config?.app?.sidebar?.default?.collapse?.desktop?.enabled;
  const toggleType = appSidebarDefaultCollapseDesktopEnabled
    ? "collapse"
    : appSidebarDefaultMinimizeDesktopEnabled
      ? "minimize"
      : "";
  const toggleState = appSidebarDefaultMinimizeDesktopEnabled ? "active" : "";
  const appSidebarDefaultMinimizeDefault =
    config.app?.sidebar?.default?.minimize?.desktop?.default;

  useEffect(() => {
    setTimeout(() => {
      const toggleObj = ToggleComponent.getInstance(
        toggleRef.current!
      ) as ToggleComponent | null;

      if (toggleObj === null) {
        return;
      }

      // Add a class to prevent sidebar hover effect after toggle click
      toggleObj.on("kt.toggle.change", function () {
        // Set animation state
        props.sidebarRef.current!.classList.add("animating");

        // Wait till animation finishes
        setTimeout(function () {
          // Remove animation state
          props.sidebarRef.current!.classList.remove("animating");
        }, 300);
      });
    }, 600);
  }, [toggleRef, props.sidebarRef]);

  return (
    <Stack alignItems="center" className="sidebar_logo">
      <Link to="/">
        <Avatar
          alt="Logo"
          src={toAbsoluteUrl("media/logos/default.svg")}
        // className="app-sidebar-logo-default theme-light-show"
        />
      </Link>

      {(appSidebarDefaultMinimizeDesktopEnabled ||
        appSidebarDefaultCollapseDesktopEnabled) && (
          <Grid
            item
            ref={toggleRef}
            id="kt_app_sidebar_toggle"
            className={clsx(
              "app-sidebar-toggle btn btn-icon  btn-sm btn-color-muted btn-active-color-primary w-30px position-absolute top-collapse start-100 translate-middle rotate",
              { active: appSidebarDefaultMinimizeDefault }
            )}
            data-kt-toggle="true"
            data-kt-toggle-state={toggleState}
            data-kt-toggle-target="body"
            data-kt-toggle-name={`app-sidebar-${toggleType}`}
            sx={{ visibility: { xs: "hidden", md: "visible" } }}
          >
            <KTIcon iconName="black-left-line" className="fs-3 rotate-180 ms-1" />
          </Grid>
        )}
    </Stack>
  );
};

export { SidebarLogo };
