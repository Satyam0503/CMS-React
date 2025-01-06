import React from "react";
import ReactQuill from "react-quill";
const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  //'align',
  "list",
  // 'indent',
  // 'size',
  "header",
  "link",
  // 'image',
  // 'video',
  "color",
  "background",
  "clean",
];

const STANDARD_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    // ['blockquote', 'code-block'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    // [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    //[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    //[{ direction: 'rtl' }], // text direction

    // [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    // [{ font: [] }],

    ["clean"], // remove formatting button
  ],
};

type Props = {
  theme?: string;
  value?: string;
  onChange?: (val: any) => void;
  placeholder?: string;
  helperText?: any;
  error: boolean;
  formats?: any;
  modules?: any;
  className?: string;
};

export const TextEditor = (props: Props) => {
  return (
    <ReactQuill
      theme={"snow"}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      helperText={props.helperText}
      error={props.error}
      formats={formats}
      modules={STANDARD_MODULES}
    />
  );
};
