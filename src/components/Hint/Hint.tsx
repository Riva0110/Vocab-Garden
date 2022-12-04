import { useState } from "react";
import styled from "styled-components";
import { useFloating, flip, shift } from "@floating-ui/react-dom";

const Wrapper = styled.div``;

const QuestionMark = styled.div`
  width: 20px;
  height: 20px;
  font-size: 14px;
  color: #607973;
  border-radius: 25px;
  border: 1px solid #607973;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
`;

const Message = styled.div`
  color: #607973;
  min-width: 300px;
  z-index: 9999;
  border: 1px solid #607973;
  border-radius: 10px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  white-space: pre-line;
  font-size: 14px;
`;

function Hint({ children }: { children: React.ReactNode }) {
  const [isShown, setIsShown] = useState(false);
  const { x, y, reference, floating, strategy } = useFloating({
    middleware: [flip(), shift({ padding: 5 })],
  });

  return (
    <Wrapper
      onMouseOver={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      <QuestionMark ref={reference}>?</QuestionMark>
      {isShown && (
        <Message
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "max-content",
          }}
        >
          {children}
        </Message>
      )}
    </Wrapper>
  );
}

export default Hint;
