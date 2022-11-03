import styled, { css } from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

interface Props {
  insideColor?: boolean;
  score?: number;
}

const Wrapper = styled.div``;
const ScoreBar = styled.div`
  width: 200px;
  height: 30px;
  line-height: 30px;
  border: 1px solid gray;
  border-radius: 20px;
  ${(props: Props) =>
    props.insideColor &&
    css`
      border: 0px;
      background-color: #00ff0080;
      width: ${(props: Props) =>
        props.score ? `${props.score * 40}px` : "0px"};
      z-index: -1;
      margin-bottom: 20px;
    `}
`;
const Btn = styled.button``;

export default function Profile() {
  const { isLogin, login, logout, signup, userId } = useContext(authContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [isChallenging, setIsChallenging] = useState<boolean>();

  useEffect(() => {
    if (isLogin) {
      const getUserInfo = async (userId: string) => {
        const docRef = doc(db, "users", userId);
        const docSnap: any = await getDoc(docRef);
        setName(docSnap.data().name);
        setIsChallenging(docSnap.data().isChallenging);
        if (docSnap.data().currentScore === 5) {
          setIsChallenging(false);
          setScore(docSnap.data().currentScore);
          const resetScore = async () => {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
              isChallenging: false,
            });
          };
          resetScore();
        } else if (
          // test 每 5 分鐘扣 1 分
          Date.now() - docSnap.data().lastTimeUpdateScore.seconds * 1000 >
            300000 &&
          docSnap.data().currentScore > 0 &&
          isChallenging
        ) {
          setScore(docSnap.data().currentScore - 1);
          const resetScore = async () => {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
              currentScore: docSnap.data().currentScore - 1,
              lastTimeUpdateScore: new Date(),
            });
          };
          resetScore();
        } else {
          setScore(docSnap.data().currentScore);
        }
      };
      getUserInfo(userId);
    }
  }, [userId, isLogin, isChallenging]);

  const handleStartChallenge = () => {
    setIsChallenging(true);
    setScore(0);
    const resetScore = async () => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        currentScore: 0,
        isChallenging: true,
      });
    };
    resetScore();
  };

  function renderProile() {
    return (
      <>
        <p>{name}’s Vocab Garden</p>
        <ScoreBar insideColor={true} score={score}>
          <ScoreBar>{score} / 5</ScoreBar>
        </ScoreBar>
        {score === 5
          ? "恭喜你，植物長大了！再種一顆新的吧"
          : "加油加油，再努力一點，植物快長大囉！"}
        {isChallenging ? (
          <></>
        ) : (
          <Btn onClick={() => handleStartChallenge()}>Start a challenge</Btn>
        )}
        <button onClick={() => logout()}>Log out</button>
      </>
    );
  }

  function renderLoginPage() {
    return isMember ? (
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

  return isLogin ? renderProile() : renderLoginPage();
}
