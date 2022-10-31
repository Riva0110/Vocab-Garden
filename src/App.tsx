import { useContext, useState } from "react";
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
  const { setKeyword } = useContext(keywordContext);
  const { isLogin } = useContext(authContext);
  const [inputVocab, setInputVocab] = useState<string>();

  return (
    <Wrapper>
      <Header>
        <NavLink to="/">Home</NavLink>
        <NavLink to={isLogin ? "/articles" : "/profile"}>Article</NavLink>
        <NavLink to={isLogin ? "/vocabbook" : "/profile"}>VocabBook</NavLink>
        <NavLink to={isLogin ? "/profile" : "/profile"}>Profile</NavLink>
        <Input
          onChange={(e) => {
            e.target.value = e.target.value.toLowerCase();
            setInputVocab(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputVocab) setKeyword(inputVocab);
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
