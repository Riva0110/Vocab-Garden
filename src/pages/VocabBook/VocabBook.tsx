import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div``;
const NavLink = styled(Link)`
  margin-right: 20px;
`;

export default function VocabBook() {
  return (
    <Wrapper>
      <div>VocabBook</div>
      <NavLink to="/wordle">Wordle</NavLink>
      <NavLink to="/review">Review</NavLink>
    </Wrapper>
  );
}
