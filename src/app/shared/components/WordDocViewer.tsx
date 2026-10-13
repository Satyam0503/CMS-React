import { Box, useTheme } from "@mui/material";
import DocViewer, { DocViewerRenderers, IDocument } from "react-doc-viewer";

interface DocViewerProps {
  documents: IDocument[];
}

const WordDocViewer = (props: DocViewerProps) => {
  const { palette } = useTheme();
  const { documents } = props;
  return (
    <Box sx={{ height: "100%", minHeight: 0 }}>
      <DocViewer
        documents={documents}
        pluginRenderers={DocViewerRenderers}
        config={
          {
            header: {
              disableHeader: false,
              disableFileName: true,
              retainURLParams: false
            }
          }
        }
        style={{ height: "100%" }}
        className="w-100"
        theme={{
          primary: palette.primary.lighter,
          secondary: palette.primary.main,
          disableThemeScrollbar: false,
        }}
      />
    </Box>
  );
};

export { WordDocViewer };
