import styled, { css } from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { plantImgsObj } from "./plantImgs";

interface Props {
  insideColor?: boolean;
  score?: number;
}

const LoginWrapper = styled.div`
  padding: 20px;
  margin-top: 60px;
  display: block;
`;

const Wrapper = styled.div`
  padding: 20px;
  margin-top: 60px;
  display: flex;
`;

const Select = styled.select``;

const ScoreBarWrapper = styled.div``;

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
      background-color: #95caca;
      width: ${(props: Props) =>
        props.score ? `${props.score * 40}px` : "0px"};
      z-index: -1;
      margin-bottom: 20px;
    `}
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 30vw;
`;

const GrowingPlantImg = styled.img`
  width: 250px;
  height: 300px;
  @media screen and (max-width: 600px) {
    width: 100px;
    height: 120px;
  }
`;

const Btn = styled.button``;

const Plants = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 30px;
`;
const PlantImg = styled.img`
  width: 200px;
  height: 240px;
  border: 1px lightgray solid;
  border-radius: 10px;
  padding: 30px;
  @media screen and (max-width: 600px) {
    width: 100px;
    height: 120px;
  }
`;

const plantsList = [
  plantImgsObj.begonia["5"],
  plantImgsObj.mirrorGrass["5"],
  plantImgsObj.travelerBanana["5"],
  plantImgsObj.philodendron["5"],
  plantImgsObj.ceriman["5"],
  plantImgsObj.birdOfParadise["5"],
];

export default function Profile() {
  const { isLogin, login, logout, signup, userId } = useContext(authContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [isChallenging, setIsChallenging] = useState<boolean>();
  const [messages, setMessages] = useState<string>("");
  const [currentPlant, setCurrentPlant] = useState("");
  const [plantPhase, setPlantPhase] = useState("0");
  const [isDying, setIsDying] = useState<boolean>(false);

  useEffect(() => {
    if (isLogin) {
      const getUserInfo = async (userId: string) => {
        const docRef = doc(db, "users", userId);
        const docSnap: any = await getDoc(docRef);
        setName(docSnap.data().name);
        setIsChallenging(docSnap.data().isChallenging);

        if (docSnap.data().currentPlant)
          setCurrentPlant(docSnap.data().currentPlant);
        else setCurrentPlant("begonia");

        const currentScore = docSnap.data().currentScore;
        const timeDifference =
          Date.now() - docSnap.data().lastTimeUpdateScore.seconds * 1000;

        const deduction = Math.floor(timeDifference / 300000);
        const scoreAfterDeduction = Math.max(currentScore - deduction, 0);

        if (currentScore === 5) {
          setIsChallenging(false);
          setScore(currentScore);
          setMessages("恭喜你，植物長大了！再種一顆新的吧");
          const resetScore = async () => {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
              isChallenging: false,
            });
          };
          resetScore();
          setPlantPhase("5");
        } else if (
          // test 每 5 分鐘扣 1 分
          timeDifference > 300000 &&
          currentScore > 0 &&
          isChallenging
        ) {
          setMessages("好多天沒看到你了，植物想你囉！");
          setScore(scoreAfterDeduction);
          setIsDying(true);
          const resetScore = async () => {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
              currentScore: scoreAfterDeduction,
              lastTimeUpdateScore: new Date(),
              isDying: true,
            });
          };
          resetScore();
        } else if (currentScore === 0 && timeDifference > 900000) {
          setIsChallenging(false);
          setMessages("植物被你養死了QQ");
        } else if (isChallenging) {
          setMessages("加油加油，再努力一點，植物快長大囉！");
          setScore(currentScore);
        } else {
          setMessages("種顆新植物，來挑戰你自己吧！");
        }

        if (isDying) {
          if (scoreAfterDeduction === 3 || scoreAfterDeduction === 2)
            setPlantPhase("minus3");
          if (scoreAfterDeduction === 1 || scoreAfterDeduction === 0)
            setPlantPhase("minus1");
        } else {
          if (currentScore === 0 || currentScore === 1 || currentScore === 2)
            setPlantPhase("0");
          if (currentScore === 3 || currentScore === 4) setPlantPhase("3");
        }
      };
      getUserInfo(userId);
    }
  }, [userId, isLogin, isChallenging, isDying]);

  const handleStartChallenge = () => {
    setIsChallenging(true);
    setScore(0);
    const resetScore = async () => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        currentScore: 0,
        currentPlant: currentPlant,
        isChallenging: true,
        lastTimeUpdateScore: new Date(),
      });
    };
    resetScore();
  };

  function renderProile() {
    return (
      <Wrapper>
        <UserInfoWrapper>
          <p>{name}’s Vocab Garden</p>
          <GrowingPlantImg
            src={plantImgsObj[currentPlant]?.[plantPhase]}
            alt="plants"
          />
          <ScoreBarWrapper>
            <ScoreBar insideColor={true} score={score}>
              <ScoreBar>{score} / 5</ScoreBar>
            </ScoreBar>
          </ScoreBarWrapper>
          <p>{messages}</p>
          {isChallenging ? (
            <></>
          ) : (
            <>
              <Select
                defaultValue={"begonia"}
                onChange={(e: any) => {
                  setCurrentPlant(e.target.value);
                }}
              >
                {Object.keys(plantImgsObj)?.map((plant, index) => (
                  <option key={plant}>{plant}</option>
                ))}
              </Select>
              <Btn onClick={() => handleStartChallenge()}>
                Start a challenge
              </Btn>
            </>
          )}
          <button onClick={() => logout()}>Log out</button>
        </UserInfoWrapper>
        <Plants>
          {plantsList.map((plant) => (
            <PlantImg src={plant} alt="plants" key={plant} />
          ))}
        </Plants>
      </Wrapper>
    );
  }

  function renderLoginPage() {
    return isMember ? (
      <LoginWrapper>
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
      </LoginWrapper>
    ) : (
      <LoginWrapper>
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
      </LoginWrapper>
    );
  }

  return isLogin ? renderProile() : renderLoginPage();
}
