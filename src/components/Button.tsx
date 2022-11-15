import styled from "styled-components";

const BUTTON_TYPE = {
  primary: "primary",
  secondary: "secondary",
};

const Wrapper = styled.button`
  width: 100px;
  height: 25px;
  background-color: ${(props: Props) =>
    props.btnType === BUTTON_TYPE.primary ? "#607973" : "white"};
  color: ${(props: Props) =>
    props.btnType === BUTTON_TYPE.primary ? "white" : "#607973"};
  border: ${(props: Props) =>
    props.btnType === BUTTON_TYPE.primary ? "none" : "1px solid #607973"};
  cursor: pointer;
`;

interface Props {
  children: string;
  btnType: string;
}

function Button({ children, btnType }: Props) {
  return <Wrapper btnType={btnType}>{children}</Wrapper>;
}

export default Button;
