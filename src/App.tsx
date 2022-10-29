import React from "react";
import styled from "styled-components";
import { Link, Outlet } from "react-router-dom";

const Wrapper = styled.div``;
const Header = styled.header``;
const Main = styled.main`
  margin: 50px;
`;

const NavLink = styled(Link)`
  margin-right: 20px;
`;

function App() {
  return (
    <Wrapper>
      <Header>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/article">Article</NavLink>
        <NavLink to="/vocabbook">VocabBook</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Wrapper>
  );
}

export default App;
