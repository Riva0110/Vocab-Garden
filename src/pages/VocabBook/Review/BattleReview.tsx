import styled, { css } from "styled-components";
import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  increment,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import audio from "../../../components/audio.png";
import { AuthContext } from "../../../context/AuthContext";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";
import { useReviewLayout } from "./ReviewLayout";
import plant from "./battlePlant.webp";
import correct from "./correct.png";
import wrong from "./wrong.png";

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
  stateColor?: string;
}

const Wrapper = styled.div`
  width: 100%;
  z-index: 1;
`;

const HasStarted = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
`;

const Img = styled.img`
  width: 300px;
  position: fixed;
  left: 100px;
  bottom: 0;
  opacity: 0.4;
  @media screen and (max-height: 701px) {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ScoreCount = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AnsImg = styled.img`
  width: 20px;
  height: 20px;
`;

const RoundCount = styled.div`
  margin-top: 20px;
  text-align: center;
  margin-bottom: 10px;
`;

const OwnerCount = styled.div`
  text-align: center;
`;

const CountDown = styled.div`
  background-color: #f4e073;
  text-align: center;
  width: 50px;
  height: 30px;
  line-height: 30px;
  padding: 0 5px;
  border-radius: 10px;
`;

const CompetitorCount = styled.div`
  text-align: center;
`;

const Div = styled.div`
  width: 200px;
  text-align: center;
  @media screen and (max-width: 601px) {
    width: 150px;
  }
`;

const ScoreBar = styled.div`
  width: 200px;
  height: 30px;
  line-height: 30px;
  border: 1px solid gray;
  border-radius: 20px;
  margin-top: 10px;
  z-index: 3;
  ${(props: Props) =>
    props.insideColor &&
    css`
      border: 0px;
      background-color: #95caca;
      width: ${(props: Props) =>
        props.score ? `${props.score * 40}px` : "0px"};
      z-index: 2;
      margin-bottom: 20px;
    `}
  @media screen and (max-width: 601px) {
    width: 150px;
    ${(props: Props) =>
      props.insideColor &&
      css`
        width: ${(props: Props) =>
          props.score ? `${props.score * 30}px` : "0px"};
      `}
  }
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
  margin: 50px auto;
  width: 500px;
  padding: 20px 0;
  @media screen and (max-width: 601px) {
    width: 100%;
  }
`;

const Pin = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const WaitingMessage = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-top: 20px;
  @media screen and (max-width: 601px) {
    font-size: 16px;
  }
`;

const VocabWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-items: center;
  margin: 0px auto;
  background-color: rgb(255, 255, 255, 0.6);
  padding: 30px;
  border-radius: 30px;
`;

const Vocab = styled.div`
  font-weight: 600;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
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
  background-color: rgb(255, 255, 255, 0.7);
  z-index: 1;
  width: 800px;
  max-width: 90vw;
  padding: 10px;
  border: solid 1px gray;
  background-color: ${(props: Props) => {
    if (props.showAnswer === "wrongAnswer") return "#f1d8dc";
    if (props.showAnswer === "correctAnswer") return "#d2e1ed";
  }};
  margin-top: 20px;
  cursor: pointer;
`;

const Btns = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Message = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const OutcomeWrapper = styled.div`
  width: 70vw;
  margin: 20px auto;
  @media screen and (min-width: 1441px) {
    width: 50vw;
  }
  @media screen and (max-width: 601px) {
    width: 90vw;
  }
`;

const ReviewVocabs = styled.div`
  position: relative;
  background-color: rgb(255, 255, 255, 0.7);
  z-index: 100;
  border: 1px solid gray;
  padding: 20px;
  margin-top: 20px;
`;

const WrongVocabs = styled.div``;

const CorrectVocabs = styled.div``;

const LabelDiv = styled.div`
  border-bottom: 1px gray solid;
  padding-bottom: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  font-weight: 600;
  color: darkgreen;
  text-align: center;
`;

const VocabList = styled.div`
  margin-bottom: 30px;
  font-size: 14px;
`;

const VocabDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #607973;
  font-size: 16px;
`;

const Title = styled.div`
  margin-top: 50px;
  border-bottom: 1px solid gray;
  color: #607973;
  font-weight: 600;
  width: 400px;
  @media screen and (max-width: 601px) {
    width: 100%;
  }
`;

const InviteWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  width: 400px;
  @media screen and (max-width: 601px) {
    width: 100%;
  }
`;

const Email = styled.div`
  color: gray;
`;

const FriendStateWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  color: ${(props: Props) => (props.stateColor === "online" ? "green" : "")};
`;

const FriendState = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  border: 1px solid
    ${(props: Props) => (props.stateColor === "online" ? "green" : "gray")};
  background-color: ${(props: Props) =>
    props.stateColor === "online" ? "green" : "white"};
`;

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
  invitingList: string[];
}

