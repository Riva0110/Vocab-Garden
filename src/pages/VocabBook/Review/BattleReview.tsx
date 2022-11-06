import styled, { css } from "styled-components";
import { useContext, useState, useEffect, SetStateAction } from "react";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import audio from "../../../components/audio.png";
import { useViewingBook } from "../VocabBookLayout";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";

interface Props {
  correct?: boolean;
  wrong?: boolean;
  isAnswer?: boolean;
  isClick?: boolean;
  showBtn?: boolean;
  showAnswer?: string;
  isBattle?: boolean;
  insideColor?: boolean;
  score?: number;
}

const Wrapper = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OwnerCount = styled.div``;
const CompetitorCount = styled.div``;

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

const ModeBtns = styled.div`
  display: flex;
  gap: 20px;
`;
const ReviewModeBtn = styled.button`
  cursor: pointer;
  ${(props: Props) =>
    props.isBattle &&
    css`
      border: 1px solid gray;
      color: gray;
    `}

  ${(props: Props) =>
    !props.isBattle &&
    css`
      border: none;
      font-weight: 600;
    `}
`;

const Main = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const WaitingRoomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

const StartGame = styled.button`
  width: 300px;
`;

const VocabWrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin: 50px auto;
`;

const Vocab = styled.div`
  font-weight: 600;
  font-size: 20px;
`;

const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;

const Options = styled.div`
  margin: 50px auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const Option = styled.div`
  width: 800px;
  padding: 10px;
  border: 1px solid
    ${(props: Props) => {
      if (props.showAnswer === "notAnswer") return "gray";
      if (props.showAnswer === "wrongAnswer") return "red";
      if (props.showAnswer === "correctAnswer") return "blue";
    }};
  margin-top: 20px;
  cursor: pointer;
`;

const Btns = styled.div`
  display: flex;
  gap: 10px;
`;

const Btn = styled.button`
  display: ${(props: Props) => (props.showBtn ? "flex" : "none")};
  width: 100%;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin-top: 20px;
`;

const Message = styled.div``;

const OutcomeWrapper = styled.div`
  width: 50vw;
  margin: 50px auto;
`;

const ReviewVocabs = styled.div``;
const WrongVocabs = styled.div``;
const CorrectVocabs = styled.div``;
const LabelDiv = styled.div`
  border-bottom: 1px gray solid;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  font-weight: 600;
`;
const VocabList = styled.div`
  margin-bottom: 10px;
`;

interface ReviewingQuestions {
  vocab: string;
  audioLink: string;
  partOfSpeech: string;
  definition: string;
  isCorrect: boolean;
}

interface Questions {
  audioLink?: string;
  definition: string;
  partOfSpeech: string;
  vocab: string;
}

interface RoomInfo {
  answerCount: SetStateAction<{
    owner: { correct: number; wrong: number };
    competitor: { correct: number; wrong: number };
  }>;
  pin: string;
  ownerId: string;
  competitorId: string;
  status: string;
  questions: [];
}

