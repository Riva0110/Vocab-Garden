import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";

const Wrapper = styled.div`
  display: flex;
`;
const Main = styled.div`
  width: 50vw;
`;

export default function Home() {
  return (
    <Wrapper>
      <Main />
      <VocabDetails />
    </Wrapper>
  );
}
