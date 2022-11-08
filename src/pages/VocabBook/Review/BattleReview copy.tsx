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

interface Questions {
  ownerIsCorrect?: boolean;
  competitorIsCorrect?: boolean;
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
  ownerName: string;
  competitorId: string;
  competitorName: string;
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
    .slice(0, questionsNumber)
    .map((question) => ({
      ...question,
      ownerIsCorrect: false,
      competitorIsCorrect: false,
    }));

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
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [ownerId, setOwnerId] = useState<string>();
  // const [competitorId, setCompetitorId] = useState<string>();
  const [isCompetitor, setIsCompetitor] = useState<boolean>(false);
  const [isCompetitorIn, setIsCompetitorIn] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>();
  const [countDown, setCountDown] = useState<number>(5);
  // const [ownerName, setOwnerName] = useState<string>();
  // const [competitorName, setCompetitorName] = useState<string>();

  // useEffect(() => {
  //   const getUserInfo = async () => {
  //     const docRef = doc(db, "users", userId);
  //     const docSnap: any = await getDoc(docRef);
  //     if (isOwner) setOwnerName(docSnap.data().name);
  //     if (isCompetitor) setCompetitorName(docSnap.data().name);
  //   };
  //   getUserInfo();
  // }, [isCompetitor, isOwner, userId]);

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
        competitorId: "",
        // ownerName: ownerName,
        status: "waiting",
        questions: reviewingQuestions,
        answerCount: answerCount,
      });
      setOwnerId(userId);
    }
    startRoom();
  }, []);

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
      if (data?.competitorId) setIsCompetitorIn(true);
      if (data?.competitorId === userId) {
        setIsCompetitor(true);
      }
      if (data?.ownerId === userId) setIsOwner(true);
      if (data?.questions) setReviewingQuestions(data?.questions);
      // if (data?.ownerName) setOwnerName(data?.ownerName);

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
            if (data?.competitorId) {
              console.log("data?.competitorId", data?.competitorId);
              setIsCompetitorIn(true);
              // setCompetitorName(data?.competitorName);
            }
            if (isWaiting && data?.status === "playing") setIsWaiting(false);
            if (data?.answerCount) setAnswerCount(data?.answerCount);
            if (data?.status === "finished")
              setReviewingQuestions(data?.questions);
            // if (
            //   ownerAnswerCount === competitorAnswerCount &&
            //   ownerAnswerCount !== 0 &&
            //   ownerAnswerCount === round + 1 &&
            //   ownerAnswerCount < questionsNumber
            // ) {
            //   setIsAnswered(false);
            //   setTimeout(() => {
            //     setRound((round) => round + 1);
            //     setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
            //     setCountDown(5);
            //   }, 500);
            // }
          }
        );
      }
    };
    getBattleRoomData();

    return unsub;
  }, [isWaiting, pin, round, userId]);

  useEffect(() => {
    if (countDown === 0) {
      if (answerCount.owner.correct + answerCount.owner.wrong < round + 1)
        answerCount.owner.wrong += 1;
      if (
        answerCount.competitor.correct + answerCount.competitor.wrong <
        round + 1
      )
        answerCount.competitor.wrong += 1;

      handleSyncScore();
    }

    if (countDown === 0 && round + 1 < questionsNumber) {
      // handleSyncScore();
      setIsAnswered(false);
      setTimeout(() => {
        setRound((round) => round + 1);
        setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
        setCountDown(5);
      }, 500);
    }

    if (countDown === 0 && round + 1 === questionsNumber) {
      setGameOver(true);
      setIsAnswered(true);
      // function handleGameOver() {
      // setShowBtn(true);

      // setRound(0);
      const updateFinished = async () => {
        const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
        await updateDoc(roomRef, {
          status: "finished",
        });
      };
      updateFinished();
      setShowBtn(true);
      // }
      // handleGameOver();
    }
  }, [
    answerCount.competitor,
    answerCount.owner,
    countDown,
    pin,
    roomInfo?.ownerId,
  ]);

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

  function handleCompetitorJoinBattle() {
    const updateCompetitor = async () => {
      const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
      await updateDoc(roomRef, {
        competitorId: userId,
        // competitorName: competitorName,
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

  function handleSyncIsCorrect(addIsCorrectInQuestions: Questions[]) {
    const updateIsCorrect = async () => {
      const roomRef = doc(db, "battleRooms", roomInfo?.ownerId + pin);
      await updateDoc(roomRef, {
        questions: addIsCorrectInQuestions,
      });
    };
    updateIsCorrect();
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
                if (!isAnswered) {
                  setIsAnswered(true);
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

                  const addIsCorrectInQuestions = [...reviewingQuestions];

                  if (clickedVocab === correctVocab?.vocab) {
                    if (isOwner) {
                      answerCount.owner.correct += 1;
                      addIsCorrectInQuestions[round].ownerIsCorrect = true;
                    }
                    if (isCompetitor) {
                      answerCount.competitor.correct += 1;
                      addIsCorrectInQuestions[round].competitorIsCorrect = true;
                    }
                  } else {
                    if (isOwner) {
                      answerCount.owner.wrong += 1;
                      addIsCorrectInQuestions[round].ownerIsCorrect = false;
                    }
                    if (isCompetitor) {
                      answerCount.competitor.wrong += 1;
                      addIsCorrectInQuestions[round].competitorIsCorrect =
                        false;
                    }
                  }
                  // setAnswerCount(answerCount);
                  // setReviewingQuestions(reviewingQuestions);
                  handleSyncIsCorrect(addIsCorrectInQuestions);
                  handleSyncScore();
                  // console.log(reviewingQuestions);
                }
              }}
            >
              {" "}
              {def}
            </Option>
          ))}
        </Options>
      </Main>
    );
  };

  function renderOutcomeVocabList(
    vocab: string,
    partOfSpeech: string,
    definition: string,
    audioLink?: string
  ) {
    return (
      <VocabList key={vocab + partOfSpeech}>
        {vocab}{" "}
        {audioLink ? (
          <AudioImg
            src={audio}
            alt="audio"
            onClick={() => handlePlayAudio(audioLink)}
          />
        ) : (
          ""
        )}
        : ({partOfSpeech}) {definition}
      </VocabList>
    );
  }

  function renderOutcome() {
    return (
      <Main>
        <OutcomeWrapper>
          <Message>
            {isOwner
              ? (answerCount.owner.correct / questionsNumber) * 100 >= 80
                ? " 你太棒了！！！我服了你 "
                : "加油，好嗎？我對你太失望了"
              : (answerCount.competitor.correct / questionsNumber) * 100 >= 80
              ? " 你太棒了！！！我服了你 "
              : "加油，好嗎？我對你太失望了"}
          </Message>
          <Btns>
            <Btn showBtn={showBtn} onClick={() => navigate("/vocabbook")}>
              Back to VocabBooks
            </Btn>
          </Btns>
          <ReviewVocabs>
            <WrongVocabs>
              <LabelDiv>Wrong vocab:</LabelDiv>{" "}
              {isOwner &&
                reviewingQuestions.map(
                  ({
                    vocab,
                    audioLink,
                    partOfSpeech,
                    definition,
                    ownerIsCorrect,
                  }) => {
                    if (!ownerIsCorrect) {
                      return renderOutcomeVocabList(
                        vocab,
                        partOfSpeech,
                        definition,
                        audioLink
                      );
                    } else {
                      return <></>;
                    }
                  }
                )}
              {isCompetitor &&
                reviewingQuestions.map(
                  ({
                    vocab,
                    audioLink,
                    partOfSpeech,
                    definition,
                    competitorIsCorrect,
                  }) => {
                    if (!competitorIsCorrect) {
                      return renderOutcomeVocabList(
                        vocab,
                        partOfSpeech,
                        definition,
                        audioLink
                      );
                    } else {
                      return <></>;
                    }
                  }
                )}
            </WrongVocabs>
            <CorrectVocabs>
              <LabelDiv>Correct vocab:</LabelDiv>{" "}
              {isOwner &&
                reviewingQuestions.map(
                  ({
                    vocab,
                    audioLink,
                    partOfSpeech,
                    definition,
                    ownerIsCorrect,
                  }) => {
                    if (ownerIsCorrect) {
                      return renderOutcomeVocabList(
                        vocab,
                        partOfSpeech,
                        definition,
                        audioLink
                      );
                    } else {
                      return <></>;
                    }
                  }
                )}
              {isCompetitor &&
                reviewingQuestions.map(
                  ({
                    vocab,
                    audioLink,
                    partOfSpeech,
                    definition,
                    competitorIsCorrect,
                  }) => {
                    if (competitorIsCorrect) {
                      return renderOutcomeVocabList(
                        vocab,
                        partOfSpeech,
                        definition,
                        audioLink
                      );
                    } else {
                      return <></>;
                    }
                  }
                )}
            </CorrectVocabs>
          </ReviewVocabs>
        </OutcomeWrapper>
      </Main>
    );
  }

  return isLogin ? (
    <Wrapper>
      <div>Review Round: {gameOver ? questionsNumber : round + 1}</div>
      <Header>
        <OwnerCount>
          <div>
            <p>Owner: ownerName</p>
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
            <p>Competitor: competitorName</p>
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
      {isWaiting ? renderWaiting() : gameOver ? renderOutcome() : renderTest()}
    </Wrapper>
  ) : (
    <Wrapper>
      <p>Please log in to battle!</p>
    </Wrapper>
  );
}
