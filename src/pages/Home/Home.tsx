import styled from "styled-components";
import banner from "./banner.webp";
import VocabDetails from "../../components/VocabDetails";
import { keywordContext } from "../../context/keywordContext";
import { useContext } from "react";

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
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  margin-top: 50px;
  margin-bottom: 50px;
  color: black;
`;

const Author = styled.span`
  font-size: 20px;
  font-weight: 200;
`;

const IntroWrapper = styled.div`
  color: #292727;
  padding: 20px;
`;

const QuickStart = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
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
          The best way to predict the future
          {window.innerWidth > 601 && <br />} is to create it. <br />
          <Author>– Abraham Lincoln</Author>
        </Title>
        <IntroWrapper>
          <QuickStart>Quick Start</QuickStart>
          <div>▶ Search: double click or select any words!</div>
          <div>▶ Read (smoothly): look up unfamilier words while reading!</div>
          <div>▶ Review: save word cards and review!</div>
          <div>
            ▶ Battle: invite your friends to review words with you. Have fun!
          </div>
          <div>▶ Achieve: review everyday and enrich your Vocab Garden!</div>
        </IntroWrapper>
      </BannerWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
