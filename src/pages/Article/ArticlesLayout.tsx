import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet } from "react-router-dom";
import plant from "./plant.png";
import plant2 from "./plant2.png";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 20px;
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

const Img = styled.img`
  position: absolute;
  right: 0;
  width: 400px;
`;

const Img2 = styled.img`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 400px;
`;

const OutletWrapper = styled.div`
  width: 50vw;
  z-index: 1;
`;

export default function ArticlesLayout() {
  return (
    <Wrapper>
      <Img src={plant} alt="plant" />
      <Img2 src={plant2} alt="plant" />
      <OutletWrapper>
        <Outlet />
      </OutletWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
