import styled, { css } from "styled-components";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useViewingBook } from "../VocabBookLayout";
import { VocabBookContext } from "../../../context/vocabBookContext";
import { AuthContext } from "../../../context/authContext";
import audio from "../../../components/audio.png";
import { db } from "../../../firebase/firebase";
import Button from "../../../components/Button/Button";
import plant from "./reviewPlant.webp";
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
  @media screen and (max-height: 701px) {
    display: none;
  }
`;

const RoundCount = styled.div`
  margin-top: 20px;
  text-align: center;
  margin-bottom: 10px;
`;

const Header = styled.div`
  width: auto;
  margin-top: 20px;
  text-align: center;
  position: relative;
  z-index: 1;
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

const Div = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ScoreBarDiv = styled.div`
  width: 200px;
`;

const ScoreBarStyle = css`
  border: 0px;
  background-color: #95caca;
  width: ${(props: Props) => (props.score ? `${props.score * 40}px` : "0px")};
  z-index: 2;
  margin-bottom: 20px;
`;

const ScoreBar = styled.div`
  width: 200px;
  height: 30px;
  line-height: 30px;
  border: 1px solid gray;
  border-radius: 20px;
  margin-top: 10px;
  z-index: 3;
  ${(props: Props) => props.insideColor && ScoreBarStyle}
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

const StyledButton = styled(Button)`
  display: ${(props: Props) => (props.showBtn ? "flex" : "none")};
  margin: 0 auto;
  margin-top: 20px;
  justify-content: center;
  position: relative;
  z-index: 2;
  width: 100px;
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
  font-size: 16px;
  margin-bottom: 10px;
  color: #607973;
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
  margin-bottom: 30px;
  font-size: 14px;
`;

interface Log {
  isCorrect?: boolean;
  time?: Record<string, unknown>;
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
  const { vocabBooks, getVocabBooks } = useContext(VocabBookContext);
  const [updateLogInViewingBook, setUpdateLogInViewingBook] = useState<
    Answer[]
  >(vocabBooks?.[viewingBook]);

  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);
  const [reviewingQuestions, setReviewingQuestions] =
    useState<ReviewingQuestions[]>(questions);

  const { userId } = useContext(AuthContext);
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
    if (reviewingQuestions === undefined) setReviewingQuestions(questions);
  }, [questions, reviewingQuestions, vocabBooks]);

  useEffect(() => {
    getVocabBooks(userId);

    const getUserInfo = async (userId: string) => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      setScore(docSnap?.data()?.currentScore);
      setIsChallenging(docSnap?.data()?.isChallenging);
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
        [viewingBook]: updateLogInViewingBook,
      });
    };
    updateLog();

    const setReviewLog = async () => {
      const docRef = await addDoc(collection(db, "reviewLog"), {
        userId: userId,
        time: new Date(),
        correctRate: answerCount.correct / questionsNumber,
        vocabBook: viewingBook,
      });
      await updateDoc(docRef, {
        docId: docRef.id,
      });
    };
    setReviewLog();
  };

  function renderNextDoneButton() {
    return round === questionsNumber - 1 ? (
      <StyledButton
        btnType={"primary"}
        showBtn={showBtn}
        onClick={() => {
          handleGameOver();
        }}
      >
        Done
      </StyledButton>
    ) : (
      <StyledButton
        btnType={"primary"}
        showBtn={showBtn}
        onClick={() => {
          setShowBtn(false);
          setRound(round + 1);
          setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
        }}
      >
        Next &gt;&gt;&gt;
      </StyledButton>
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
                onClick={() => handlePlayAudio(correctVocab?.audioLink)}
              />
            )}
          </Vocab>
          ({correctVocab?.partOfSpeech})
        </VocabWrapper>
        <Options>
          <>
            {currentOptions?.map(([clickedVocab, def], index) => (
              <Option
                key={clickedVocab}
                showAnswer={showAnswerArr[index]}
                onClick={() => {
                  if (showBtn) return;
                  setShowBtn(true);

                  const answerStatus = currentOptions.map(([vocabOption]) => {
                    if (vocabOption === correctVocab?.vocab)
                      return "correctAnswer";
                    if (
                      clickedVocab !== vocabOption &&
                      vocabOption !== correctVocab?.vocab
                    )
                      return "notAnswer";
                    else return "wrongAnswer";
                  });
                  setShowAnswerArr(answerStatus);

                  const isCorrect = clickedVocab === correctVocab?.vocab;

                  setAnswerCount((ac) => ({
                    ...ac,
                    ...(isCorrect
                      ? { correct: ac.correct + 1 }
                      : { wrong: ac.wrong + 1 }),
                  }));

                  const newUpdateLogInViewingBook = updateLogInViewingBook.map(
                    (book) => {
                      if (book.vocab !== correctVocab?.vocab) return book;
                      const correctCount = book.log.reduce(
                        (acc, item) => acc + (item.isCorrect ? 1 : 0),
                        0
                      );
                      return {
                        ...book,
                        log: [...book.log, { isCorrect, time: new Date() }],
                        correctRate:
                          (correctCount + (isCorrect ? 1 : 0)) /
                          (book.log.length + 1),
                      };
                    }
                  ) as Answer[];
                  setUpdateLogInViewingBook(newUpdateLogInViewingBook);
                }}
              >
                {def}
              </Option>
            ))}
            {renderNextDoneButton()}
          </>
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
            <Button
              btnType="secondary"
              showBtn={showBtn}
              onClick={() => {
                setGameOver(false);
                setAnswerCount({ correct: 0, wrong: 0 });
                setReviewingQuestions(questions);
                setShowBtn(false);
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
              }}
            >
              Review again
            </Button>
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
              <LabelDiv>Wrong vocab</LabelDiv>{" "}
              {reviewingQuestions.map(
                ({ vocab, audioLink, partOfSpeech, definition }) => {
                  const answer = updateLogInViewingBook.find((answer) => {
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
                  const answer = updateLogInViewingBook.find((answer) => {
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
      <RoundCount>
        Round: {gameOver ? questionsNumber : round + 1} / {questionsNumber}
      </RoundCount>
      <Header>
        <ScoreCount>
          <AnsImg src={correct} alt="correct" />
          &nbsp;&nbsp;{answerCount.correct}&nbsp;&nbsp;
          <AnsImg src={wrong} alt="wrong" />
          &nbsp;&nbsp;
          {answerCount.wrong}
        </ScoreCount>
        <Div>
          <ScoreBarDiv>
            <ScoreBar insideColor={true} score={answerCount.correct}>
              <ScoreBar>
                {Math.ceil((answerCount.correct / questionsNumber) * 100)}%
              </ScoreBar>
            </ScoreBar>
          </ScoreBarDiv>
        </Div>
      </Header>
      {gameOver ? renderOutcome() : renderTest()}
    </Wrapper>
  );
}
