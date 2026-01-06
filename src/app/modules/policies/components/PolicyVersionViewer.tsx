import React from "react";
import { PolicyResponseStructure } from "../models";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import DocViewer from "react-doc-viewer";

type Props = {
  openSelectedPolicy: boolean;
  handleClose: () => void;
  selectedPolicyVersion: PolicyResponseStructure | null;
};

export default function PolicyVersionViewer(props: Props) {
  return (
    <>
      {props.selectedPolicyVersion && props.openSelectedPolicy && (
        <CustomisedModal
          open={props.openSelectedPolicy}
          handleClose={() => props.handleClose()}
          title={props.selectedPolicyVersion.versionName}
        >
          <DocViewer
            documents={[{ uri: props.selectedPolicyVersion.policyDocUrl }]}
          />
        </CustomisedModal>
      )}
    </>
  );
}
