import { useContext, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "./components/useOnClickOutside";
import styled, { createGlobalStyle } from "styled-components";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { keywordContext } from "./context/keywordContext";
import { authContext } from "./context/authContext";
import logo from "./logoName.png";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import bell from "./notification.png";
import yellowBell from "./notification-yellow.png";
import menu from "./menu.png";
import { X } from "react-feather";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    color: #4f4f4f;
    font-family: "Poppins";
  }

  p {
    margin: 0px;
  }

  button {
    font-family: "Poppins";
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
  z-index: 500;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5),
    transparent 95%
  );
  @media screen and (max-width: 601px) {
    z-index: 400;
  }
`;

const MobileDarkBackground = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100vh;
  width: 100vw;
  z-index: 500;
  background-color: rgb(0, 0, 0, 0.8);
  display: ${(props: Props) => (props.showNav ? "flex" : "none")};
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const LogoImg = styled.img`
  height: 30px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.1);
`;

const Menu = styled.img`
  height: 30px;
  display: none;
  cursor: pointer;
  @media screen and (max-width: 601px) {
    display: flex;
    margin-left: 10px;
  }
`;

const BrandName = styled.div`
  @media screen and (max-width: 441px) {
    display: none;
  }
`;

const HeaderNav = styled.div`
  display: flex;
  margin-right: 20px;
`;

const DesktopNav = styled.div`
  display: flex;
  @media screen and (max-width: 601px) {
    display: none;
  }
`;

const MobileNav = styled.div`
  display: none;
  @media screen and (max-width: 601px) {
    display: ${(props: Props) => (props.showNav ? "flex" : "none")};
    flex-direction: column;
    width: 200px;
    height: 100vh;
    background-color: #607973;
    position: fixed;
    right: 0px;
    top: 0;
    z-index: 600;
  }
`;

const XDiv = styled(X)`
  display: none;
  cursor: pointer;
  @media screen and (max-width: 601px) {
    display: flex;
    color: white;
    width: 100%;
    margin-top: 20px;
  } ;
`;

const Main = styled.main`
  width: 100vw;
`;

const NavDiv = styled.div`
  width: ${(props: Props) => (props.length ? `${props.length * 12}px` : ``)};
  display: flex;
  justify-content: center;
  @media screen and (max-width: 601px) {
    justify-content: flex-start;
    margin-top: 20px;
    padding-left: 20px;
  }
`;

const BellImg = styled.img`
  margin-top: 5px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const HomeLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  color: #4f4f4f;
  text-decoration: none;
`;

const Input = styled.input`
  width: 180px;
  height: 30px;
  border: 1px solid lightgray;
  border-radius: 5px;
  padding-left: 10px;
  &:focus {
    outline: none;
  }
  margin-right: 20px;
  @media screen and (max-width: 281px) {
    width: 120px;
  }
`;

const Notification = styled.div`
  display: ${(props: Props) => (props.showInvitation ? "flex" : "none")};
  flex-direction: column;
  min-height: 50px;
  border: 1px solid gray;
  border-radius: 10px;
  z-index: 1000;
  position: fixed;
  top: 45px;
  right: 300px;
  background-color: #607973;
  color: white;
  text-align: center;
  padding: 20px;
  gap: 20px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  @media screen and (max-width: 601px) {
    right: 50px;
  }
`;

const Invitation = styled.div``;

const InvitationA = styled(Link)`
  cursor: pointer;
  color: white;
  text-decoration: none;
`;

const Time = styled.div`
  font-size: 12px;
