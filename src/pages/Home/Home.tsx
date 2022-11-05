import { useState } from "react";
import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import Test from "./test";

const Wrapper = styled.div`
  display: flex;
  padding: 20px;
`;
const Main = styled.div`
  width: 50vw;
`;

interface ObjectInterface {
  type: number;
  content: string[];
}

export default function Home() {
  const [hey, setHey] = useState<ObjectInterface>({
    type: 5,
    content: ["hi", "hello"],
  });
  return (
    <Wrapper>
      <Main />
      <Test hey={hey} setHey={setHey} />
      <VocabDetails />
    </Wrapper>
  );
}
