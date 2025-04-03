/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { FC, createContext, useContext, useEffect, useState } from "react";
import { WithChildren } from "../../helpers";

export interface PageDataContextModel {
  pageTitle?: string;
  setPageTitle: (_title: string) => void;
}

const PageDataContext = createContext<PageDataContextModel>({
  setPageTitle: (_title: string) => {},
});

const PageDataProvider: FC<WithChildren> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState<string>("");
  const value: PageDataContextModel = {
    pageTitle,
    setPageTitle
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

export {  PageDataProvider, usePageData };
