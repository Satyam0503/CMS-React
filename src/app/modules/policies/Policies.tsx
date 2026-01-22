import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";

import PoliciesFoldersListing from "./components/PoliciesFoldersListing";
import AddNewPolicyForm from "./components/AddNewPolicyForm";
import { AddPolicyModel } from "./models";

const initaialValues: AddPolicyModel = {
  policyName: "",
  description: "",
  isActive: false,
  roles: [],
  departments: [],
};

export const Policies = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const [addingPolicyFolder] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  function handleRefresh() {
    setRefresh(!refresh);
  }

  function handleCreateButtonClicked() {
    setOpen(true);
  }

  function handleCloseCreatePolicy() {
    setOpen(false);
  }

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.POLICIES" }));
  }, []);

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          height: "100%",
        }}
      >
        <PoliciesFoldersListing
          addingPolicyFolder={addingPolicyFolder}
          handleCloseCreatePolicy={handleCloseCreatePolicy}
          refresh={refresh}
          handleRefresh={handleRefresh}
          handleClick={handleCreateButtonClicked}
        />
        {open && (
          <AddNewPolicyForm
            open={open}
            handleClose={handleCloseCreatePolicy}
            initialValues={initaialValues}
            isEdit={false}
            handleRefresh={handleRefresh}
          />
        )}
      </Stack>
    </>
  );
};
