import styled, { css } from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState, useEffect, useCallback } from "react";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { plantImgsObj } from "./plantImgs";
import Button from "../../components/Button/Button";
import plant from "./plant.webp";
import growingPlants from "./growingPlants.webp";
import dyingPlants from "./dyingPlants.webp";
import Hint from "../../components/Hint/Hint";
import LoginPage from "./Login";
import { useNavigate } from "react-router-dom";
import StackedBarChart from "./StackedBarChart";

interface Props {
  insideColor?: boolean;
  score?: number;
}

const Wrapper = styled.div`
  padding: 80px 20px 20px 20px;
  display: flex;
  gap: 30px;
  @media screen and (max-width: 1001px) {
    flex-direction: column;
  }
`;

const Img = styled.img`
  width: 400px;
  position: fixed;
  right: 30px;
  bottom: 0px;
  opacity: 0.5;
  @media screen and (max-width: 1001px) {
    display: none;
  }
`;

const Select = styled.select`
  border: none;
  &:focus {
    outline: none;
  }
  cursor: pointer;
  height: 30px;
  font-size: 16px;
  background-color: rgb(255, 255, 255, 0.1);
`;

const Option = styled.option``;

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
  padding: 30px 0;
  border-radius: 30px;
  position: relative;
  z-index: 1;
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
    width: 100%;
  }
`;

const ProfileTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
`;

const GrowingPlantImg = styled.img`
  width: 250px;
  height: 300px;
  @media screen and (max-width: 801px) {
    width: 200px;
    height: 240px;
  }
`;

const PlantsWrapper = styled.div`
  width: 70%;
  position: relative;
  z-index: 1;
  border-radius: 30px;
  padding: 30px;
  display: flex;
  justify-content: center;

  @media screen and (max-width: 1269px) {
    width: 60%;
  }
  @media screen and (max-width: 1108px) {
    width: 65%;
  }
  @media screen and (max-width: 1025px) {
    width: 100%;
  }
`;

