import React, { useContext } from "react";
import styled from "styled-components";
import { Link, Outlet } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";

const Wrapper = styled.div``;
const Header = styled.header``;
const Main = styled.main`
  margin: 50px;
`;

const NavLink = styled(Link)`
  margin-right: 20px;
`;

const Input = styled.input`
  width: 100px;
`;

interface Props {
  onChange(e: React.ChangeEventHandler<HTMLInputElement>): void;
  onKeyDown(e: React.KeyboardEventHandler<HTMLInputElement>): void;
}

function App(props: Props) {
  let searchedKeyword: string;
  const { keyword, setKeyword } = useContext(keywordContext);

  console.log("keyword", keyword);

  return (
    <Wrapper>
      <Header>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/article">Article</NavLink>
        <NavLink to="/vocabbook">VocabBook</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <Input
          onChange={(e) => {
            searchedKeyword = e.target.value;
            console.log("searchedKeyword", searchedKeyword);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" && setKeyword(searchedKeyword);
          }}
        />
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Wrapper>
  );
}

export default App;
