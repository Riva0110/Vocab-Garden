import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
`;

export default function VocabBookLayout() {
  return (
    <Wrapper>
      <Outlet />
      <VocabDetails />
    </Wrapper>
  );
}
