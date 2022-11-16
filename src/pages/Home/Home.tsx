import styled from "styled-components";
import banner from "./banner.png";
import banner2 from "./banner2.jpg";
import VocabDetails from "../../components/VocabDetails";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 30px;
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

const BannerWrapper = styled.div`
  width: calc((100% - 30px) / 2);
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

const Banner = styled.img`
  position: fixed;
  left: 20px;
  bottom: 100px;
  height: 35%;
`;

const Title = styled.div`
  position: fixed;
  left: 10%;
  top: 50%;
  font-size: 30px;
  font-weight: 600;
  color: black;
`;

const Author = styled.span`
  font-size: 20px;
  font-weight: 200;
`;

export default function Home() {
  return (
    <Wrapper>
      <BackgroundImg />
      {/* <Banner src={banner2} alt="banner-plant"></Banner> */}
      <Title>
        The best way to predict the future
        <br /> is to create it. <br />
        <Author>– Abraham Lincoln</Author>
      </Title>
      <BannerWrapper />
      <VocabDetails />
    </Wrapper>
  );
}
