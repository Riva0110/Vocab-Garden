import { Dispatch, SetStateAction, useContext, useState } from "react";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import banner from "./banner.webp";

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
  background-image: url(${banner});
  background-size: cover;
  opacity: 0.6;
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
  setName: Dispatch<SetStateAction<string>>;
  signupAndUpdateState(
    /* eslint-disable no-unused-vars */
    email: string,
    password: string,
    name: string
    /* eslint-disable no-unused-vars */
  ): Promise<string | undefined>;
}

export default function LoginPage({
  name,
  setName,
  signupAndUpdateState,
}: Props) {
  const { login } = useContext(AuthContext);
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
              key="loginEmail"
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              key="loginPassword"
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
              <Toggle
                onClick={() => {
                  setIsMember(false);
                  setEmail("");
                  setPassword("");
                  setErrorMsg("");
                }}
              >
                not a member？
              </Toggle>
            </div>
          </>
        ) : (
          <>
            <WelcomeMsg>Log in or sign up to enjoy full functions!</WelcomeMsg>
            <Input
              key="signUpName"
              placeholder="name"
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              key="signUpEmail"
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              key="signUpPassword"
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <ErrorMsg>{errorMsg}</ErrorMsg>
            <Button
              btnType="primary"
              onClick={async () => {
                if (name === "") {
                  setErrorMsg("Please fill in your name.");
                  return;
                }
                console.log("sign up");
                const signupStatus = await signupAndUpdateState(
                  email,
                  password,
                  name
                );
                console.log("login", signupStatus);
                if (typeof signupStatus === "string") {
                  const signupErrorMsg = signupStatus.slice(9);
                  setErrorMsg(signupErrorMsg);
                }
              }}
            >
              Sign up
            </Button>
            <Toggle
              onClick={() => {
                setIsMember(true);
                setEmail("");
                setPassword("");
                setErrorMsg("");
              }}
            >
              already a member?
            </Toggle>
          </>
        )}
      </LoginWrapper>
    </Wrapper>
  );
}
