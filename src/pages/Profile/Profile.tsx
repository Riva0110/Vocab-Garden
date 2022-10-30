import styled from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Wrapper = styled.div``;

export default function Profile() {
  const { isLogin, login, logout, signup, userId } = useContext(authContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);

  useEffect(() => {
    if (isLogin) {
      const getUserInfo = async (userId: string) => {
        const docRef = doc(db, "users", userId);
        const docSnap: any = await getDoc(docRef);
        setName(docSnap.data().name);
      };
      getUserInfo(userId);
    }
  }, [userId]);

  return isLogin ? (
    <>
      <p>{name}已登入</p>
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
