import "../../../utils/promiseWithResolvers";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
import { DocumentCallback } from "react-pdf/dist/esm/shared/types.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { CustomIconButton } from "./C_IconButton";
import { ErrorOutline, InsertDriveFileOutlined, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { getBinaryRequest } from "../../../server/axios";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
}
export const PdfViewer: FC<Props> = ({ pdfUrl }) => {
  const { formatMessage: i } = useIntl();
  const [showButton, setShowButton] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>(pdfUrl);
  const [protectedResumeFailed, setProtectedResumeFailed] = useState(false);

  useEffect(() => {
    if (!pdfUrl) {
      setResolvedPdfUrl("");
      setProtectedResumeFailed(false);
      return;
    }
    if (!pdfUrl.includes("/api/Applicants/Resume/")) {
      setResolvedPdfUrl(pdfUrl);
      return;
    }
    let active = true;
    let objectUrl: string | null = null;
    setProtectedResumeFailed(false);
    setResolvedPdfUrl("");
    getBinaryRequest(pdfUrl)
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setResolvedPdfUrl(objectUrl);
      })
      .catch(() => {
        if (!active) return;
        setResolvedPdfUrl("");
        setProtectedResumeFailed(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl]);

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
        {!pdfUrl ? (
          <DocEmptyState />
        ) : resolvedPdfUrl ? (
          <Document
            file={resolvedPdfUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={<DocLoading />}
            error={<DocLoadError />}
            noData={<DocLoadError />}
          >
            <Page pageNumber={currentPage} className="pdf_viewer" />
          </Document>
        ) : protectedResumeFailed ? <DocLoadError /> : <DocLoading />}
      </Stack>
    </Stack >
  );
};


const DocLoading = () => {
  return (
    <Box sx={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress />
    </Box>
  )
}


const DocEmptyState = () => {
  return (
    <Box
      sx={{
        height: "360px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "action.hover",
        borderRadius: "12px",
        p: 3,
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
        <InsertDriveFileOutlined sx={{ fontSize: "3rem", color: "text.secondary", opacity: 0.6 }} />
        <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
          No Resume Attached
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
          This applicant record does not have a PDF resume document uploaded.
        </Typography>
      </Stack>
    </Box>
  );
};


const DocLoadError = () => {
  const { formatMessage: i } = useIntl();
  return (
    <Box
      sx={{
        height: "400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={1} sx={{
        alignItems: "center"
      }}>
        <ErrorOutline color="error" sx={{ fontSize: "3rem" }} />
        <Typography variant="h6">{i({ id: "ERROR.DOC_LOAD_FAILED" })}</Typography>
      </Stack>
    </Box>
  );
};
