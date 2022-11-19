import styled, { css } from "styled-components";
import { useContext, useState, useEffect, useCallback, useRef } from "react";
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
import plant from "./battlePlant.webp";
import Button from "../../../components/Button/Button";
import Alert from "../../../components/Alert/Alert";

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

const Img = styled.img`
  width: 300px;
  position: fixed;
  left: 100px;
  bottom: 0;
  opacity: 0.4;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RoundCount = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const OwnerCount = styled.div`
  text-align: center;
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
`;

const WaitingMessage = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-top: 20px;
  @media screen and (max-width: 601px) {
    font-size: 16px;
  }
`;

const StartGame = styled.button`
  width: 300px;
  margin-top: 20px;
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

const BtnDiv = styled.div`
  display: ${(props: Props) => (props.showBtn ? "flex" : "none")};
  margin-top: 20px;
  justify-content: flex-end;
`;

const Message = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const OutcomeWrapper = styled.div`
  width: 50vw;
  margin: 50px auto;
`;

const ReviewVocabs = styled.div`
  position: relative;
  background-color: rgb(255, 255, 255, 0.7);
  z-index: 100;
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
  margin-bottom: 10px;
`;

const VocabDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 10px;
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
}

type AddFunction = (msg: string) => void;

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
  const ref = useRef<null | AddFunction>(null);

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
    if (isLogin && friendList?.length) {
      unsub = onSnapshot(
        query(collection(db, "users"), where("email", "in", friendList)),
        (doc) => {
          let newFriendState: any = [];
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
        console.log("onSnapshot Current data: ", doc.data());
        const data = doc.data() as RoomInfo;
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
    if (querySnapshot.empty) ref.current?.("The user doesn't exist!");
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
          <Pin>PIN Code: {pin}</Pin>
          {isOwner ? (
            isCompetitorIn ? (
              <StartGame onClick={handleStartBattle}>Start</StartGame>
            ) : (
              <>
                <WaitingMessage>
                  Waiting for the competitor joining the battle
                </WaitingMessage>
                <Title>Friend List</Title>
                {friendList?.map((friendEmail, index) => (
                  <InviteWrapper>
                    <Email key={friendEmail}>{friendEmail}</Email>
                    <FriendStateWrapper stateColor={friendState[index]}>
                      {friendState[index]}
                      <FriendState stateColor={friendState[index]} />
                      <div
                        onClick={() => {
                          const newHasInvited = [...hasInvited];
                          newHasInvited[index] = true;
                          setHasInvited(newHasInvited);
                          handleInviteFriendBattle(friendEmail, index);
                        }}
                      >
                        <Button btnType="secondary">
                          {!hasInvited[index] ? "Invite" : "Inviting"}
                        </Button>
                      </div>
                    </FriendStateWrapper>
                  </InviteWrapper>
                ))}
              </>
            )
          ) : isCompetitorIn ? (
            <WaitingMessage>
              Waiting for the owner starting the battle
            </WaitingMessage>
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

  function renderOutcome() {
    return (
      <Main>
        <OutcomeWrapper>
          <Message>
            {isOwner
              ? (answerCount.owner.correct / questionsNumber) * 100 >= 80
                ? "You're amazing! Keep up the good work."
                : "Keep fighting, Keep pushing!"
              : (answerCount.competitor.correct / questionsNumber) * 100 >= 80
              ? "You're amazing! Keep up the good work."
              : "Keep fighting, Keep pushing!"}
          </Message>
          <Btns>
            <BtnDiv showBtn={showBtn} onClick={() => navigate("/vocabbook")}>
              <Button btnType="secondary">Back to VocabBooks</Button>
            </BtnDiv>
          </Btns>
          <ReviewVocabs>
            <WrongVocabs>
              <LabelDiv>Wrong vocab</LabelDiv>{" "}
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
              <LabelDiv>Correct vocab</LabelDiv>{" "}
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
        children={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Wrapper>
        <RoundCount>Round: {round + 1}</RoundCount>
        <Header>
          <OwnerCount>
            <div>
              <p>
                Owner:
                {window.innerWidth < 601 && <br />} {ownerName}
              </p>
              O: {answerCount.owner.correct} X: {answerCount.owner.wrong} /
              Total: {questionsNumber}
            </div>
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
          {isWaiting ? <></> : <p>{countDown} seconds left</p>}
          <CompetitorCount>
            <div>
              <p>
                Competitor:
                {window.innerWidth < 601 && <br />}{" "}
                {competitorName || (window.innerWidth < 601 && <br />)}
              </p>
              O: {answerCount.competitor.correct} X:{" "}
              {answerCount.competitor.wrong} / Total: {questionsNumber}
            </div>
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
      <p>The game has started.</p>
    </Wrapper>
  );
}
