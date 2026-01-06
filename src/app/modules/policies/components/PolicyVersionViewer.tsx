import React from "react";
import { PolicyVersion } from "../models";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { PdfViewer } from "../../../shared/components/PdfViewer";

type Props = {
  open: boolean;
  handleClose: () => void;
  policyVersion: PolicyVersion;
};

export default function PolicyVersionViewer(props: Props) {
  const documentType = props.policyVersion.policyDocUrl.split(".").pop();
  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={props.policyVersion.versionName}
      maxWidth="lg"
    >
      {
        documentType && documentType === "pdf" &&
        <PdfViewer pdfUrl={props.policyVersion.policyDocUrl} />
      }
      {
        (documentType && documentType === "doc") || (documentType && documentType === 'docx') &&
        <DocViewer
          documents={[{ uri: props.policyVersion.policyDocUrl }]}
          pluginRenderers={DocViewerRenderers}
        />
      }
    </CustomisedModal>
  );
}
