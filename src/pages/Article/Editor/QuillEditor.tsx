import React, { useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

export default function QuillEditor({ content, setContent }: Props) {
  useEffect(() => {});

  return <ReactQuill theme="snow" value={content} onChange={setContent} />;
}
