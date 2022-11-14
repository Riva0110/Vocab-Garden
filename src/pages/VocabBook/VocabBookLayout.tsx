import styled from "styled-components";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useContext, useState } from "react";
import { authContext } from "../../context/authContext";

const Wrapper = styled.div`
  @media screen and (min-width: 1440px) {
    margin: 0 auto;
    max-width: 1440px;
  }
`;

type ContextType = {
  viewingBook: string;
  setViewingBook: React.Dispatch<React.SetStateAction<string>>;
};

export default function VocabBookLayout() {
  const { isLogin } = useContext(authContext);
  const [viewingBook, setViewingBook] = useState<string>("unsorted");
  return isLogin ? (
    <Wrapper>
      <Outlet context={{ viewingBook, setViewingBook }} />
    </Wrapper>
  ) : (
    <Navigate replace to="/profile" />
  );
}

export function useViewingBook() {
  return useOutletContext<ContextType>();
}
