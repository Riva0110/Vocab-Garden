import styled, { css } from "styled-components";
import { useContext, useState, useEffect } from "react";
import { useViewingBook } from "../VocabBookLayout";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import audio from "../../../components/audio.png";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import plant from "./reviewPlant.webp";
import Button from "../../../components/Button/Button";

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
  @media screen and (min-width: 1440px) {
    max-width: 1440px;
  }
`;

const Img = styled.img`
  width: 300px;
  position: fixed;
  right: 0px;
  bottom: 50px;
  opacity: 0.5;
`;

const RoundCount = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const Header = styled.div`
  /* display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto; */
  margin-top: 20px;
  /* align-items: center; */
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Div = styled.div`
  display: flex;
  justify-content: center;
  /* @media screen and (max-width: 601px) { */
  width: 150px;
  /* } */
`;

const ScoreBar = styled.div`
  width: 200px;
  height: 30px;
  line-height: 30px;
  border: 1px solid gray;
  border-radius: 20px;
  margin-top: 10px;
  z-index: 3;
  transform: translateX(-50%);
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
  display: flex;
  justify-content: center;
  flex-direction: column;
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
  margin: 0 auto;
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
  justify-content: center;
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
  margin: 20px auto;
`;

const ReviewVocabs = styled.div`
  position: relative;
  background-color: rgb(255, 255, 255, 0.7);
  z-index: 1;
  border: 1px solid gray;
  padding: 20px;
  margin-top: 20px;
`;

const WrongVocabs = styled.div`
  margin-bottom: 40px;
`;

const CorrectVocabs = styled.div``;

const VocabDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 10px;
`;

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

interface Log {
  isCorrect?: boolean;
  time?: {};
}

interface ReviewingQuestions {
  vocab: string;
  audioLink: string;
  partOfSpeech: string;
  definition: string;
}

interface Answer extends ReviewingQuestions {
  log: Log[];
  correctRate: number;
}

export default function Review() {
  const navigate = useNavigate();

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);

  const [answerCount, setAnswerCount] = useState({ correct: 0, wrong: 0 });

  const { viewingBook } = useViewingBook();
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const [updateLogInVeiwingBook, setUpdateLogInVeiwingBook] = useState<
    Answer[]
  >(vocabBooks?.[viewingBook]);

  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);
  const [reviewingQuestions, setReviewingQuestions] =
    useState<ReviewingQuestions[]>(questions);

  const { userId } = useContext(authContext);
  const [score, setScore] = useState<number>();
  const [isChallenging, setIsChallenging] = useState<boolean>();
  const [currentOptions, setCurrentOptions] = useState<[string, string][]>([]);
  const [showBtn, setShowBtn] = useState<boolean>(false);

  const correctVocab = reviewingQuestions?.[round];
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);

  useEffect(() => {
    console.log("singleMode");
    getVocabBooks(userId);

    const getUserInfo = async (userId: string) => {
      const docRef = doc(db, "users", userId);
      const docSnap: any = await getDoc(docRef);
      setScore(docSnap.data().currentScore);
      setIsChallenging(docSnap.data().isChallenging);
    };
    getUserInfo(userId);
  }, [getVocabBooks, userId]);

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
    const updateScore = async () => {
      const userRef = doc(db, "users", userId);
      if (typeof score === "number" && score < 5 && isChallenging) {
        setScore(score + 1);
        await updateDoc(userRef, {
          currentScore: score + 1,
          lastTimeUpdateScore: new Date(),
          isDying: false,
        });
      }
    };
    if ((answerCount.correct / questionsNumber) * 100 >= 80) updateScore();

    const updateLog = async () => {
      const userRef = doc(db, "vocabBooks", userId);
      await updateDoc(userRef, {
        [viewingBook]: updateLogInVeiwingBook,
      });
    };
    updateLog();
  };

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
                onClick={() => handlePlayAudio(correctVocab?.audioLink)}
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
                if (!showBtn) {
                  setShowBtn(true);
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

                  let newUpdateLogInVeiwingBook;

                  if (clickedVocab === correctVocab?.vocab) {
                    setAnswerCount((prev) => ({
                      ...prev,
                      correct: prev.correct + 1,
                    }));

                    newUpdateLogInVeiwingBook = [...updateLogInVeiwingBook].map(
                      ({
                        vocab,
                        audioLink,
                        partOfSpeech,
                        definition,
                        log,
                        correctRate,
                      }) => {
                        if (vocab === correctVocab?.vocab) {
                          if (log && log?.length > 0) {
                            const correctCount = log?.reduce(
                              (acc: any, item) => {
                                if (item.isCorrect) {
                                  acc += 1;
                                }
                                return acc;
                              },
                              0
                            );
                            console.log("correct correctRate: ...log");
                            return {
                              vocab,
                              audioLink,
                              partOfSpeech,
                              definition,
                              log: [
                                ...log,
                                { isCorrect: true, time: new Date() },
                              ],
                              correctRate:
                                (correctCount + 1) / (log.length + 1),
                            };
                          } else {
                            console.log("correct correctRate: 1");
                            return {
                              vocab,
                              audioLink,
                              partOfSpeech,
                              definition,
                              log: [{ isCorrect: true, time: new Date() }],
                              correctRate: 1,
                            };
                          }
                        } else {
                          return {
                            vocab,
                            audioLink,
                            partOfSpeech,
                            definition,
                            log,
                            correctRate,
                          };
                        }
                      }
                    );
                  } else {
                    setAnswerCount((prev) => ({
                      ...prev,
                      wrong: prev.wrong + 1,
                    }));
                    newUpdateLogInVeiwingBook = [...updateLogInVeiwingBook].map(
                      ({
                        vocab,
                        audioLink,
                        partOfSpeech,
                        definition,
                        log,
                        correctRate,
                      }) => {
                        if (vocab === correctVocab?.vocab) {
                          if (log && log?.length > 0) {
                            const correctCount = log?.reduce(
                              (acc: any, item) => {
                                if (item.isCorrect) {
                                  acc += 1;
                                }
                                return acc;
                              },
                              0
                            );
                            console.log("wrong correctRate: ...log");
                            return {
                              vocab,
                              audioLink,
                              partOfSpeech,
                              definition,
                              log: [
                                ...log,
                                { isCorrect: false, time: new Date() },
                              ],
                              correctRate: correctCount / (log.length + 1),
                            };
                          } else {
                            console.log("wrong correctRate: 0");
                            return {
                              vocab,
                              audioLink,
                              partOfSpeech,
                              definition,
                              log: [{ isCorrect: false, time: new Date() }],
                              correctRate: 0,
                            };
                          }
                        } else {
                          return {
                            vocab,
                            audioLink,
                            partOfSpeech,
                            definition,
                            log,
                            correctRate,
                          };
                        }
                      }
                    );
                  }
                  setUpdateLogInVeiwingBook(newUpdateLogInVeiwingBook);
                  console.log("clickOptions", { newUpdateLogInVeiwingBook });
                }
              }}
            >
              {def}
            </Option>
          ))}
          {round === questionsNumber - 1 ? (
            <BtnDiv
              showBtn={showBtn}
              onClick={() => {
                handleGameOver();
              }}
            >
              <Button btnType={"primary"}>Done</Button>
            </BtnDiv>
          ) : (
            <BtnDiv
              showBtn={showBtn}
              onClick={() => {
                setShowBtn(false);
                setRound(round + 1);
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
              }}
            >
              <Button btnType={"secondary"}>Next &gt;&gt;&gt;</Button>
            </BtnDiv>
          )}
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
            {(answerCount.correct / questionsNumber) * 100 >= 80
              ? "You're amazing! Keep up the good work."
              : "Keep fighting, Keep pushing!"}
          </Message>
          <Btns>
            <BtnDiv
              showBtn={showBtn}
              onClick={() => {
                setGameOver(false);
                setAnswerCount({ correct: 0, wrong: 0 });
                setReviewingQuestions(questions);
                setShowBtn(false);
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
              }}
            >
              <Button btnType="secondary">Review again</Button>
            </BtnDiv>
            <BtnDiv showBtn={showBtn} onClick={() => navigate("/vocabbook")}>
              <Button btnType="secondary">Back to VocabBooks</Button>
            </BtnDiv>
          </Btns>
          <ReviewVocabs>
            <WrongVocabs>
              <LabelDiv>Wrong vocab</LabelDiv>{" "}
              {reviewingQuestions.map(
                ({ vocab, audioLink, partOfSpeech, definition }) => {
                  const answer = updateLogInVeiwingBook.find((answer) => {
                    return answer.vocab === vocab;
                  });
                  const lastAnswerLog = answer?.log.at(-1);
                  return (
                    !lastAnswerLog?.isCorrect &&
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
              {reviewingQuestions.map(
                ({ vocab, audioLink, partOfSpeech, definition }) => {
                  const answer = updateLogInVeiwingBook.find((answer) => {
                    return answer.vocab === vocab;
                  });
                  const lastAnswerLog = answer?.log.at(-1);
                  return (
                    lastAnswerLog?.isCorrect &&
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

  return (
    <Wrapper>
      <Img src={plant} alt="plant" />
      <RoundCount>Round: {gameOver ? questionsNumber : round + 1}</RoundCount>
      <Header>
        <div>
          O: {answerCount.correct} X: {answerCount.wrong} / Total:{" "}
          {questionsNumber}
        </div>
        <Div>
          <ScoreBar insideColor={true} score={answerCount.correct}>
            <ScoreBar>
              {Math.ceil((answerCount.correct / questionsNumber) * 100)}%
            </ScoreBar>
          </ScoreBar>
        </Div>
      </Header>
      {gameOver ? renderOutcome() : renderTest()}
    </Wrapper>
  );
}
