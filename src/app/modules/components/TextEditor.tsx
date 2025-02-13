import { PropTypes } from "@mui/material";
import { FC, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type PropsType = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const TextEditor: FC<PropsType> = ({ value, setValue }) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const handleChange = () => {
    setValue(debouncedValue);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleChange();
    }, 1500);
    return () => clearTimeout(timeoutId);
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
      theme="snow"
      value={debouncedValue}
      onChange={setDebouncedValue}
      formats={formats}
      modules={modules}
      placeholder="Type Here..."
    />
  );
};

export default TextEditor;
