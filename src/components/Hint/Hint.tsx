import { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
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
  position: absolute;
  top: 20%;
  left: 20%;
  z-index: 10;
  border: 1px solid #607973;
  border-radius: 10px;
  padding: 20px;
  display: ${(props: Props) => (props.isShown ? "flex" : "none")};
  background-color: #fff;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  white-space: pre-line;
`;

interface Props {
  isShown: boolean;
}

function Hint({ children }: { children: string }) {
  const [isShown, setIsShown] = useState(false);
  return (
    <>
      <Wrapper
        onMouseOver={() => setIsShown(true)}
        onMouseLeave={() => setIsShown(false)}
      >
        ?
      </Wrapper>
      <Message isShown={isShown}>{children}</Message>
    </>
  );
}

export default Hint;
