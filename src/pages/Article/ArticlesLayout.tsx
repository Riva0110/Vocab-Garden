import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet, Navigate } from "react-router-dom";
import plant from "./plant.png";
import plant2 from "./plant2.png";
import { useContext } from "react";
import { authContext } from "../../context/authContext";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 30px;
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
  width: calc((100% - 30px) / 2);
  z-index: 1;
`;

export default function ArticlesLayout() {
  const { isLogin } = useContext(authContext);
  return isLogin ? (
    <Wrapper>
      <Img src={plant} alt="plant" />
      <Img2 src={plant2} alt="plant" />
      <OutletWrapper>
        <Outlet />
      </OutletWrapper>
      <VocabDetails />
    </Wrapper>
  ) : (
    <Navigate replace to="/profile" />
  );
}
