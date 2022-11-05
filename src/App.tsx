import { useContext, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Link, Outlet } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";
import { authContext } from "./context/authContext";
import logoName from "./logoName.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    color: #4f4f4f;
  }
`;

const Wrapper = styled.div`
  background-color: #e9eef1ff;
  width: 100vw;
  padding-top: 60px;
  min-height: calc(100vh - 60px);
  font-family: "Poppins";
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0px;
  left: 0px;
  height: 60px;
  width: 100vw;
  background-color: #405c73ff;
  border-bottom: 1px solid gray;
  z-index: 1;
`;

const LogoImg = styled.img`
  height: 30px;
`;

const HeaderNav = styled.div`
  margin-right: 20px;
`;

const Main = styled.main`
  width: 100vw;
`;

const NavLink = styled(Link)`
  margin-left: 20px;
  color: white;
  text-decoration: none;
`;

const Input = styled.input`
  width: 200px;
  height: 20px;
  border: none;
  border-radius: 5px;
  padding-left: 10px;
`;

function App() {
  const { setKeyword } = useContext(keywordContext);
  const { isLogin } = useContext(authContext);
  const [inputVocab, setInputVocab] = useState<string>();

  return (
    <Wrapper>
      <GlobalStyle />
      <Header>
        <NavLink to="/">
          <LogoImg src={logoName} alt="logo" />
        </NavLink>
        <HeaderNav>
          <Input
            placeholder="search..."
            onChange={(e) => {
              e.target.value = e.target.value.toLowerCase();
              setInputVocab(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputVocab) setKeyword(inputVocab);
            }}
          />
          <NavLink to={isLogin ? "/articles" : "/profile"}>Article</NavLink>
          <NavLink to={isLogin ? "/vocabbook" : "/profile"}>VocabBook</NavLink>
          <NavLink to={isLogin ? "/profile" : "/profile"}>Profile</NavLink>
        </HeaderNav>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Wrapper>
  );
}

export default App;
