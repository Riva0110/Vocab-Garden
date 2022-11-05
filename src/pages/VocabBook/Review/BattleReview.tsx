import styled, { css } from "styled-components";
import { useContext, useState, useEffect } from "react";
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
}

const Wrapper = styled.div`
  width: 100vw;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
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

const questionsNumber = 5;

interface ReviewingQuestions {
  vocab: string;
  audioLink: string;
  partOfSpeech: string;
  definition: string;
  isCorrect: boolean;
}

interface RoomInfo {
  pin: string;
  ownerId: string;
  competitorId: string;
  status: string;
  questions: [];
}

export default function BattleReview() {
  const navigate = useNavigate();
  const { viewingBook } = useViewingBook();
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const { isLogin, userId } = useContext(authContext);
  const [isBattle, setIsBattle] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [pin, setPin] = useState<number>();
  const [answerCount, setAnswerCount] = useState({ correct: 0, wrong: 0 });
  const [reviewingQuestions, setReviewingQuestions] = useState();
  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);
  // const [isBattle, setIsBattle] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  // const [round, setRound] = useState<number>(0);
  // const [answerCount, setAnswerCount] = useState({ correct: 0, wrong: 0 });
  // const [gameOver, setGameOver] = useState(false);
  // const [score, setScore] = useState<number>();
  // const [isChallenging, setIsChallenging] = useState<boolean>();
  // const [currentOptions, setCurrentOptions] = useState<[string, string][]>([]);
  // const [showBtn, setShowBtn] = useState<boolean>(false);
  // const questions = vocabBooks?.[viewingBook]
  //   ?.sort(() => Math.random() - 0.5)
  //   .slice(0, questionsNumber);
  // const [reviewingQuestions, setReviewingQuestions] =
  //   useState<ReviewingQuestions[]>(questions);
  // const correctVocab = reviewingQuestions?.[round];
  // const [showAnswerArr, setShowAnswerArr] = useState([
  //   "notAnswer",
  //   "notAnswer",
  //   "notAnswer",
  // ]);
  // const randomPin = Math.floor(Math.random() * 10000);
  const reviewBattlePathName = window.location.pathname.slice(18);
  // const [pin, setPin] = useState<number>(randomPin);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isCompetitor, setIsCompetitor] = useState<boolean>(false);
  const [isCompetitorIn, setIsCompetitorIn] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>();

  useEffect(() => {
    let unsub;
    if (reviewBattlePathName === pin?.toString()) {
      unsub = onSnapshot(doc(db, "battleRooms", userId + pin), (doc) => {
        console.log("Current data: ", doc.data());
        const data = doc.data();
        if (data && data.competitorId !== "") setIsCompetitorIn(true);
        if (data && data.status !== "playing") setIsBattle(true);
      });

      setIsBattle(true);
      setIsWaiting(true);

      const checkWhoIsPlaying = async () => {
        let data = {} as RoomInfo;
        const citiesRef = collection(db, "battleRooms");
        const q = query(citiesRef, where("pin", "==", reviewBattlePathName));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
          data = doc.data() as RoomInfo;
        });
        setRoomInfo(data);
        if (data && data.competitorId !== "") setIsCompetitorIn(true);
        if (data && data.competitorId === userId) setIsCompetitor(true);
        if (data && data.ownerId === userId) setIsOwner(true);
      };
      checkWhoIsPlaying();
    }
    return unsub;
  }, [pin, reviewBattlePathName, userId]);

  useEffect(() => {
    if (reviewBattlePathName === pin?.toString()) {
      if (userId === roomInfo?.ownerId) setIsOwner(true);
    }
  }, [userId, roomInfo, reviewBattlePathName, pin]);

  const startRoom = async () => {
    await setDoc(doc(db, "battleRooms", userId + reviewBattlePathName), {
      pin: reviewBattlePathName,
      ownerId: userId,
      status: "waiting",
      questions: reviewingQuestions,
    });
  };

  function waitingBattle() {
    function handleCompetitor() {
      setIsCompetitorIn(true);
      const updateCompetitor = async () => {
        const roomRef = doc(
          db,
          "battleRooms",
          roomInfo?.ownerId + reviewBattlePathName
        );
        await updateDoc(roomRef, {
          competitorId: userId,
        });
      };
      updateCompetitor();
    }

    function handleStartBattle() {
      setIsBattle(true);
      const updatePlaying = async () => {
        const roomRef = doc(
          db,
          "battleRooms",
          roomInfo?.ownerId + reviewBattlePathName
        );
        await updateDoc(roomRef, {
          status: "playing",
        });
      };
      updatePlaying();
    }

    return (
      <Main>
        <WaitingRoomWrapper>
          PIN Code: {reviewBattlePathName}
          {isOwner ? (
            isCompetitorIn ? (
              <StartGame onClick={handleStartBattle}>Start</StartGame>
            ) : (
              <p>Waiting for the competitor joining the battle</p>
            )
          ) : isCompetitorIn ? (
            <p>Waiting for the owner starting the battle</p>
          ) : (
            <button onClick={handleCompetitor}>Join the battle!</button>
          )}
        </WaitingRoomWrapper>
      </Main>
    );
  }

  return isLogin ? (
    <Wrapper>
      <Header>
        <div>Review Round: {gameOver ? questionsNumber : round + 1}</div>
        <ModeBtns>
          {isOwner ? (
            <ReviewModeBtn
              isBattle={isBattle}
              onClick={() => {
                setIsBattle(false);
                setIsWaiting(false);
                navigate("/vocabbook/review");
              }}
            >
              Single Mode
            </ReviewModeBtn>
          ) : (
            <></>
          )}
          <ReviewModeBtn
            isBattle={!isBattle}
            onClick={() => {
              setIsBattle(true);
              setIsWaiting(true);
              startRoom();
              navigate(
                `/vocabbook/review/${Math.floor(Math.random() * 10000)}`
              );
            }}
          >
            Battle Mode
          </ReviewModeBtn>
        </ModeBtns>
        <div>
          O: {answerCount.correct} X: {answerCount.wrong} / Total:{" "}
          {questionsNumber} (
          {Math.ceil((answerCount.correct / questionsNumber) * 100)}%)
        </div>
      </Header>
      {isWaiting ? <>{waitingBattle()}</> : <></>}
    </Wrapper>
  ) : (
    <Wrapper>
      {reviewBattlePathName === pin?.toString() ? (
        <p>Please log in to battle!</p>
      ) : (
        <p>Please log in to review!</p>
      )}
    </Wrapper>
  );
}