const Plants = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-template-rows: 260px 260px;
  gap: 20px;
  @media screen and (max-width: 1701px) {
    grid-template-columns: auto auto auto auto;
  }
  @media screen and (max-width: 1401px) {
    grid-template-columns: auto auto auto;
  }
  @media screen and (max-width: 1201px) {
    grid-template-columns: auto auto;
  }
  @media screen and (max-width: 1001px) {
    grid-template-columns: auto auto auto;
  }
  @media screen and (max-width: 731px) {
    grid-template-columns: auto auto;
  }
  @media screen and (max-width: 501px) {
    grid-template-columns: auto;
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
`;

const PlantImg = styled.img`
  width: 100%;
  height: 85%;
  margin-bottom: 5px;
  @media screen and (max-width: 601px) {
    margin-bottom: 15px;
  }
`;

const PlantName = styled.div``;

const Time = styled.div`
  color: gray;
  font-size: 12px;
`;

const FewPlants = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding-top: 300px;
  @media screen and (max-width: 1001px) {
    padding-top: 50px;
  }
`;

const HintImg = styled.img`
  width: 300px;
`;

const GameRule = styled.div`
  background-color: lightgray;
  padding: 10px;
`;

interface PlantsListInterface {
  plantName: string;
  time: {
    seconds: number;
    nanoseconds: number;
  };
}

function displayPlantName(currentPlant: string) {
  return (
    (currentPlant === "begonia" && "Begonia") ||
    (currentPlant === "mirrorGrass" && "Mirror Grass") ||
    (currentPlant === "travelerBanana" && "Traveler Banana") ||
    (currentPlant === "philodendron" && "Philodendron") ||
    (currentPlant === "ceriman" && "Ceriman") ||
    (currentPlant === "birdOfParadise" && "Bird of Paradise")
  );
}

function getCamelCasePlantName(plantName: string) {
  return (
    (plantName === "Begonia" && "begonia") ||
    (plantName === "Mirror Grass" && "mirrorGrass") ||
    (plantName === "Traveler Banana" && "travelerBanana") ||
    (plantName === "Philodendron" && "philodendron") ||
    (plantName === "Ceriman" && "ceriman") ||
    (plantName === "Bird of Paradise" && "birdOfParadise") ||
    "begonia"
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { isLogin, logout, userId, signup } = useContext(AuthContext);
  const [name, setName] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [isChallenging, setIsChallenging] = useState<boolean>();
  const [messages, setMessages] =
    useState<string>("選擇喜歡的植物，開始新的挑戰吧！");
  const [currentPlant, setCurrentPlant] = useState("begonia");
  const [plantPhase, setPlantPhase] = useState("0");
  const [isDying, setIsDying] = useState<boolean>(false);
  const [plantsList, setPlantsList] = useState<PlantsListInterface[]>([]);

  const getAndUpdateUserInfo = useCallback(async (userId: string) => {
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
    const deduction = Math.floor(timeDifference / (300000 * 576));

    if (data?.isChallenging && deduction > 0) {
      setIsDying(true);
      setScore((prev) => Math.max(prev - deduction, 0));

      await updateDoc(userRef, {
        currentScore: Math.max(data?.currentScore - deduction, 0),
        lastTimeUpdateScore: new Date(),
        isDying: true,
      });
    }
  }, []);

  const signupAndUpdateState = async (
    email: string,
    password: string,
    name: string
  ) => {
    const newUserId = await signup(email, password, name);
    if (typeof newUserId === "string") {
      getAndUpdateUserInfo(newUserId);
    }
  };

  useEffect(() => {
    if (userId) {
      getAndUpdateUserInfo(userId);
    }
  }, [userId, getAndUpdateUserInfo]);

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
        }

        if (score === 3 || score === 4) setPlantPhase("3");
      }
    }

    if (score === 5) {
      setIsChallenging(false);
      setPlantPhase("5");
      setMessages("挑戰成功，植物長大了！趕快收藏到花園吧");
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
        plantName: displayPlantName(currentPlant),
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
            plantName: displayPlantName(currentPlant),
            time: {
              seconds: Date.now() / 1000,
              nanoseconds: Date.now() / 1000,
            },
          },
        ] as PlantsListInterface[]
    );
  };

  const renderProfile = () => {
    return (
      <Wrapper>
        <UserInfoWrapper>
          <ProfileTitle>
            <p>{name}’s Vocab Garden</p>
            <Hint>
              Start a challenge,
              <br />
              and enrich your Vocab Garden!
              <br />
              <br />
              <GameRule>
                When you are in a challenge,
                <br />
                you can get 1 point by two ways:
                <br />
                <br />
                1. [Review - Single Mode] <br />
                ．Correct rate &gt;= 80%
                <br />
                <br />
                2. [Review - Battle Mode] <br />
                ．Invite your friends to battle <br />
                ．Win the battle!
                <br />
                ．Correct rate &gt;= 80%
                <br />
                <HintImg src={growingPlants} alt="growingPlants" />
                <br />
                <br />
                Reminder:
                <br />
                1. You need to review at least once a day,
                <br />
                &nbsp;&nbsp;&nbsp;otherwise you would lose 1 point per day.
                <br />
                2. If the score was deducted to 0,
                <br />
                &nbsp;&nbsp;&nbsp;the plant would die.
                <br />
                <HintImg src={dyingPlants} alt="growingPlants" />
              </GameRule>
              <br />
              Choose a book to review right now!
              <br />
              <div
                onClick={() => {
                  navigate("/vocabbook");
                }}
              >
                &gt;&gt;&gt; Click me &gt;&gt;&gt;
              </div>
            </Hint>
          </ProfileTitle>
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
            <p>{displayPlantName(currentPlant)}</p>
          ) : score !== 5 ? (
            <>
              <Select
                value={currentPlant}
                onChange={async (e) => {
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
                  <Option key={plant} value={plant}>
                    {displayPlantName(plant)}
                  </Option>
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
          <StackedBarChart />
          <div onClick={() => logout()}>
            <Button btnType={"secondary"}>Log out</Button>
          </div>
        </UserInfoWrapper>
        <PlantsWrapper>
          <Plants>
            {plantsList?.length !== 0 ? (
              plantsList?.map(({ plantName, time }, index) => {
                const newDate = new Date(time.seconds * 1000);
                return (
                  <PlantBorder key={time + plantName}>
                    <PlantImg
                      src={plantImgsObj[getCamelCasePlantName(plantName)]["5"]}
                      alt="plants"
                      key={plantName + index}
                    />
                    <PlantName>{plantName}</PlantName>
                    <Time>{newDate.toLocaleString()}</Time>
                  </PlantBorder>
                );
              })
            ) : (
              <FewPlants>
                There's no any plants in your garden.
                <br />
                Start a challenge TODAY!
                <Img src={plant} alt="plant" />
              </FewPlants>
            )}
          </Plants>
        </PlantsWrapper>
      </Wrapper>
    );
  };

  if (isLogin) return renderProfile();
  return (
    <LoginPage name={name} setName={setName} signup={signupAndUpdateState} />
  );
}