// eslint-disable-next-line no-unused-vars
type AddFunction = (msg: string) => void;

export default function BattleReviewWrapper() {
  const { pin } = useParams();
  return <BattleReview pin={pin ?? ""} key={pin} />;
}

function BattleReview({ pin }: { pin: string }) {
  const navigate = useNavigate();
  const { isLogin, userId } = useContext(AuthContext);
  const { questionsNumber, setIsBattle } = useReviewLayout();
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);

  const [reviewingQuestionsArr, setReviewingQuestionsArr] =
    useState<Questions[]>();
  const [outcomeVocabList, setOutcomeVocabList] = useState<Questions[]>([]);

  const correctVocab = reviewingQuestionsArr?.[round];
  const [currentOptions, setCurrentOptions] = useState<[string, string][]>([]);

  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [ownerName, setOwnerName] = useState<string>("");
  const [competitorName, setCompetitorName] = useState<string>("");
  const [isVisitor, setIsVisitor] = useState<boolean>(false);
  const [isCompetitorIn, setIsCompetitorIn] = useState<boolean>(false);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [addScore, setAddScore] = useState<boolean>(false);
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
  const [invitingList, setInvitingList] = useState<string[]>();
  const [hasInvited, setHasInvited] = useState<boolean[]>([]);
  const [friendState, setFriendState] = useState<string[]>(["offline"]);
  const ref = useRef<null | AddFunction>(null);

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
    let newFriendState: string[] = [];
    friendList?.forEach((friendEmail) => {
      async function checkState() {
        const friendRef = collection(db, "users");
        const q = query(friendRef, where("email", "==", friendEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((friendDoc) => {
          newFriendState = [...newFriendState, friendDoc.data().state];
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
    if (isLogin && friendList?.length) {
      unsub = onSnapshot(
        query(collection(db, "users"), where("email", "in", friendList)),
        () => {
          let newFriendState: string[] = [];
          friendList?.forEach((friendEmail) => {
            async function checkState() {
              const friendRef = collection(db, "users");
              const q = query(friendRef, where("email", "==", friendEmail));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((friendDoc) => {
                newFriendState = [...newFriendState, friendDoc.data().state];
              });
              setFriendState(newFriendState);
            }
            checkState();
          });
        }
      );
    }
    return unsub;
  }, [friendList, isLogin, userId]);

  useEffect(() => {
    let unsub;

    if (pin) {
      unsub = onSnapshot(doc(db, "battleRooms", pin), (doc) => {
        const data = doc.data() as RoomInfo;
        setInvitingList(data.invitingList);
        const ownerAnswerCount =
          data?.answerCount.owner.correct + data?.answerCount.owner.wrong;
        const competitorAnswerCount =
          data?.answerCount.competitor.correct +
          data?.answerCount.competitor.wrong;

        if (data.competitorId !== "") setIsCompetitorIn(true);
        if (
          isCompetitorIn &&
          !isOwner &&
          userId !== data.competitorId &&
          data.competitorId !== ""
        ) {
          setIsVisitor(true);
        }
        if (data.ownerId !== userId) setIsOwner(false);
        if (data.competitorName !== "") setCompetitorName(data.competitorName);
        if (isWaiting && data?.status === "playing") setIsWaiting(false);
        if (data.answerCount) {
          console.log("sub", data.answerCount);
          setAnswerCount(data.answerCount);
        }
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
    let countDownTimer: ReturnType<typeof setTimeout>;
    if (countDown > 0 && !isWaiting) {
      countDownTimer = setTimeout(() => setCountDown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(countDownTimer);
  }, [countDown, isWaiting]);

  useEffect(() => {
    if (countDown !== 0) return;
    if (isAnswered) return;

    const roomRef = doc(db, "battleRooms", pin);
    const who = isOwner ? "owner" : "competitor";
    updateDoc(roomRef, {
      ["answerCount." + who + ".wrong"]: increment(1),
    });

    setIsAnswered(true);

    setOutcomeVocabList((prev) => {
      return prev.map((question, index) => {
        if (index !== round) return question;
        return {
          ...question,
          isCorrect: false,
        };
      });
    });
  }, [countDown, isAnswered, isOwner, pin, round]);

  useEffect(() => {
    if (countDown !== 0 || gameOver || isWaiting) return;
    const isFinalRound = round + 1 === questionsNumber;
    if (isFinalRound) {
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
        const docSnap = await getDoc(docRef);

        const score = docSnap?.data()?.currentScore;
        const isChallenging = docSnap?.data()?.isChallenging;

        if (isChallenging) {
          if (typeof score === "number" && score < 5) {
            await updateDoc(docRef, {
              currentScore: score + 1,
              lastTimeUpdateScore: new Date(),
              isDying: false,
            });
            setAddScore(true);
          }
        }
      };

      const me = isOwner ? "owner" : "competitor";
      const other = isOwner ? "competitor" : "owner";

      if (
        (answerCount[me].correct / questionsNumber) * 100 >= 80 &&
        answerCount[me].correct > answerCount[other].correct
      )
        checkUserScoreStatus();
    } else {
      setTimeout(() => {
        setRound(round + 1);
        setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
        setCountDown(5);
        setIsAnswered(false);
      }, 500);
    }
  }, [
    answerCount.competitor.correct,
    answerCount.owner.correct,
    countDown,
    gameOver,
    isOwner,
    pin,
    questionsNumber,
    round,
    userId,
    isWaiting,
    answerCount,
  ]);

  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  async function handleCompetitorJoinBattle() {
    const getUserInfo = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (pin) {
        const roomRef = doc(db, "battleRooms", pin);
        await updateDoc(roomRef, {
          competitorId: userId,
          competitorName: docSnap?.data()?.name,
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

    const battleRoomRef = doc(db, "battleRooms", pin);
    const battleRoomInfo = await getDoc(battleRoomRef);

    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", friendEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) ref.current?.("The user doesn't exist!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          battleInvitation: arrayUnion({
            ownerName,
            pin: pin,
            time: new Date(),
          }),
        });
        await updateDoc(battleRoomRef, {
          invitingList: arrayUnion(friendEmail),
        });
      };
      if (!battleRoomInfo.data()?.invitingList.includes(friendEmail)) {
        updateFriendStatus();
      }
    });
  };

  const handleAnswer = (check: string) => {
    const roomRef = doc(db, "battleRooms", pin);
    const who = isOwner ? "owner" : "competitor";
    updateDoc(roomRef, {
      ["answerCount." + who + `.${check}`]: increment(1),
    });
  };

  function renderWaiting() {
    return (
      <Main>
        <WaitingRoomWrapper>
          <Pin>PIN Code: {pin}</Pin>
          {isOwner ? (
            isCompetitorIn ? (
              <div onClick={handleStartBattle}>
                <Button btnType="primary">Start</Button>
              </div>
            ) : (
              <>
                <WaitingMessage>
                  Waiting for the competitor joining the battle
                </WaitingMessage>
                <Title>Friend List</Title>
                {friendList?.map((friendEmail, index) => {
                  return (
                    <InviteWrapper key={friendEmail}>
                      <Email>{friendEmail}</Email>
                      <FriendStateWrapper stateColor={friendState[index]}>
                        {friendState[index]}
                        <FriendState stateColor={friendState[index]} />
                        <Button
                          btnType="secondary"
                          onClick={() => {
                            handleInviteFriendBattle(friendEmail, index);
                            const newHasInvited = [...hasInvited];
                            newHasInvited[index] = true;
                            setHasInvited(newHasInvited);
                          }}
                        >
                          {hasInvited[index] ||
                          invitingList?.includes(friendEmail)
                            ? "Inviting"
                            : "Invite"}
                        </Button>
                      </FriendStateWrapper>
                    </InviteWrapper>
                  );
                })}
              </>
            )
          ) : isCompetitorIn ? (
            <WaitingMessage>
              Waiting for the owner starting the battle
            </WaitingMessage>
          ) : (
            <div onClick={handleCompetitorJoinBattle}>
              <Button btnType="primary">Join the battle!</Button>
            </div>
          )}
        </WaitingRoomWrapper>
      </Main>
    );
  }

  function renderTest() {
    return (
      <Main>
        <VocabWrapper>
          <Vocab>
            {correctVocab?.vocab}
            {correctVocab?.audioLink && (
              <AudioImg
                src={audio}
                alt="audio"
                onClick={() =>
                  correctVocab?.audioLink &&
                  handlePlayAudio(correctVocab?.audioLink)
                }
              />
            )}
          </Vocab>
          ({correctVocab?.partOfSpeech})
        </VocabWrapper>

        <Options>
          {currentOptions?.map(([clickedVocab, def], index) => (
            <Option
              key={clickedVocab}
              showAnswer={showAnswerArr[index]}
              onClick={() => {
                if (isAnswered) return;
                setIsAnswered(true);

                const answerStatus = [...currentOptions].map(
                  ([vocabOption]) => {
                    if (vocabOption === correctVocab?.vocab)
                      return "correctAnswer";
                    if (
                      clickedVocab !== vocabOption &&
                      vocabOption !== correctVocab?.vocab
                    ) {
                      return "notAnswer";
                    } else return "wrongAnswer";
                  }
                );
                setShowAnswerArr(answerStatus);

                if (clickedVocab === correctVocab?.vocab) {
                  handleAnswer("correct");
                } else {
                  handleAnswer("wrong");
                }

                setOutcomeVocabList((outcomeVocabList) => {
                  return outcomeVocabList.map((question, index) => {
                    if (index === round)
                      return {
                        ...question,
                        isCorrect: clickedVocab === correctVocab?.vocab,
                      };
                    return question;
                  });
                });
              }}
            >
              {def}
            </Option>
          ))}
        </Options>
      </Main>
    );
  }

  function renderOutcomeVocabList(
    vocab: string,
    partOfSpeech: string,
    definition: string,
    audioLink?: string
  ) {
    return (
      <VocabList key={vocab + partOfSpeech}>
        <VocabDiv>
          {vocab}{" "}
          {audioLink && (
            <AudioImg
              src={audio}
              alt="audio"
              onClick={() => handlePlayAudio(audioLink)}
            />
          )}
          ({partOfSpeech})
        </VocabDiv>
        {definition}
      </VocabList>
    );
  }

  function renderMessage() {
    const who = isOwner ? "owner" : "competitor";

    if ((answerCount[who].correct / questionsNumber) * 100 >= 80) {
      return "You're amazing! Keep up the good work.";
    } else {
      return "Keep fighting, Keep pushing!";
    }
  }

  function renderOutcome() {
    return (
      <Main>
        <OutcomeWrapper>
          <Message>
            {renderMessage()}
            <br />
            {addScore && "You've got 1 point!"}
          </Message>
          <Btns>
            <Button
              btnType="secondary"
              showBtn={showBtn}
              onClick={() => navigate("/vocabbook")}
            >
              Back to VocabBooks
            </Button>
          </Btns>
          <ReviewVocabs>
            <WrongVocabs>
              {outcomeVocabList?.find((vocab) => !vocab.isCorrect) && (
                <LabelDiv>Wrong vocab</LabelDiv>
              )}{" "}
              {outcomeVocabList?.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  return (
                    !isCorrect &&
                    renderOutcomeVocabList(
                      vocab,
                      partOfSpeech,
                      definition,
                      audioLink
                    )
                  );
                }
              )}
            </WrongVocabs>
            <CorrectVocabs>
              {outcomeVocabList?.find((vocab) => vocab.isCorrect) && (
                <LabelDiv>Correct vocab</LabelDiv>
              )}{" "}
              {outcomeVocabList?.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  return (
                    isCorrect &&
                    renderOutcomeVocabList(
                      vocab,
                      partOfSpeech,
                      definition,
                      audioLink
                    )
                  );
                }
              )}
            </CorrectVocabs>
          </ReviewVocabs>
        </OutcomeWrapper>
      </Main>
    );
  }

  return !isVisitor ? (
    <>
      <Img src={plant} alt="plant" />
      <Alert
        myChildren={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Wrapper>
        <RoundCount>
          Round: {round + 1} / {questionsNumber}
        </RoundCount>
        <Header>
          <OwnerCount>
            <div>{ownerName}</div>
            <ScoreCount>
              <AnsImg src={correct} alt="correct" />
              &nbsp;&nbsp;{answerCount.owner.correct}&nbsp;&nbsp;
              <AnsImg src={wrong} alt="wrong" />
              &nbsp;&nbsp;{answerCount.owner.wrong}
            </ScoreCount>
            <Div>
              <ScoreBar insideColor={true} score={answerCount.owner.correct}>
                <ScoreBar>
                  {Math.ceil(
                    (answerCount.owner.correct / questionsNumber) * 100
                  )}
                  %
                </ScoreBar>
              </ScoreBar>
            </Div>
          </OwnerCount>
          {isWaiting ? <></> : <CountDown>{countDown} s</CountDown>}
          <CompetitorCount>
            <div>{competitorName || "Competitor"}</div>
            <ScoreCount>
              <AnsImg src={correct} alt="correct" />
              &nbsp;&nbsp;
              {answerCount.competitor.correct}&nbsp;&nbsp;
              <AnsImg src={wrong} alt="wrong" />
              &nbsp;&nbsp;{answerCount.competitor.wrong}
            </ScoreCount>
            <Div>
              <ScoreBar
                insideColor={true}
                score={answerCount.competitor.correct}
              >
                <ScoreBar>
                  {Math.ceil(
                    (answerCount.competitor.correct / questionsNumber) * 100
                  )}
                  %
                </ScoreBar>
              </ScoreBar>
            </Div>
          </CompetitorCount>
        </Header>
        {isWaiting
          ? renderWaiting()
          : gameOver
          ? renderOutcome()
          : renderTest()}
      </Wrapper>
    </>
  ) : (
    <Wrapper>
      <HasStarted>The battle was finished.</HasStarted>
    </Wrapper>
  );
}
