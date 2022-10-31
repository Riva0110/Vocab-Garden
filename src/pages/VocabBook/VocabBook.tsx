import { Link } from "react-router-dom";
import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";

const Wrapper = styled.div``;
const Nav = styled.nav`
  margin-bottom: 20px;
`;
const NavLink = styled(Link)`
  margin-right: 20px;
`;

export default function VocabBook() {
  return (
    <Wrapper>
      <Nav>
        <NavLink to="/wordle">Wordle</NavLink>
        <NavLink to="/review">Review</NavLink>
      </Nav>
      <VocabDetails />
    </Wrapper>
  );
}
