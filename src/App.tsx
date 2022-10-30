import { useContext } from "react";
import styled from "styled-components";
import { Link, Outlet } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";
import { authContext } from "./context/authContext";

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

function App() {
  let searchedKeyword: string;
  const { setKeyword } = useContext(keywordContext);
  const { isLogin } = useContext(authContext);

  return (
    <Wrapper>
      {isLogin ? (
        <Header>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/articles">Article</NavLink>
          <NavLink to="/vocabbook">VocabBook</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <Input
            onChange={(e) => {
              e.target.value = e.target.value.toLowerCase();
              searchedKeyword = e.target.value;
            }}
            onKeyDown={(e) => {
              e.key === "Enter" && setKeyword(searchedKeyword);
            }}
          />
        </Header>
      ) : (
        <Header>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/profile">Article</NavLink>
          <NavLink to="/profile">VocabBook</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <Input
            onChange={(e) => {
              e.target.value = e.target.value.toLowerCase();
              searchedKeyword = e.target.value;
            }}
            onKeyDown={(e) => {
              e.key === "Enter" && setKeyword(searchedKeyword);
            }}
          />
        </Header>
      )}

      <Main>
        <Outlet />
      </Main>
    </Wrapper>
  );
}

export default App;
