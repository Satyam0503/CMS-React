import React, { ReactNode } from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { checkIsActive,  WithChildren } from "../../../../helpers";
import { useLayout } from "../../../core";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
  fontIcon?: string;
  hasBullet?: boolean;
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { app } = config;
    
  return (
    <div
      className={clsx("menu-item", { "here show": isActive }, "menu-accordion")}
      data-kt-menu-trigger="click"
    >
      <span className="menu-link">
        <span className="menu-icon">{icon}</span>
        <span className="menu-title">{title}</span>
        <span className="menu-arrow"></span>
      </span>
      <div
        className={clsx("menu-sub menu-sub-accordion", {
          "menu-active-bg": isActive,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export { SidebarMenuItemWithSub };
