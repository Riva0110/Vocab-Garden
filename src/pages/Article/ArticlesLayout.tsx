import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet, Navigate } from "react-router-dom";
import plant from "./plant.webp";
import plant2 from "./plant2.webp";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 30px;
  a {
    color: #60827a !important;
  }
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

const Img = styled.img`
  position: fixed;
  right: 0;
  width: 400px;
  opacity: 0.5;
  @media screen and (max-width: 601px) {
    display: none;
  }
`;

const Img2 = styled.img`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 400px;
  opacity: 0.4;
`;

const OutletWrapper = styled.div`
  width: calc((100% - 30px) / 2);
  height: calc(100vh - 160px);
  z-index: 1;
  @media screen and (max-width: 601px) {
    width: calc((100% - 20px));
    margin: 0 auto;
    padding: auto 10px;
  }
`;

export default function ArticlesLayout() {
  const { isLogin } = useContext(AuthContext);
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
