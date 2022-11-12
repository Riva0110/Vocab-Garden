import styled from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { useState } from "react";

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
  const [viewingBook, setViewingBook] = useState<string>("unsorted");
  return (
    <Wrapper>
      <Outlet context={{ viewingBook, setViewingBook }} />
    </Wrapper>
  );
}

export function useViewingBook() {
  return useOutletContext<ContextType>();
}
