import styled from "styled-components";

const BUTTON_TYPE = {
  primary: "primary",
  secondary: "secondary",
};

const Wrapper = styled.button`
  min-width: 100px;
  min-height: 25px;
  padding-left: 10px;
  padding-right: 10px;
  background-color: ${(props: Props) =>
    props.btnType === BUTTON_TYPE.primary ? "#607973" : "white"};
  color: ${(props: Props) =>
    props.btnType === BUTTON_TYPE.primary ? "white" : "#607973"};
  border: 1px solid #607973;
  cursor: pointer;
  @media screen and (max-width: 601px) {
    min-width: 0px;
  }
`;

interface Props {
  children: string;
  btnType: string;
}

function Button({ children, btnType }: Props) {
  return <Wrapper btnType={btnType}>{children}</Wrapper>;
}

export default Button;
