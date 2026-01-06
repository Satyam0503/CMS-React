import { Card, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";

import PoliciesFoldersListing from "./components/PoliciesFoldersListing";
import AddNewPolicyForm from "./components/AddNewPolicyForm";
import { AddPolicyModel, PolicyFolderStructure } from "./models";

const initaialValues: AddPolicyModel = {
  policyName: "",
  description: "",
  isActive: false,
  roles: [],
  departments: [],
};

function Policies() {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();

  const [addingPolicyFolder, setAddingPolicyFolder] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  function handleRefresh() {
    setRefresh(!refresh);
  }

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.POLICIES" }));
  }, []);

  function handleCreateButtonClicked() {
    setOpen(true);
  }

  function handleCloseCreatePolicy() {
    setOpen(false);
  }

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
}

export default Policies;
