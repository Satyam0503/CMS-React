import { Box, useTheme } from "@mui/material";
import DocViewer, { DocViewerRenderers, IDocument } from "react-doc-viewer";

interface DocViewerProps {
  documents: IDocument[];
}

const DocumentViewer = (props: DocViewerProps) => {
  const { palette } = useTheme();
  const { documents } = props;
  return (
    <Box>
      <DocViewer
        documents={documents}
        pluginRenderers={DocViewerRenderers}
        config={
          {
            // header: {
            //  disableHeader: false,
            //  disableFileName: false,
            //  retainURLParams: false
            // }
          }
        }
        style={{ height: 500 }}
        className="w-100"
        theme={{
          primary: palette.primary.lighter,
          secondary: palette.primary.main,
          tertiary: "#5296d899",
          text_primary: "#050303ff",
          text_secondary: "#5296d8",
          text_tertiary: "#00000099",
          disableThemeScrollbar: false,
        }}
      />
    </Box>
  );
};

export { DocumentViewer };
