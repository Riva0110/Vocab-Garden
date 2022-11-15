import styled, { css } from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { plantImgsObj } from "./plantImgs";
import Button from "../../components/Button";

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

const Select = styled.select`
  border: none;
  &:focus {
    outline: none;
  }
`;

const ScoreBarWrapper = styled.div`
  width: 200px;
`;

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

const ScoreDiv = styled.div`
  padding-right: 10px;
  text-align: end;
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 35vw;
`;

const GrowingPlantImg = styled.img`
  width: 250px;
  height: 300px;
  @media screen and (max-width: 600px) {
    width: 100px;
    height: 120px;
  }
`;

const Plants = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  width: 65vw;
  gap: 20px;
  align-content: flex-start;
`;

const PlantBorder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px lightgray solid;
  border-radius: 10px;
  width: 200px;
  height: 260px;
  padding: 30px;
  @media screen and (max-width: 600px) {
    width: 100px;
    height: 120px;
  }
`;

const PlantImg = styled.img`
  width: 100%;
  height: 85%;
  margin-bottom: 20px;
`;

const PlantName = styled.div``;

const Time = styled.div`
  color: gray;
  font-size: 12px;
`;

interface PlantsListInterface {
  plantName: string;
  time: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function Profile() {
  const { isLogin, login, logout, signup, userId } = useContext(authContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [isChallenging, setIsChallenging] = useState<boolean>();
  const [messages, setMessages] =
    useState<string>("選擇喜歡的植物，開始新的挑戰吧！");
  const [currentPlant, setCurrentPlant] = useState("begonia");
  const [plantPhase, setPlantPhase] = useState("0");
  const [isDying, setIsDying] = useState<boolean>(false);
  const [plantsList, setPlantsList] = useState<PlantsListInterface[]>([]);

  useEffect(() => {
    const getAndUpdateUserInfo = async () => {
      const plantsRef = doc(db, "plantsList", userId);
      const plantsSnap = await getDoc(plantsRef);
      const plantData = plantsSnap.data()?.plants as PlantsListInterface[];
      setPlantsList(plantData);

      const userRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userRef);
      const data = userDocSnap.data();
      setName(data?.name);
      setIsChallenging(data?.isChallenging);
      setIsDying(data?.isDying);
      setCurrentPlant(data?.currentPlant);
      setScore(data?.currentScore);

      const timeDifference =
        Date.now() - data?.lastTimeUpdateScore.seconds * 1000;
      const deduction = Math.floor(timeDifference / 300000);

      if (data?.isChallenging && deduction > 0) {
        setIsDying(true);
        setScore((prev) => Math.max(prev - deduction, 0));

        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          currentScore: Math.max(data?.currentScore - deduction, 0),
          lastTimeUpdateScore: new Date(),
          isDying: true,
        });
      }
    };

    getAndUpdateUserInfo();
  }, [userId]);

  useEffect(() => {
    if (isChallenging) {
      if (isDying) {
        if (score === 0) {
          setIsChallenging(false);
          setPlantPhase("minus1");
          setMessages("植物被你養死了QQ 挑戰失敗！");
        } else if (score <= 2) {
          setPlantPhase("minus1");
          setMessages("植物枯萎了，再加把勁！");
        } else if (score <= 4) {
          setPlantPhase("minus3");
          setMessages("好多天沒看到你了，植物想你囉！");
        }
      } else {
        if (score <= 2) {
          setPlantPhase("0");
          setMessages("加油加油，再努力一點，植物快長大囉！");
        } else if (score <= 4) {
          setPlantPhase("3");
          setMessages("你好棒喔！植物長出新葉片了！");
        } else if (score === 5) {
          setIsChallenging(false);
          setPlantPhase("5");
          setMessages("挑戰成功，植物長大了！趕快收藏到花園吧");
        }

        if (score === 3 || score === 4) setPlantPhase("3");
      }
    }

    const updateUserInfo = async () => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isDying,
        isChallenging,
      });
    };

    updateUserInfo();
  }, [isChallenging, isDying, score, userId]);

  function handleStartChallenge() {
    setIsChallenging(true);
    setScore(0);
    setIsDying(false);
    setPlantPhase("0");

    const startChallenge = async () => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isChallenging: true,
        currentScore: 0,
        isDying: false,
        currentPlant: currentPlant,
        lastTimeUpdateScore: new Date(),
      });
    };
    startChallenge();
  }

  const handleSavePlant = async () => {
    const plantsRef = doc(db, "plantsList", userId);
    await updateDoc(plantsRef, {
      plants: arrayUnion({
        plantName: currentPlant,
        time: new Date(),
      }),
    });

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentScore: 0,
      lastTimeUpdateScore: new Date(),
      currentPlant,
    });
    setMessages("選擇喜歡的植物，開始新的挑戰吧！");
    setScore(0);
    setPlantPhase("0");
    setPlantsList(
      (prev) =>
        [
          ...prev,
          {
            plantName: currentPlant,
            time: new Date(),
          },
        ] as PlantsListInterface[]
    );
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
              <ScoreBar>
                <ScoreDiv>{score} / 5</ScoreDiv>
              </ScoreBar>
            </ScoreBar>
          </ScoreBarWrapper>
          <p>{messages}</p>
          {isChallenging ? (
            <></>
          ) : score !== 5 ? (
            <>
              <Select
                onChange={async (e: any) => {
                  setCurrentPlant(e.target.value);
                  setIsDying(false);
                  setPlantPhase("0");
                  setMessages("選擇喜歡的植物，開始新的挑戰吧！");
                  const userRef = doc(db, "users", userId);
                  await updateDoc(userRef, {
                    isDying: false,
                  });
                }}
              >
                {Object.keys(plantImgsObj)?.map((plant, index) => (
                  <option key={plant} selected={plant === currentPlant}>
                    {plant}
                  </option>
                ))}
              </Select>

              <div onClick={() => handleStartChallenge()}>
                <Button btnType={"primary"}>Start a challenge</Button>
              </div>
            </>
          ) : (
            <div onClick={() => handleSavePlant()}>
              <Button btnType={"primary"}>
                Save the plant in your garden!
              </Button>
            </div>
          )}
          <div onClick={() => logout()}>
            <Button btnType={"secondary"}>Log out</Button>
          </div>
        </UserInfoWrapper>
        <Plants>
          {plantsList?.map(({ plantName, time }, index) => {
            const newDate = new Date(time.seconds * 1000);
            return (
              <PlantBorder>
                <PlantImg
                  src={plantImgsObj[plantName]["5"]}
                  alt="plants"
                  key={plantName + index}
                />
                <PlantName>{plantName}</PlantName>
                <Time>{newDate.toLocaleString()}</Time>
              </PlantBorder>
            );
          })}
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
