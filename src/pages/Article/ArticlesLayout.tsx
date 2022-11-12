import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 20px;
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

const OutletWrapper = styled.div`
  width: 50vw;
`;

export default function ArticlesLayout() {
  return (
    <Wrapper>
      <OutletWrapper>
        <Outlet />
      </OutletWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
