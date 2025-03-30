/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FC, createContext, useContext, useEffect, useState } from "react";
import { WithChildren } from "../../helpers";

export interface PageLink {
  title: string;
  path: string;
  isActive: boolean;
  isSeparator?: boolean;
}

export interface PageDataContextModel {
  pageTitle?: string;
  setPageTitle: (_title: string) => void;
  pageBreadcrumbs?: Array<PageLink>;
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => void;
}

const PageDataContext = createContext<PageDataContextModel>({
  setPageTitle: (_title: string) => {},
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => {},
});

const PageDataProvider: FC<WithChildren> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageDescription, setPageDescription] = useState<string>("");
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Array<PageLink>>([]);
  const value: PageDataContextModel = {
    pageTitle,
    setPageTitle,
    pageBreadcrumbs,
    setPageBreadcrumbs,
  };
  return (
    <PageDataContext.Provider value={value}>
      {children}
    </PageDataContext.Provider>
  );
};

function usePageData() {
  return useContext(PageDataContext);
}

type Props = {
  description?: string;
  breadcrumbs?: Array<PageLink>;
};

const PageTitle: FC<Props & WithChildren> = ({
  children,
  breadcrumbs,
}) => {
  const { setPageTitle, setPageBreadcrumbs } =
    usePageData();
  useEffect(() => {
    if (children) {
      setPageTitle(children.toString());
    }
    return () => {
      setPageTitle("");
    };
  }, [children]);

  useEffect(() => {
    if (breadcrumbs) {
      setPageBreadcrumbs(breadcrumbs);
    }
    return () => {
      setPageBreadcrumbs([]);
    };
  }, [breadcrumbs]);

  return <></>;
};



export {  PageTitle, PageDataProvider, usePageData };
