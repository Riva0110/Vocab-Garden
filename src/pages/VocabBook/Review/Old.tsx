import styled from "styled-components";
import { useContext, useState, useEffect } from "react";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import audio from "../../../components/audio.png";
import { useViewingBook } from "../VocabBookLayout";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

interface Props {
  correct?: boolean;
  wrong?: boolean;
  isAnswer?: boolean;
  isClick?: boolean;
  showBtn?: boolean;
  showAnswer?: string;
}

const Wrapper = styled.div`
  width: 100vw;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Main = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
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

export default function Review() {
  const navigate = useNavigate();
  const { viewingBook } = useViewingBook();
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const { userId } = useContext(authContext);
  const [round, setRound] = useState<number>(0);
  const [answerCount, setAnswerCount] = useState({ correct: 0, wrong: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState<number>();
  const [isChallenging, setIsChallenging] = useState<boolean>();

  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);

  //test
  console.log("questions", questions);

  const [reviewingQuestions, setReviewingQuestions] = useState(questions);
  const correctVocab = reviewingQuestions[round];

  //test
  console.log("reviewingQuestions", reviewingQuestions);
  console.log("correctVocab", correctVocab, "round", round);

  const getRandomIndex = () => {
    return Math.floor(Math.random() * questionsNumber);
  };
  let randomIndex1 = getRandomIndex();
  let randomIndex2 = getRandomIndex();

  //test
  console.log("randomIndex1", randomIndex1);
  console.log("randomIndex2", randomIndex2);

  while (randomIndex1 === round) {
    randomIndex1 = getRandomIndex();
  }

  while (randomIndex2 === round || randomIndex2 === randomIndex1) {
    randomIndex2 = getRandomIndex();
  }

  //test
  console.log("while randomIndex1", randomIndex1);
  console.log("while randomIndex2", randomIndex2);

  const wrongVocab1 = reviewingQuestions?.[randomIndex1];
  const wrongVocab2 = reviewingQuestions?.[randomIndex2];

  //test
  console.log("wrongVocab1", wrongVocab1);
  console.log("wrongVocab2", wrongVocab2);

  const randomOptions = Object.entries({
    [correctVocab?.vocab]: correctVocab?.definition,
    [wrongVocab1?.vocab]: wrongVocab1?.definition,
    [wrongVocab2?.vocab]: wrongVocab2?.definition,
  }).sort(() => Math.random() - 0.5);

  //test
  console.log("correctVocab?.vocab", correctVocab?.definition);
  console.log("wrongVocab1?.vocab", wrongVocab1?.definition);
  console.log("wrongVocab2?.vocab", wrongVocab2?.definition);
  console.log("randomOptions", randomOptions);

  const [currentOptions, setCurrentOptions] = useState(randomOptions);

  //test
  console.log("currentOptions", currentOptions);

  const [showBtn, setShowBtn] = useState<boolean>(false);
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);

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
        });
      }
    };
    if ((answerCount.correct / questionsNumber) * 100 >= 80) updateScore();
  };

  useEffect(() => {
    getVocabBooks(userId);
    const getUserInfo = async (userId: string) => {
      const docRef = doc(db, "users", userId);
      const docSnap: any = await getDoc(docRef);
      setScore(docSnap.data().currentScore);
      setIsChallenging(docSnap.data().isChallenging);
    };
    getUserInfo(userId);
  }, [userId]);

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
              onClick={() => handlePlayAudio(correctVocab?.audioLink)}
            />
          ) : (
            ""
          )}
        </VocabWrapper>
        <Options>
          {randomOptions?.map(([clickedVocab, def], index) => (
            <Option
              showAnswer={showAnswerArr[index]}
              onClick={() => {
                if (!showBtn) {
                  setShowBtn(true);
                  console.log("randomOptions", randomOptions);
                  let answerStatus = [...randomOptions].map(
                    ([vocabOption, insideDef], index) => {
                      if (vocabOption === correctVocab.vocab)
                        return "correctAnswer";
                      if (
                        clickedVocab !== vocabOption &&
                        vocabOption !== correctVocab.vocab
                      )
                        return "notAnswer";
                      else return "wrongAnswer";
                    }
                  );
                  setShowAnswerArr(answerStatus);

                  if (clickedVocab === correctVocab.vocab) {
                    answerCount.correct += 1;
                    reviewingQuestions[round].isCorrect = true;
                    setReviewingQuestions(reviewingQuestions);
                  } else {
                    answerCount.wrong += 1;
                    reviewingQuestions[round].isCorrect = false;
                    setReviewingQuestions(reviewingQuestions);
                  }
                  setAnswerCount(answerCount);
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
                setCurrentOptions(
                  Object.entries({
                    [reviewingQuestions?.[round + 1]?.vocab]:
                      reviewingQuestions?.[round + 1].definition,
                    [wrongVocab1?.vocab]: wrongVocab1?.definition,
                    [wrongVocab2?.vocab]: wrongVocab2?.definition,
                  }).sort(() => Math.random() - 0.5)
                );
                setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
              }}
            >
              Next
            </Btn>
          )}
        </Options>
      </Main>
    );
  }

  function renderOutcome() {
    return (
      <Main>
        <OutcomeWrapper>
          <Message>
            {(answerCount.correct / questionsNumber) * 100 >= 80
              ? " 你太棒了！！！我服了你 "
              : "加油，好嗎？我對你太失望了"}
          </Message>
          <Btns>
            <Btn
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
            </Btn>
            <Btn showBtn={showBtn} onClick={() => navigate("/vocabbook")}>
              Back to VocabBooks
            </Btn>
          </Btns>
          <ReviewVocabs>
            <WrongVocabs>
              <LabelDiv>Wrong vocab:</LabelDiv>{" "}
              {reviewingQuestions.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  if (!isCorrect) {
                    return (
                      <VocabList>
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
                  } else {
                    <></>;
                  }
                }
              )}
            </WrongVocabs>
            <CorrectVocabs>
              <LabelDiv>Correct vocab:</LabelDiv>{" "}
              {reviewingQuestions.map(
                ({ vocab, audioLink, partOfSpeech, definition, isCorrect }) => {
                  if (isCorrect) {
                    return (
                      <VocabList>
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
                  } else {
                    <></>;
                  }
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
      <Header>
        <div>Review Round: {gameOver ? questionsNumber : round + 1}</div>
        <div>
          O: {answerCount.correct} X: {answerCount.wrong} / Total:{" "}
          {questionsNumber} (
          {Math.ceil((answerCount.correct / questionsNumber) * 100)}%)
        </div>
      </Header>
      {gameOver ? renderOutcome() : renderTest()}
    </Wrapper>
  );
}
