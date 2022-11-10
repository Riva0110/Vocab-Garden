import styled, { css } from "styled-components";
import { useContext, useState, useEffect, useCallback } from "react";
import { authContext } from "../../../context/authContext";
import audio from "../../../components/audio.png";
import { useReviewLayout } from "./ReviewLayout";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  where,
  query,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { useParams } from "react-router-dom";

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
  margin-top: 20px;
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
  margin-top: 20px;
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
  color: green;
`;
const VocabList = styled.div`
  margin-bottom: 10px;
`;

const Title = styled.div`
  margin-top: 50px;
  border-bottom: 1px solid gray;
`;

const InviteWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Email = styled.div``;

interface AnswerCount {
  owner: { correct: number; wrong: number };
  competitor: { correct: number; wrong: number };
}

interface Questions {
  ownerIsCorrect?: boolean;
  competitorIsCorrect?: boolean;
  audioLink?: string;
  definition: string;
  partOfSpeech: string;
  vocab: string;
  isCorrect?: boolean;
}

interface RoomInfo {
  answerCount: AnswerCount;
  roomId: string;
  ownerId: string;
  ownerName: string;
  competitorId: string;
  competitorName: string;
  status: string;
  questions: Questions[];
}

export default function BattleReview() {
  const navigate = useNavigate();
  const { pin } = useParams();
  const { isLogin, userId } = useContext(authContext);
  const { questionsNumber, setIsBattle } = useReviewLayout();
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);

  const [reviewingQuestionsArr, setReviewingQuestionsArr] =
    useState<Questions[]>();
  const [outcomeVocabList, setOutcomeVocabList] = useState<Questions[]>();

  const correctVocab = reviewingQuestionsArr?.[round];
  const [currentOptions, setCurrentOptions] = useState<[string, string][]>([]);

  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [ownerName, setOwnerName] = useState<string>("");
  const [competitorName, setCompetitorName] = useState<string>("");
  const [isVisitor, setIsVisitor] = useState<boolean>(false);
  const [isCompetitorIn, setIsCompetitorIn] = useState<boolean>(false);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answerCount, setAnswerCount] = useState({
    owner: { correct: 0, wrong: 0 },
    competitor: { correct: 0, wrong: 0 },
  });
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);
  const [countDown, setCountDown] = useState<number>(5);
  const [showBtn, setShowBtn] = useState<boolean>(false);
  const [friendList, setFriendList] = useState<string[]>();
  const [hasInvited, setHasInvited] = useState<boolean[]>([]);
  const [friendState, setFriendState] = useState<string[]>(["offline"]);

  const handleSyncScore = useCallback(
    async (answerCountAfterClick: AnswerCount) => {
      if (pin) {
        const roomRef = doc(db, "battleRooms", pin);
        await updateDoc(roomRef, {
          answerCount: answerCountAfterClick,
        });
      }
    },
    [pin]
  );

  useEffect(() => {
    async function getRoomInfo() {
      if (pin) {
        const roomRef = doc(db, "battleRooms", pin);
        const docSnap = await getDoc(roomRef);
        const data = docSnap.data() as RoomInfo;
        setReviewingQuestionsArr(data.questions);
        setOutcomeVocabList(data.questions);
        setOwnerName(data.ownerName);
      }
    }
    getRoomInfo();
    setIsBattle(true);
  }, [pin, setIsBattle]);

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

    if (reviewingQuestionsArr && correctVocab) {
      const wrongVocab1 = reviewingQuestionsArr[randomIndex1];
      const wrongVocab2 = reviewingQuestionsArr[randomIndex2];

      const randomOptions = Object.entries({
        [correctVocab?.vocab]: correctVocab?.definition,
        [wrongVocab1?.vocab]: wrongVocab1?.definition,
        [wrongVocab2?.vocab]: wrongVocab2?.definition,
      }).sort(() => Math.random() - 0.5) as [string, string][];

      setCurrentOptions(randomOptions);
    }
  }, [correctVocab, questionsNumber, reviewingQuestionsArr, round]);

  useEffect(() => {
    let newFriendState: any = [];
    friendList?.forEach((friendEmail) => {
      async function checkState() {
        const friendRef = collection(db, "users");
        const q = query(friendRef, where("email", "==", friendEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((friendDoc) => {
          newFriendState = [...newFriendState, friendDoc.data().state];
          console.log("newFriendState", newFriendState);
        });
        setFriendState(newFriendState);
      }
      checkState();
    });
  }, [friendList]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", userId), (doc) => {
      setFriendList(doc.data()?.friendList);
    });

    return unsub;
  }, [userId]);

  useEffect(() => {
    let unsub;

    if (pin) {
      unsub = onSnapshot(doc(db, "battleRooms", pin), (doc) => {
        console.log("onSnapshot Current data: ", doc.data());
        const data = doc.data() as RoomInfo;
        const ownerAnswerCount =
          data?.answerCount.owner.correct + data?.answerCount.owner.wrong;
        const competitorAnswerCount =
          data?.answerCount.competitor.correct +
          data?.answerCount.competitor.wrong;

        if (isCompetitorIn && !isOwner && userId !== data.competitorId)
          setIsVisitor(true);
        console.log(isOwner, userId, data.competitorId);
        if (data.ownerId !== userId) setIsOwner(false);
        if (data.competitorId) setIsCompetitorIn(true);
        if (data.competitorName !== "") setCompetitorName(data.competitorName);
        if (isWaiting && data?.status === "playing") setIsWaiting(false);
        if (data.answerCount) setAnswerCount(data.answerCount);
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
            setIsAnswered(false);
          }, 500);
        }
      });
    }

    return unsub;
  }, [isCompetitorIn, isOwner, isWaiting, pin, questionsNumber, round, userId]);

  useEffect(() => {
    let countDownTimer: string | number | NodeJS.Timeout | undefined;
    if (countDown > 0 && !isWaiting) {
      countDownTimer = setTimeout(() => setCountDown((prev) => prev - 1), 1000);
      console.log("countDown", countDown);
    }
    return () => clearTimeout(countDownTimer);
  }, [countDown, isWaiting]);

  useEffect(() => {
    if (countDown === 0 && !isAnswered && outcomeVocabList) {
      const answerCountAfterClick = {
        owner: { ...answerCount.owner },
        competitor: { ...answerCount.competitor },
      };

      const vocabListAfterTimeup = [...outcomeVocabList];

      if (answerCount.owner.correct + answerCount.owner.wrong < round + 1)
        answerCountAfterClick.owner.wrong += 1;
      vocabListAfterTimeup[round].isCorrect = false;
      if (
        answerCount.competitor.correct + answerCount.competitor.wrong <
        round + 1
      )
        answerCountAfterClick.competitor.wrong += 1;
      vocabListAfterTimeup[round].isCorrect = false;

      handleSyncScore(answerCountAfterClick);
      setOutcomeVocabList(vocabListAfterTimeup);
    }

    if (countDown === 0 && round + 1 < questionsNumber) {
      setTimeout(() => {
        setRound(round + 1);
        setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
        setCountDown(5);
        setIsAnswered(false);
      }, 500);
    }

    if (countDown === 0 && round + 1 === questionsNumber) {
      setGameOver(true);
      setIsAnswered(true);
      setShowBtn(true);

      const updateFinished = async () => {
        if (pin) {
          const roomRef = doc(db, "battleRooms", pin);
          await updateDoc(roomRef, {
            status: "finished",
          });
        }
      };
      updateFinished();

      const checkUserScoreStatus = async () => {
        const docRef = doc(db, "users", userId);
        const docSnap: any = await getDoc(docRef);

        const score = docSnap.data().currentScore;
        const isChallenging = docSnap.data().isChallenging;

        if (isChallenging) {
          if (typeof score === "number" && score < 5) {
            await updateDoc(docRef, {
              currentScore: score + 1,
              lastTimeUpdateScore: new Date(),
              isDying: false,
            });
          }
        }
      };

      if (
        isOwner &&
        (answerCount.owner.correct / questionsNumber) * 100 >= 80 &&
        answerCount.owner.correct > answerCount.competitor.correct
      )
        checkUserScoreStatus();

      if (
        !isOwner &&
        (answerCount.competitor.correct / questionsNumber) * 100 >= 80 &&
        answerCount.owner.correct < answerCount.competitor.correct
      )
        checkUserScoreStatus();
    }
  }, [
    answerCount.competitor,
    answerCount.owner,
    countDown,
    handleSyncScore,
    isAnswered,
    isOwner,
    outcomeVocabList,
    pin,
    questionsNumber,
    round,
    userId,
  ]);

  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  async function handleCompetitorJoinBattle() {
    const getUserInfo = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap: any = await getDoc(docRef);

      if (pin) {
        const roomRef = doc(db, "battleRooms", pin);
        await updateDoc(roomRef, {
          competitorId: userId,
          competitorName: docSnap.data().name,
        });
      }
    };
    getUserInfo();
  }

  async function handleStartBattle() {
    if (pin) {
      const roomRef = doc(db, "battleRooms", pin);
      await updateDoc(roomRef, {
        status: "playing",
      });
    }
  }

  const handleInviteFriendBattle = async (
    friendEmail: string,
    index: number
  ) => {
    if (hasInvited[index]) return;
    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", friendEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) alert("The user doesn't exist!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          battleInvitation: arrayUnion({
            ownerName,
            pin: pin,
          }),
        });
      };
      updateFriendStatus();
    });
  };

  function renderWaiting() {
    return (
      <Main>
        <WaitingRoomWrapper>
          PIN Code: {pin}
          {isOwner ? (
            isCompetitorIn ? (
              <StartGame onClick={handleStartBattle}>Start</StartGame>
            ) : (
              <>
                <p>Waiting for the competitor joining the battle</p>
                <Title>Friend List</Title>
                {friendList?.map((friendEmail, index) => (
                  <InviteWrapper>
                    <Email key={friendEmail}>{friendEmail}</Email>
                    <div>{friendState[index]}</div>
                    <button
                      onClick={() => {
                        const newHasInvited = [...hasInvited];
                        newHasInvited[index] = true;
                        setHasInvited(newHasInvited);
                        handleInviteFriendBattle(friendEmail, index);
                      }}
                    >
                      {" "}
                      {!hasInvited[index] ? "Invite" : "Inviting"}
                    </button>
                  </InviteWrapper>
                ))}
              </>
            )
          ) : isCompetitorIn ? (
            <p>Waiting for the owner starting the battle</p>
          ) : (
            <StartGame onClick={handleCompetitorJoinBattle}>
              Join the battle!
            </StartGame>
          )}
        </WaitingRoomWrapper>
      </Main>
    );
  }

  function renderTest() {
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

                  if (outcomeVocabList) {
                    const answerCountAfterClick = {
                      owner: { ...answerCount.owner },
                      competitor: { ...answerCount.competitor },
                    };

                    const vocabListAfterClick = [...outcomeVocabList];

                    console.log("vocabListAfterClick []", vocabListAfterClick);

                    if (clickedVocab === correctVocab?.vocab) {
                      if (isOwner) answerCountAfterClick.owner.correct += 1;
                      else answerCountAfterClick.competitor.correct += 1;

                      vocabListAfterClick[round].isCorrect = true;
                    } else {
                      if (isOwner) answerCountAfterClick.owner.wrong += 1;
                      else answerCountAfterClick.competitor.wrong += 1;

                      vocabListAfterClick[round].isCorrect = false;
                    }

                    console.log(
                      "vocabListAfterClick [after]",
                      vocabListAfterClick
                    );
                    handleSyncScore(answerCountAfterClick);
                    setOutcomeVocabList(vocabListAfterClick);
                    console.log("vocabListAfterClick", vocabListAfterClick);
                  }
                }
              }}
            >
              {def}
            </Option>
          ))}
        </Options>
      </Main>
    );
  }

  if (outcomeVocabList)
    console.log("outcomeVocabList [global]", outcomeVocabList);

  function renderOutcomeVocabList(
    vocab: string,
    partOfSpeech: string,
    definition: string,
    audioLink?: string
  ) {
    return (
      <VocabList key={vocab + partOfSpeech}>
        <strong>{vocab}</strong>{" "}
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
              {outcomeVocabList?.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  if (!isCorrect) {
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
              {outcomeVocabList?.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  if (isCorrect) {
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
    !isVisitor ? (
      <Wrapper>
        <div>Review Round: {round + 1}</div>
        <Header>
          <OwnerCount>
            <div>
              <p>Owner: {ownerName}</p>
              O: {answerCount.owner.correct} X: {answerCount.owner.wrong} /
              Total: {questionsNumber} (
              {Math.ceil((answerCount.owner.correct / questionsNumber) * 100)}%)
            </div>
            <ScoreBar insideColor={true} score={answerCount.owner.correct}>
              <ScoreBar>
                {Math.ceil((answerCount.owner.correct / questionsNumber) * 100)}
                %
              </ScoreBar>
            </ScoreBar>
          </OwnerCount>
          {isWaiting ? <></> : <p>{countDown} seconds left</p>}
          <CompetitorCount>
            <div>
              <p>Competitor: {competitorName}</p>
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
        {isWaiting
          ? renderWaiting()
          : gameOver
          ? renderOutcome()
          : renderTest()}
      </Wrapper>
    ) : (
      <Wrapper>
        <p>The game has started.</p>
      </Wrapper>
    )
  ) : (
    <Wrapper>
      <p>Please log in to battle!</p>
    </Wrapper>
  );
}
