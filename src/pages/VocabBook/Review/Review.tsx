import styled from "styled-components";
import { useContext, useState, useEffect, useRef } from "react";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";

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

const Vocab = styled.div`
  font-weight: 600;
  font-size: 20px;
  margin: 50px auto;
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

export default function Review() {
  const [viewingBook, setViewingBook] = useState<string>("finance");
  const [round, setRound] = useState<number>(0);
  const [answerCount, setAnswerCount] = useState({ correct: 0, wrong: 0 });
  const [gameOver, setGameOver] = useState(false);
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const { userId } = useContext(authContext);
  const questionsNumber = 5;
  const questions = vocabBooks?.[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber);
  const [viewingBookInfo, setViewingBookInfo] = useState(questions);
  const correctVocab = viewingBookInfo?.[round];
  const wrongVocab1 = viewingBookInfo?.[getRandomIndex()];
  const wrongVocab2 = viewingBookInfo?.[getRandomIndex()];
  const randomOptions = Object.entries({
    [correctVocab?.vocab]: correctVocab?.definition,
    [wrongVocab1?.vocab]: wrongVocab1?.definition,
    [wrongVocab2?.vocab]: wrongVocab2?.definition,
  }).sort(() => Math.random() - 0.5);
  const [currentOptions, setCurrentOptions] = useState(randomOptions);

  const [showBtn, setShowBtn] = useState<boolean>(false);
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);

  function getRandomIndex(): number {
    return Math.ceil(Math.random() * viewingBookInfo?.length);
  }

  useEffect(() => {
    getVocabBooks(userId);
  }, []);

  function renderTest() {
    return (
      <Main>
        <Vocab>{correctVocab?.vocab}</Vocab>
        <Options>
          {currentOptions?.map(([clickedVocab, def], index) => (
            <Option
              showAnswer={showAnswerArr[index]}
              onClick={() => {
                if (!showBtn) {
                  setShowBtn(true);

                  let answerStatus = [...currentOptions].map(
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
                  } else {
                    answerCount.wrong += 1;
                  }
                  setAnswerCount(answerCount);
                }
              }}
            >
              {clickedVocab}: {def}
            </Option>
          ))}
          {round === questionsNumber - 1 ? (
            <Btn
              showBtn={showBtn}
              onClick={() => {
                setShowBtn(true);
                setGameOver(true);
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
                    [viewingBookInfo?.[round + 1]?.vocab]:
                      correctVocab?.definition,
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
            {(answerCount.correct / questionsNumber) * 100 > 80
              ? " 你太棒了！！！我服了你 "
              : "加油，好嗎？我對你太失望了"}
          </Message>
          <Btn
            showBtn={showBtn}
            onClick={() => {
              setGameOver(false);
              setAnswerCount({ correct: 0, wrong: 0 });
              setRound(0);
              setShowBtn(false);
              setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
            }}
          >
            再玩一次
          </Btn>
        </OutcomeWrapper>
      </Main>
    );
  }

  return (
    <Wrapper>
      <Header>
        <div>Review Round: {round + 1}</div>
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
