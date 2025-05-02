import {
  Stack,
} from "@mui/material";
import { FC } from "react";

import { CompanyLocalization } from "./CompanyLocalization";
import { CompanyLogo } from "./CompanyLogo";
import { CompanyInfoProvider } from "./CompanyInfoProvider";

export const CompanyInfo: FC = () => {
  return (
    <>
      <CompanyInfoProvider>
        <Stack spacing={1}>
          <CompanyLocalization />
          <CompanyLogo />
        </Stack>
      </CompanyInfoProvider>
    </>
  );
};
