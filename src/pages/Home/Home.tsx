import styled from "styled-components";
import banner from "./banner.webp";
import next from "./next.png";
import VocabDetails from "../../components/VocabDetails";
import { KeywordContext } from "../../context/KeywordContext";
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

const Intro = styled.div`
  min-height: 30px;
  text-decoration: none;
  text-shadow: white 0.1em 0.1em 0.2em;
  color: #1c1b1b;
  margin-left: -8px;
`;

const BeMember = styled.div`
  height: 30px;
  text-decoration: none;
  text-shadow: white 0.1em 0.1em 0.3em;
  color: #405a54;
  margin-left: -8px;
  font-weight: 600;
`;

const IntroNav = styled(Link)`
  height: 30px;
  line-height: 30px;
  text-decoration: none;
  text-shadow: white 0.1em 0.1em 0.2em;
  color: #1c1b1b;
  margin-left: -8px;
`;

const NextImg = styled.img`
  width: 15px;
  height: 15px;
`;

export default function Home() {
  const { setKeyword } = useContext(KeywordContext);
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
          <Intro>【Search】double click or select any words!</Intro>
          <br />
          <BeMember>
            &nbsp;&nbsp;Be a member and enjoy more!&nbsp;&nbsp;
          </BeMember>
          <Intro>
            【Read】look up unfamiliar words while reading! &nbsp;&nbsp;
            <IntroNav to={"/articles"}>
              &nbsp;&nbsp;
              <NextImg src={next} alt={next} />
            </IntroNav>
          </Intro>
          <Intro>
            【Review】save word cards and review!&nbsp;&nbsp;
            <IntroNav to={"/vocabbook"}>
              &nbsp;&nbsp;
              <NextImg src={next} alt={next} />
            </IntroNav>
          </Intro>
          <Intro>
            【Battle】invite your friends to review words with you. Have
            fun!&nbsp;&nbsp;
            <IntroNav to={"/vocabbook"}>
              &nbsp;&nbsp;
              <NextImg src={next} alt={next} />
            </IntroNav>
          </Intro>
          <Intro>
            【Achieve】review everyday and enrich your Vocab Garden!&nbsp;&nbsp;
            <IntroNav to={"/profile"}>
              &nbsp;&nbsp;
              <NextImg src={next} alt={next} />
            </IntroNav>
          </Intro>
        </IntroWrapper>
      </BannerWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
