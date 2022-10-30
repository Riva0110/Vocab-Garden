import styled from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState } from "react";

const Wrapper = styled.div``;

export default function Profile() {
  const { isLogin, login, logout, signup } = useContext(authContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);

  return isLogin ? (
    <>
      <p>已登入</p>
      <button onClick={() => logout()}>Log out</button>
    </>
  ) : isMember ? (
    <Wrapper>
      <p>登入 / 註冊會員，享有完整功能！</p>
      <div>Login</div>
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => login(email, password)}>Log in</button>
      <p onClick={() => setIsMember(false)}>還不是會員？</p>
    </Wrapper>
  ) : (
    <Wrapper>
      <p>登入 / 註冊會員，享有完整功能！</p>
      <div>Signup</div>
      <input placeholder="name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => signup(email, password, name)}>Signup</button>
      <p onClick={() => setIsMember(true)}>已經是會員？</p>
    </Wrapper>
  );
}
