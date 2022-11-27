import styled from "styled-components";
import banner from "./banner.webp";
import VocabDetails from "../../components/VocabDetails";
import { keywordContext } from "../../context/keywordContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 30px;
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

const BackgroundImg = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-image: url(${banner});
  background-size: cover;
  opacity: 0.6;
`;

const BannerWrapper = styled.div`
  width: calc((100% - 30px) / 2);
  position: relative;
  padding-left: 50px;
  @media screen and (max-width: 601px) {
    width: calc(100vw - 40px);
    padding-left: 0px;
  }
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  margin-top: 100px;
  margin-bottom: 80px;
  color: black;
  @media screen and (max-width: 601px) {
    margin-top: 10px;
    margin-bottom: 30px;
    font-size: 25px;
  }
`;

const IntroWrapper = styled.div`
  color: #292727;
`;

const QuickStart = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border: 1px solid lightgray;
  width: 150px;
  text-align: center;
  background-color: #fff;
`;

const Intro = styled(Link)`
  height: 30px;
  text-decoration: none;
  text-shadow: white 0.1em 0.1em 0.2em;
  color: #1c1b1b;
  margin-left: -8px;
  &:hover {
    background-color: #ffffff77;
    transition: 0.6s;
  }
`;

export default function Home() {
  const { setKeyword } = useContext(keywordContext);
  function getSelectedText() {
    if (window.getSelection) {
      const txt = window.getSelection()?.toString();
      if (typeof txt !== "undefined") setKeyword(txt);
    }
  }

  return (
    <Wrapper>
      <BackgroundImg />
      <BannerWrapper onClick={() => getSelectedText()}>
        <Title>
          Boost your English reading and vocabulary skills!
          <br />
        </Title>
        <IntroWrapper>
          <QuickStart>Quick Start</QuickStart>
          <Intro to={"/"}>【Search】 double click or select any words!</Intro>
          <br />
          <Intro to={"/articles"}>
            【Read】 look up unfamiliar words while reading!
          </Intro>
          <br />
          <Intro to={"/vocabbook"}>
            【Review】 save word cards and review!
          </Intro>
          <br />
          <Intro to={"/vocabbook"}>
            【Battle】 invite your friends to review words with you. Have fun!
          </Intro>
          <br />
          <Intro to={"/profile"}>
            【Achieve】 review everyday and enrich your Vocab Garden!
          </Intro>
        </IntroWrapper>
      </BannerWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
