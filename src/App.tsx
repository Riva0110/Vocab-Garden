import { useContext, useState } from "react";
import styled from "styled-components";
import { Link, Outlet, useOutletContext } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";
import { authContext } from "./context/authContext";

const Wrapper = styled.div``;
const Header = styled.header`
  position: fixed;
  top: 0px;
  width: 100vw;
  height: 30px;
  background-color: white;
  border-bottom: 1px solid gray;
  padding: 20px;
  z-index: 1;
`;
const Main = styled.main`
  margin: 50px;
  margin-top: 80px;
`;

const NavLink = styled(Link)`
  margin-right: 20px;
`;

const Input = styled.input`
  width: 100px;
`;

type ContextType = {
  viewingBook: string;
  setViewingBook: React.Dispatch<React.SetStateAction<string>>;
};

function App() {
  const { setKeyword } = useContext(keywordContext);
  const { isLogin } = useContext(authContext);
  const [inputVocab, setInputVocab] = useState<string>();
  const [viewingBook, setViewingBook] = useState<string>("unsorted");

  return (
    <Wrapper>
      <Header>
        <NavLink to="/">Home</NavLink>
        <NavLink to={isLogin ? "/articles" : "/profile"}>Article</NavLink>
        <NavLink to={isLogin ? "/vocabbook" : "/profile"}>VocabBook</NavLink>
        <NavLink to={isLogin ? "/profile" : "/profile"}>Profile</NavLink>
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
      </Header>

      <Main>
        <Outlet context={{ viewingBook, setViewingBook }} />
      </Main>
    </Wrapper>
  );
}

export default App;

export function useViewingBook() {
  return useOutletContext<ContextType>();
}
