import styled, { css } from "styled-components";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { plantImgsObj } from "./plantImgs";
import Button from "../../components/Button/Button";
import plant from "./banner.webp";

interface Props {
  insideColor?: boolean;
  score?: number;
}

const Wrapper = styled.div`
  padding: 80px 20px 20px 20px;
  display: flex;
  @media screen and (max-width: 801px) {
    flex-direction: column;
  }
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

const LoginDiv = styled.div`
  display: flex;
  justify-content: center;
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

const Select = styled.select`
  border: none;
  &:focus {
    outline: none;
  }
  cursor: pointer;
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
  width: 30%;
  @media screen and (max-width: 1269px) {
    width: 40%;
  }
  @media screen and (max-width: 1108px) {
    width: 35%;
  }
  @media screen and (max-width: 1025px) {
    width: 50%;
  }
  @media screen and (max-width: 880px) {
    width: 40%;
  }
  @media screen and (max-width: 801px) {
    width: 100%;
    padding: 0 10px;
  }
`;

const GrowingPlantImg = styled.img`
  width: 250px;
  height: 300px;
  @media screen and (max-width: 801px) {
    width: 200px;
    height: 240px;
  }
`;

const Plants = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  width: 70%;
  gap: 20px;
  align-content: flex-start;
  @media screen and (max-width: 1269px) {
    width: 60%;
  }
  @media screen and (max-width: 1108px) {
    width: 65%;
  }
  @media screen and (max-width: 1025px) {
    width: 50%;
  }
  @media screen and (max-width: 880px) {
    width: 60%;
  }
  @media screen and (max-width: 801px) {
    width: 100%;
  }
  @media screen and (max-width: 601px) {
    width: 100%;
    justify-content: center;
  }
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
  @media screen and (max-width: 801px) {
    width: calc((100vw - 100px) / 3);
    height: calc((100vw - 64px) / 3 * 1.3);
  }
  @media screen and (max-width: 601px) {
    width: calc((100vw - 160px));
    height: calc((100vw - 160px) * 1.3);
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
    return (
      <Wrapper>
        <BackgroundImg />
        <LoginWrapper>
          {isMember ? (
            <>
              <WelcomeMsg>
                Log in or sign up to enjoy full functions!
              </WelcomeMsg>
              <Input
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div>
                <LoginDiv onClick={() => login(email, password)}>
                  <Button btnType="primary">Log in</Button>
                </LoginDiv>
                <Toggle onClick={() => setIsMember(false)}>
                  not a member？
                </Toggle>
              </div>
            </>
          ) : (
            <>
              <WelcomeMsg>
                Log in or sign up to enjoy full functions!
              </WelcomeMsg>
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
              <div onClick={() => signup(email, password, name)}>
                <Button btnType="primary">Signup</Button>
              </div>
              <Toggle onClick={() => setIsMember(true)}>
                already a member?
              </Toggle>
            </>
          )}
        </LoginWrapper>
      </Wrapper>
    );
  }

  return isLogin ? renderProile() : renderLoginPage();
}
