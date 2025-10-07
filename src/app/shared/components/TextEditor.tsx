import { FC, memo, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDebounce } from "../../hooks/useDebounce";
import { removeUnwantedString, sanitizeHtmlContent } from "../../../utils/common";
import { useIntl } from "react-intl";
import { useTheme } from "@mui/material";
import clsx from "clsx";
// import "../../../_themes/assets/sass/core/components/_text_editor.scss";

type PropsType = {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string
};

const TextEditor: FC<PropsType> = memo(({ value, setValue, placeholder = "PLACEHOLDER.TYPE_HERE" }) => {
  const [textValue, setTextValue] = useState(value);
  const debouncedValue = useDebounce(textValue);
  const { formatMessage: i } = useIntl();
  const themeMode = useTheme().palette.mode;

  // Create a ref to hold the ReactQuill instance
  const quillRef = useRef<ReactQuill | null>(null);


  useEffect(() => {
    const sanitizedString = sanitizeHtmlContent(removeUnwantedString(debouncedValue));
    if (sanitizedString.trim().length > 0) {
      setValue(sanitizedString);
    }
  }, [debouncedValue]);

  const modules = {
    toolbar: {
      container: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "blockquote"],
        [{ color: [] }],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: true,
    },
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "clean",
  ];

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={textValue}
      onChange={setTextValue}
      formats={formats}
      modules={modules}
      placeholder={i({ id: placeholder })}
      className={clsx("text-editor", { dark: themeMode === "dark", light: themeMode === "light" })}

    // className={clsx("text-editor", { dark: themeMode === "dark", light: themeMode === "light" })}
    />
  );
});

export default TextEditor;
