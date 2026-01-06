import { Stack, Typography } from "@mui/material";
import { FC, useState } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
import { DocumentCallback } from "react-pdf/dist/esm/shared/types.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { CustomIconButton } from "./CustomIconButton";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { ResumeError } from "../../modules/recruitment/applications/components/ResumeError";
import { ResumeLoader } from "../../modules/recruitment/applications/components/ResumeLoader";
import { useIntl } from "react-intl";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
}
export const PdfViewer: FC<Props> = ({ pdfUrl }) => {
  const { formatMessage: i } = useIntl();
  const [showButton, setShowButton] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  function handleDocumentLoadSuccess(pdfjs: DocumentCallback) {
    if (pdfjs.numPages > 1) {
      setShowButton(true);
    }
    setTotalPages(pdfjs.numPages);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(currentPage + page);
  };

  return (
    <Stack
      sx={{
        borderWidth: 1,
        borderColor: 'text.secondary',
        borderStyle: "solid",
        borderRadius: 1,
      }}
    >
      <Stack
        direction="column"
        sx={{
          padding: 2,
          borderBottomColor: "text.secondary",
          borderBottomStyle: "solid",
          borderBottomWidth: 1
        }}
      >
        <Typography variant="h6">
          {i({ id: "APPLICATION.RESUME_PREVIEW" })}
        </Typography>
      </Stack>
      <Stack sx={{ position: "relative" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={<ResumeLoader />}
          error={<ResumeError />}
          noData={<ResumeError />}
        >
          <Page pageNumber={currentPage} className="pdf_viewer" />
        </Document>
        {showButton && (
          <Stack
            direction={"row"}
            spacing={2}
            sx={{
              width: "100%",
              backgroundColor: "background.header",
              position: "absolute",
              zIndex: 10,
              left: "0",
              bottom: "0",
              display: "flex",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <CustomIconButton
              icon={<NavigateBefore />}
              tooltip={i({ id: "TOOLTIP.PREVIOUS" })}
              disabled={currentPage === 1}
              handleClick={() => handlePageChange(-1)}
            />
            <CustomIconButton
              icon={<NavigateNext />}
              tooltip={i({ id: "TOOLTIP.NEXT" })}
              disabled={currentPage === totalPages}
              handleClick={() => handlePageChange(1)}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
