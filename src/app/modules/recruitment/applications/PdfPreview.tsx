import {  Stack, Typography } from "@mui/material";
import { FC, useState } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
import { DocumentCallback } from "react-pdf/dist/esm/shared/types.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { CustomIconButton } from "../../components/CustomIconButton";
import {  NavigateBefore, NavigateNext } from "@mui/icons-material";
import { colors } from "../../theme/MuiTheme";
import { ResumeError } from "./ResumeError";
import { ResumeLoader } from "./ResumeLoader";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Props {
  pdfUrl: string;
}

export const PdfPreview: FC<Props> = ({ pdfUrl }) => {
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
        border: `1px solid ${colors.alpha.neutral[200]}`,
        borderRadius: ".5rem",
      }}
    >
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        sx={{
          padding: "1rem !important",
          alignItems: "center",
          borderBottom: `1px solid ${colors.alpha.neutral[200]}`,
        }}
      >
        <Typography variant="h6">Resume Preview</Typography>
      </Stack>
      <Stack
        sx={{
          position: "relative",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={<ResumeLoader />}
          error={<ResumeError />}
          noData={<ResumeError/>}
        >
          <Page pageNumber={currentPage} className="pdf_viewer" />
        </Document>
        {showButton && (
          <Stack
            direction={"row"}
            spacing={2}
            sx={{
              width: "100%",
              backgroundColor: colors.alpha.white[500],
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
              tooltip="Previous"
              disabled={currentPage === 1}
              handleClick={() => handlePageChange(-1)}
            />
            <CustomIconButton
              icon={<NavigateNext />}
              tooltip="Next"
              disabled={currentPage === totalPages}
              handleClick={() => handlePageChange(1)}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
