import { useContext, useState } from "react";
import styled from "styled-components";
import { authContext } from "../../context/authContext";
import plant from "./banner.webp";
import Button from "../../components/Button/Button";

const Wrapper = styled.div`
  padding: 80px 20px 20px 20px;
  display: flex;
  gap: 30px;
  @media screen and (max-width: 1001px) {
    flex-direction: column;
  }
`;

const BackgroundImg = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-image: url(${plant});
  background-size: cover;
  opacity: 0.5;
`;

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  width: 500px;
  padding: 20px;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 60px);
  @media screen and (max-width: 601px) {
    width: 100%;
  }
`;

const ErrorMsg = styled.div`
  margin-bottom: 10px;
  color: #c28e96;
`;

const LoginDiv = styled.div`
  display: flex;
  justify-content: center;
`;

const WelcomeMsg = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

const Toggle = styled.div`
  margin-top: 20px;
  color: gray;
  cursor: pointer;
`;

const Input = styled.input`
  width: 70%;
  margin-bottom: 10px;
  height: 30px;
  padding-left: 10px;
  border: 1px solid lightgrey;
  &:focus {
    outline: none;
  }
`;

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

export default function LoginPage({ name, setName }: Props) {
  const { login, signup } = useContext(authContext);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);

  return (
    <Wrapper>
      <BackgroundImg />
      <LoginWrapper>
        {isMember ? (
          <>
            <WelcomeMsg>Log in or sign up to enjoy full functions!</WelcomeMsg>
            <Input
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <ErrorMsg>{errorMsg}</ErrorMsg>
            <div>
              <LoginDiv
                onClick={async () => {
                  const loginStatus = await login(email, password);
                  if (typeof loginStatus === "string") {
                    const loginErrorMsg = loginStatus.slice(9) as string;
                    setErrorMsg(loginErrorMsg);
                  }
                }}
              >
                <Button btnType="primary">Log in</Button>
              </LoginDiv>
              <Toggle onClick={() => setIsMember(false)}>not a member？</Toggle>
            </div>
          </>
        ) : (
          <>
            <WelcomeMsg>Log in or sign up to enjoy full functions!</WelcomeMsg>
            <Input
              placeholder="name"
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <ErrorMsg>{errorMsg}</ErrorMsg>
            <div
              onClick={async () => {
                if (name === "") {
                  setErrorMsg("Please fill in your name.");
                  return;
                }
                const signupStatus = await signup(email, password, name);
                if (typeof signupStatus === "string") {
                  const signupErrorMsg = signupStatus.slice(9) as string;
                  setErrorMsg(signupErrorMsg);
                }
              }}
            >
              <Button btnType="primary">Sign up</Button>
            </div>
            <Toggle onClick={() => setIsMember(true)}>already a member?</Toggle>
          </>
        )}
      </LoginWrapper>
    </Wrapper>
  );
}