export default function BattleReview() {
  const navigate = useNavigate();
  const { viewingBook } = useViewingBook();
  const { vocabBooks } = useContext(vocabBookContext);
  const { isLogin, userId } = useContext(authContext);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [answerCount, setAnswerCount] = useState({
    owner: { correct: 0, wrong: 0 },
    competitor: { correct: 0, wrong: 0 },
  });

  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);
  const [reviewingQuestions, setReviewingQuestions] =
    useState<Questions[]>(questions);

  const [currentOptions, setCurrentOptions] = useState<[string, string][]>([]);
  const [showBtn, setShowBtn] = useState<boolean>(false);
  const correctVocab = reviewingQuestions?.[round];
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);
  // const randomPin = Math.floor(Math.random() * 10000);
  const pin = window.location.pathname.slice(18);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerId, setOwnerId] = useState<string>();
  const [isCompetitor, setIsCompetitor] = useState<boolean>(false);
  const [isCompetitorIn, setIsCompetitorIn] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>();
  const [countDown, setCountDown] = useState<number>(5);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (countDown > 0 && !isWaiting) {
      interval = setTimeout(() => setCountDown((prev) => prev - 1), 1000);
      console.log("countDown", countDown);
    }
    return () => clearTimeout(interval);
  }, [countDown, isWaiting]);

  useEffect(() => {
    async function startRoom() {
      await setDoc(doc(db, "battleRooms", userId + pin), {
        pin: pin,
        ownerId: userId,
        status: "waiting",
        questions: reviewingQuestions,
        answerCount: answerCount,
      });
      setOwnerId(userId);
    }
    startRoom();
  }, [answerCount, pin, reviewingQuestions, userId]);

  useEffect(() => {
    let unsub;

    const getBattleRoomData = async () => {
      let data = {} as RoomInfo;
      const roomRef = collection(db, "battleRooms");
      const q = query(roomRef, where("pin", "==", pin));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        data = doc.data() as RoomInfo;
      });
      setRoomInfo(data);
      console.log();
      if (data?.competitorId) setIsCompetitorIn(true);
      if (data?.competitorId === userId) setIsCompetitor(true);
      if (data?.ownerId === userId) setIsOwner(true);
      if (data?.questions) setReviewingQuestions(data?.questions);

      if (data?.ownerId) {
        unsub = onSnapshot(
          doc(db, "battleRooms", data?.ownerId + pin),
          (doc) => {
            console.log("onSnapshot Current data: ", doc.data());
            const data = doc.data();
            const ownerAnswerCount =
              data?.answerCount.owner.correct + data?.answerCount.owner.wrong;
            const competitorAnswerCount =
              data?.answerCount.competitor.correct +
              data?.answerCount.competitor.wrong;
            if (!isCompetitorIn && data?.competitorId) setIsCompetitorIn(true);
            if (isWaiting && data?.status === "playing") setIsWaiting(false);
            if (data?.answerCount) setAnswerCount(data?.answerCount);
            if (
              ownerAnswerCount === competitorAnswerCount &&
              ownerAnswerCount !== 0 &&
              ownerAnswerCount === round + 1 &&
              ownerAnswerCount < questionsNumber
            ) {
              setTimeout(() => {
                setRound(round + 1);
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
                setCountDown(5);
              }, 2000);
            }
            console.log("round", round);
          }
        );
      }
    };
    getBattleRoomData();

    return unsub;
  }, [isCompetitor, isCompetitorIn, isWaiting, ownerId, pin, round, userId]);

  useEffect(() => {
    const getRandomIndex = () => {
      return Math.floor(Math.random() * questionsNumber);
    };
    let randomIndex1 = getRandomIndex();
    let randomIndex2 = getRandomIndex();

    while (randomIndex1 === round) {
      randomIndex1 = getRandomIndex();
    }

    while (randomIndex2 === round || randomIndex2 === randomIndex1) {
      randomIndex2 = getRandomIndex();
    }

    const wrongVocab1 = reviewingQuestions?.[randomIndex1];
    const wrongVocab2 = reviewingQuestions?.[randomIndex2];

    const randomOptions = Object.entries({
      [correctVocab?.vocab]: correctVocab?.definition,
      [wrongVocab1?.vocab]: wrongVocab1?.definition,
      [wrongVocab2?.vocab]: wrongVocab2?.definition,
    }).sort(() => Math.random() - 0.5) as [string, string][];

    setCurrentOptions(randomOptions);
  }, [correctVocab, questionsNumber, reviewingQuestions, round]);

  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  const handleGameOver = () => {
    setShowBtn(true);
    setGameOver(true);
    setRound(0);
  };

  function handleCompetitorJoinBattle() {
    const updateCompetitor = async () => {
      const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
      await updateDoc(roomRef, {
        competitorId: userId,
      });
    };
    updateCompetitor();
  }

  function handleStartBattle() {
    const updatePlaying = async () => {
      const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
      await updateDoc(roomRef, {
        status: "playing",
      });
    };
    updatePlaying();
  }

  function handleSyncScore() {
    const updateScore = async () => {
      const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
      await updateDoc(roomRef, {
        answerCount: answerCount,
      });
    };
    updateScore();
  }

  function renderWaiting() {
    return (
      <Main>
        <WaitingRoomWrapper>
          PIN Code: {pin}
          {isOwner ? (
            isCompetitorIn ? (
              <StartGame onClick={handleStartBattle}>Start</StartGame>
            ) : (
              <p>Waiting for the competitor joining the battle</p>
            )
          ) : isCompetitorIn ? (
            <p>Waiting for the owner starting the battle</p>
          ) : (
            <button onClick={handleCompetitorJoinBattle}>
              Join the battle!
            </button>
          )}
        </WaitingRoomWrapper>
      </Main>
    );
  }

  const renderTest = () => {
    return (
      <Main>
        <VocabWrapper>
          <Vocab>{correctVocab?.vocab}</Vocab>
          <p>({correctVocab?.partOfSpeech})</p>
          {correctVocab?.audioLink ? (
            <AudioImg
              src={audio}
              alt="audio"
              onClick={() =>
                correctVocab?.audioLink &&
                handlePlayAudio(correctVocab?.audioLink)
              }
            />
          ) : (
            ""
          )}
        </VocabWrapper>
        <Options>
          {currentOptions?.map(([clickedVocab, def], index) => (
            <Option
              key={clickedVocab}
              showAnswer={showAnswerArr[index]}
              onClick={() => {
                if (!showBtn) {
                  let answerStatus = [...currentOptions].map(
                    ([vocabOption, insideDef], index) => {
                      if (vocabOption === correctVocab?.vocab)
                        return "correctAnswer";
                      if (
                        clickedVocab !== vocabOption &&
                        vocabOption !== correctVocab?.vocab
                      )
                        return "notAnswer";
                      else return "wrongAnswer";
                    }
                  );
                  setShowAnswerArr(answerStatus);

                  if (clickedVocab === correctVocab?.vocab) {
                    if (isOwner) answerCount.owner.correct += 1;
                    if (isCompetitor) answerCount.competitor.correct += 1;
                    // reviewingQuestions[round].isCorrect = true;
                    setReviewingQuestions(reviewingQuestions);
                  } else {
                    if (isOwner) answerCount.owner.wrong += 1;
                    if (isCompetitor) answerCount.competitor.wrong += 1;
                    // reviewingQuestions[round].isCorrect = false;
                    setReviewingQuestions(reviewingQuestions);
                  }
                  // setAnswerCount(answerCount);
                  handleSyncScore();
                }
              }}
            >
              {def}
            </Option>
          ))}
          {round === questionsNumber - 1 ? (
            <Btn
              showBtn={showBtn}
              onClick={() => {
                handleGameOver();
              }}
            >
              Done
            </Btn>
          ) : (
            <Btn
              showBtn={showBtn}
              onClick={() => {
                setShowBtn(false);
                setRound(round + 1);
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
              }}
            >
              Next
            </Btn>
          )}
        </Options>
      </Main>
    );
  };

  return isLogin ? (
    <Wrapper>
      <div>Review Round: {gameOver ? questionsNumber : round + 1}</div>
      <Header>
        <OwnerCount>
          <div>
            <p>Owner</p>
            O: {answerCount.owner.correct} X: {answerCount.owner.wrong} / Total:{" "}
            {questionsNumber} (
            {Math.ceil((answerCount.owner.correct / questionsNumber) * 100)}%)
          </div>
          <ScoreBar insideColor={true} score={answerCount.owner.correct}>
            <ScoreBar>
              {Math.ceil((answerCount.owner.correct / questionsNumber) * 100)}%
            </ScoreBar>
          </ScoreBar>
        </OwnerCount>
        {isWaiting ? <></> : <p>{countDown} seconds left</p>}
        <CompetitorCount>
          <div>
            <p>Competitor</p>
            O: {answerCount.competitor.correct} X:{" "}
            {answerCount.competitor.wrong} / Total: {questionsNumber} (
            {Math.ceil(
              (answerCount.competitor.correct / questionsNumber) * 100
            )}
            %)
          </div>
          <ScoreBar insideColor={true} score={answerCount.competitor.correct}>
            <ScoreBar>
              {Math.ceil(
                (answerCount.competitor.correct / questionsNumber) * 100
              )}
              %
            </ScoreBar>
          </ScoreBar>
        </CompetitorCount>
      </Header>
      {isWaiting ? <>{renderWaiting()}</> : <>{renderTest()}</>}
    </Wrapper>
  ) : (
    <Wrapper>
      <p>Please log in to battle!</p>
    </Wrapper>
  );
}
