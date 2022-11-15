import styled from "styled-components";
import banner from "./banner.jpg";
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

const Border = styled.div`
  position: absolute;
  margin: 20px;
  margin-top: 60px;
  border: 1px gray solid;
  width: calc(100% - 40px);
  height: 50vh;
`;

const Banners = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60vh;
`;

const BackgroundImg = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  background-image: url(${banner});
  background-size: cover;
`;

const Banner = styled.img`
  position: absolute;
  left: 0;
  top: 350px;
  height: 40%;
`;

const Title = styled.div`
  position: absolute;
  left: 10%;
  top: 20%;
  font-size: 34px;
  font-weight: 600;
  color: black;
`;

const Emphasize = styled.span`
  color: darkgreen;
  text-decoration: underline;
`;

const Author = styled.span`
  font-size: 20px;
  font-weight: 200;
`;

const VocabDiv = styled.div`
  height: 200px;
  padding: 20px;
`;

export default function Home() {
  return (
    <Wrapper>
      <BackgroundImg />
      <Banner src={banner2} alt="banner-plant"></Banner>
      <Title>
        The best way to predict the future
        <br /> is to <Emphasize>create</Emphasize> it. <br />
        <Author>– Abraham Lincoln</Author>
      </Title>
      <BannerWrapper>
        {/* <Border />
        <Banners>
          <Banner src={banner} alt="banner-plant"></Banner>
          <Banner2 src={banner2} alt="banner-plant"></Banner2>
        </Banners>
         */}
      </BannerWrapper>
      {/* <VocabDiv> */}
      <VocabDetails />
      {/* </VocabDiv> */}
    </Wrapper>
  );
}