`;

interface Props {
  showInvitation?: boolean;
  length?: number;
  isScrolling?: boolean;
  showNav?: boolean;
}

interface BattleInvitation {
  ownerName: string;
  pin: string;
  time: {
    seconds: number;
    nanoseconds: number;
  };
}

function App() {
  const { setKeyword } = useContext(keywordContext);
  const { isLogin, userId, isLoadingUserAuth } = useContext(authContext);
  const navigate = useNavigate();
  const [inputVocab, setInputVocab] = useState<string>();
  const [battleInvitation, setBattleInvitation] =
    useState<BattleInvitation[]>();
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [showNav, setShowNav] = useState<boolean>(false);
  const pathName = window.location.pathname;
  const notificationRef = useRef(null);
  useOnClickOutside(notificationRef, () => setShowInvitation(false));

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
    time,
  }: BattleInvitation) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      battleInvitation: arrayRemove({
        ownerName,
        pin,
        time,
      }),
    });
  };

  function renderNav() {
    const shareStyle = {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
    };

    const activeStyle = {
      ...shareStyle,
      color: "#607973",
      textDecoration: "underline",
      fontWeight: "bold",
    };

    const notActiveStyle = {
      ...shareStyle,
      color: "#4f4f4f",
    };

    const hoverStyle = {
      ...shareStyle,
      color: "#4f4f4f",
      backgroundColor: "white",
      padding: "0 10px",
    };

    const mobileActiveStyle = {
      ...shareStyle,
      color: "white",
      fontWeight: "bold",
    };

    const mobileHoverStyle = {
      ...shareStyle,
      color: "#4f4f4f",
      backgroundColor: "white",
      padding: "0 10px",
    };

    const mobileNotActiveStyle = {
      ...shareStyle,
      color: "lightgray",
    };

    function renderNavLink(isActive: boolean, index: number) {
      if (window.screen.width < 601) {
        if (isActive) {
          return mobileActiveStyle;
        } else if (isHover[index]) {
          return mobileHoverStyle;
        } else {
          return mobileNotActiveStyle;
        }
      } else {
        if (isActive) {
          return activeStyle;
        } else if (isHover[index]) {
          return hoverStyle;
        } else {
          return notActiveStyle;
        }
      }
    }

    return (
      <>
        <XDiv size={16} />
        <NavDiv length={"Article".length}>
          <NavLink
            to={"/articles"}
            style={({ isActive }) => renderNavLink(isActive, 0)}
            onMouseEnter={() => setIsHover([true, false, false, false])}
            onMouseLeave={() => setIsHover([false, false, false, false])}
          >
            Article
          </NavLink>
        </NavDiv>
        <NavDiv length={"VocabBook".length}>
          <NavLink
            to={"/vocabbook"}
            style={({ isActive }) => renderNavLink(isActive, 1)}
            onMouseEnter={() => setIsHover([false, true, false, false])}
            onMouseLeave={() => setIsHover([false, false, false, false])}
          >
            VocabBook
          </NavLink>
        </NavDiv>
        <NavDiv length={"Friend".length}>
          <NavLink
            to={"/friends"}
            style={({ isActive }) => renderNavLink(isActive, 2)}
            onMouseEnter={() => setIsHover([false, false, true, false])}
            onMouseLeave={() => setIsHover([false, false, false, false])}
          >
            Friend
          </NavLink>
        </NavDiv>
        <NavDiv length={"Profile".length}>
          <NavLink
            to={"/profile"}
            style={({ isActive }) => renderNavLink(isActive, 3)}
            onMouseEnter={() => setIsHover([false, false, false, true])}
            onMouseLeave={() => setIsHover([false, false, false, false])}
          >
            Profile
          </NavLink>
        </NavDiv>
      </>
    );
  }

  return (
    <Wrapper>
      <GlobalStyle />
      <MobileDarkBackground showNav={showNav} />
      <Header>
        <HomeLink to="/">
          <LogoImg src={logo} alt="logo" />
          <BrandName>Vocab Garden</BrandName>
        </HomeLink>
        <HeaderNav>
          <InputWrapper>
            <Input
              placeholder="search a word..."
              onChange={(e) => {
                e.target.value = e.target.value.toLowerCase();
                setInputVocab(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputVocab && inputVocab !== "") {
                  setKeyword(inputVocab);
                  const target = e.target as HTMLInputElement;
                  target.value = "";
                  if (pathName === "/profile") {
                    navigate("/");
                  }
                  if (pathName === "/friends") {
                    navigate("/");
                  }
                }
              }}
            />
            {isLogin && (
              <BellImg
                src={battleInvitation?.length !== 0 ? yellowBell : bell}
                onClick={() => setShowInvitation((prev) => !prev)}
              />
            )}
            <Menu src={menu} alt="menu" onClick={() => setShowNav(true)} />
          </InputWrapper>
          <DesktopNav>{renderNav()}</DesktopNav>
        </HeaderNav>
      </Header>
      {window.innerWidth < 601 && (
        <MobileNav showNav={showNav} onClick={() => setShowNav(false)}>
          {" "}
          {renderNav()}
        </MobileNav>
      )}
      <Main>
        <Notification showInvitation={showInvitation} ref={notificationRef}>
          {battleInvitation?.length !== 0 ? (
            battleInvitation?.map(
              ({ ownerName, pin, time }: BattleInvitation) => {
                const newTime = new Date(time.seconds * 1000);
                return (
                  <Invitation key={pin}>
                    <InvitationA
                      style={{ marginLeft: 0 }}
                      to={`/vocabbook/review/${pin}`}
                      onClick={() => {
                        setShowInvitation(false);
                        handleClearInvitation({ ownerName, pin, time });
                      }}
                    >
                      {ownerName} invites you to battle! ▶
                    </InvitationA>
                    <Time>{newTime.toLocaleString()}</Time>
                  </Invitation>
                );
              }
            )
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
