import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { Outlet } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  gap: 50px;
  padding: 20px;
  margin-top: 60px;
  /* height: calc(100vh - 60px); */
`;

export default function ArticlesLayout() {
  console.log("ArticlesLayout");
  return (
    <Wrapper>
      <Outlet />
      <VocabDetails />
    </Wrapper>
  );
}
