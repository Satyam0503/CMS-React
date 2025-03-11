import { FC, memo, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDebounce } from "../../hooks/useDebounce";

type PropsType = {
  value: string;
  setValue: (value: string) => void;
};

const TextEditor: FC<PropsType> = memo(({ value, setValue }) => {
  const [textValue, setTextValue] = useState(value);
  const debouncedValue = useDebounce(textValue);
  useEffect(() => {
    setValue(debouncedValue);
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
      value={textValue}
      onChange={setTextValue}
      formats={formats}
      modules={modules}
      placeholder="Type Here ..."
    />
  );
});

export default TextEditor;
