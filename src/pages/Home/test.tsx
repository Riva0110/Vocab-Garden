import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  padding: 20px;
`;

interface ObjectInterface {
  type: number;
  content: string[];
}

interface Props {
  hey: ObjectInterface;
  setHey: React.Dispatch<React.SetStateAction<ObjectInterface>>;
}

export default function Test(props: Props) {
  return (
    <Wrapper>
      <p>{props.hey.content[0]}</p>
    </Wrapper>
  );
}
