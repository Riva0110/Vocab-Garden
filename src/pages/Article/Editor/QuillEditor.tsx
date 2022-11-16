import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";

interface Props {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

const Editor = styled(ReactQuill)`
  height: calc(100vh - 295px);
  background-color: rgba(255, 255, 255, 0.7);
`;

export default function QuillEditor({ content, setContent }: Props) {
  return (
    <Editor
      theme="snow"
      value={content}
      onChange={setContent}
      placeholder="Read More, Learn More and Grow More!"
    ></Editor>
  );
}
