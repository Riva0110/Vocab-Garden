import { useContext, useEffect, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { Link, Outlet } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";
import { authContext } from "./context/authContext";
import logo from "./logoName.png";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import bell from "./notification.png";
import yellowBell from "./notification-yellow.png";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    color: #4f4f4f;
  }
`;

const Wrapper = styled.div`
  display: flex;
  background-color: white;
  width: 100vw;
  min-height: 100vh;
`;

const Loading = styled.div`
  padding: 50vh 50vw;
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
  z-index: 1;
`;

const LogoImg = styled.img`
  height: 30px;
`;

const BrandName = styled.div``;

const HeaderNav = styled.div`
  display: flex;
  margin-right: 20px;
`;

const Main = styled.main`
  width: 100vw;
`;

const NavDiv = styled.div`
  width: ${(props: Props) => (props.length ? `${props.length * 10}px` : ``)};
  display: flex;
  justify-content: center;
`;

const BellImg = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  color: #4f4f4f;
  text-decoration: none;
  &:hover {
    color: #607973;
    font-weight: 800;
  }
`;

const Input = styled.input`
  width: 180px;
  height: 20px;
  border: none;
  border-radius: 5px;
  padding-left: 10px;
  &:focus {
    outline: none;
  }
  margin-right: 20px;
`;

const Notification = styled.div`
  display: ${(props: Props) => (props.showInvitation ? "flex" : "none")};
  min-height: 20px;
  border: 1px solid gray;
  border-radius: 10px;
  z-index: 1;
  position: fixed;
  top: 40px;
  right: 300px;
  background-color: white;
  padding: 20px 20px 20px 0;
`;

const Invitation = styled.div``;

interface Props {
  showInvitation?: boolean;
  length?: number;
  isScrolling?: boolean;
}

interface BattleInvitation {
  ownerName: string;
  pin: string;
}

function App() {
  const { setKeyword } = useContext(keywordContext);
  const { isLogin, userId, isLoadingUserAuth } = useContext(authContext);
  const [inputVocab, setInputVocab] = useState<string>();
  const [battleInvitation, setBattleInvitation] =
    useState<BattleInvitation[]>();
  const [showInvitation, setShowInvitation] = useState<boolean>(true);

  useEffect(() => {
    let unsub;
    if (isLogin) {
      unsub = onSnapshot(doc(db, "users", userId), (doc) => {
        setBattleInvitation(doc.data()?.battleInvitation);
      });
    } else {
      setBattleInvitation([]);
      setShowInvitation(false);
    }
    return unsub;
  }, [isLogin, userId]);

  const handleClearInvitation = async ({
    ownerName,
    pin,
  }: BattleInvitation) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      battleInvitation: arrayRemove({
        ownerName,
        pin,
      }),
    });
  };

  return (
    <Wrapper>
      <GlobalStyle />
      <Header>
        <NavLink to="/">
          <LogoImg src={logo} alt="logo" />
          <BrandName>Vocab Garden</BrandName>
        </NavLink>
        <HeaderNav>
          <Input
            placeholder="search a word..."
            onChange={(e) => {
              e.target.value = e.target.value.toLowerCase();
              setInputVocab(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputVocab) {
                setKeyword(inputVocab);
                const target = e.target as HTMLInputElement;
                target.value = "";
              }
            }}
          />
          {isLogin && (
            <BellImg
              src={battleInvitation?.length !== 0 ? yellowBell : bell}
              onClick={() => setShowInvitation((prev) => !prev)}
            />
          )}
          <NavDiv length={"Article".length}>
            <NavLink to={isLogin ? "/articles" : "/profile"}>Article</NavLink>
          </NavDiv>
          <NavDiv length={"VocabBook".length}>
            <NavLink to={isLogin ? "/vocabbook" : "/profile"}>
              VocabBook
            </NavLink>
          </NavDiv>
          <NavDiv length={"Friend".length}>
            <NavLink to={isLogin ? "/friends" : "/profile"}>Friend</NavLink>
          </NavDiv>
          <NavDiv length={"Profile".length}>
            <NavLink to={isLogin ? "/profile" : "/profile"}>Profile</NavLink>
          </NavDiv>
        </HeaderNav>
      </Header>
      <Main>
        <Notification showInvitation={showInvitation}>
          {battleInvitation?.length !== 0 ? (
            battleInvitation?.map(({ ownerName, pin }: BattleInvitation) => (
              <Invitation>
                <NavLink
                  to={`/vocabbook/review/${pin}`}
                  onClick={() => {
                    setShowInvitation(false);
                    handleClearInvitation({ ownerName, pin });
                  }}
                >
                  ▶ {ownerName} invites you to battle!
                </NavLink>
              </Invitation>
            ))
          ) : (
            <div>There's no invitation.</div>
          )}
        </Notification>
        {isLoadingUserAuth ? <Loading>Loading......</Loading> : <Outlet />}
      </Main>
    </Wrapper>
  );
}

export default App;
