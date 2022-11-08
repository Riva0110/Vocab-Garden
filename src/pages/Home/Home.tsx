import { useState } from "react";
import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import Test from "./test";
import banner from "./banner.jpg";
import banner2 from "./banner2.jpg";

const Wrapper = styled.div`
  display: flex;
  /* padding: 0 20px; */
`;

const Border = styled.div`
  position: absolute;
  margin: 20px;
  margin-top: 60px;
  border: 1px gray solid;
  width: calc(100% - 40px);
  height: 90vh;
`;

const Banners = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
`;

const Banner = styled.img`
  height: 100vh;
`;

const Banner2 = styled.img`
  height: 40vh;
  margin-top: 350px;
`;

const Title = styled.div`
  position: absolute;
  left: 40%;
  top: 30%;
  font-size: 40px;
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

export default function Home() {
  return (
    <Wrapper>
      <Border />
      <Banners>
        <Banner src={banner} alt="banner-plant"></Banner>
        <Banner2 src={banner2} alt="banner-plant"></Banner2>
      </Banners>
      <Title>
        The best way to predict the future
        <br /> is to <Emphasize>create</Emphasize> it. <br />
        <Author>– Abraham Lincoln</Author>
      </Title>
    </Wrapper>
  );
}
