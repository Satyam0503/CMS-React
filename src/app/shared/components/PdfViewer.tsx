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
      }}
    >
      {showButton && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: "100%",
            backgroundColor: "background.header",
            justifyContent: "end",
            padding: 1,
            borderBlockEndWidth: 1,
            borderBlockEndColor: 'text.secondary',
            borderBlockEndStyle: "solid",
            alignItems: 'center'
          }}
        >
          <Stack>
            <Typography>{i({ id: "COMMON.PAGE_NO" }, { currentPage, totalPages })}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
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
        </Stack>
      )
      }
      <Stack>
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={<ResumeLoader />}
          error={<ResumeError />}
          noData={<ResumeError />}
        >
          <Page pageNumber={currentPage} className="pdf_viewer" />
        </Document>
      </Stack>
    </Stack >
  );
};
