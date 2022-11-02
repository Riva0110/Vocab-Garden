import styled from "styled-components";
import { useContext, useState, useEffect } from "react";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";

interface Props {
  correct?: boolean;
  wrong?: boolean;
  isAnswer?: boolean;
  isClick?: boolean;
  showNextBtn?: boolean;
  showAnswer?: string;
}

const Wrapper = styled.div`
  width: 100vw;
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

const NextBtn = styled.button`
  display: ${(props: Props) => (props.showNextBtn ? "flex" : "none")};
  width: 100%;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin-top: 20px;
`;

export default function Review() {
  const [viewingBook, setViewingBook] = useState<string>("finance");
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const { userId } = useContext(authContext);
  const viewingBookInfo = vocabBooks?.[viewingBook];
  const correctVocab = viewingBookInfo?.[getRandomIndex()];
  const wrongVocab1 = viewingBookInfo?.[getRandomIndex()];
  const wrongVocab2 = viewingBookInfo?.[getRandomIndex()];
  const randomOptions = Object.entries({
    [correctVocab?.vocab]: correctVocab?.definition,
    [wrongVocab1?.vocab]: wrongVocab1?.definition,
    [wrongVocab2?.vocab]: wrongVocab2?.definition,
  }).sort(() => Math.random() - 0.5);
  const [showNextBtn, setShowNextBtn] = useState<boolean>(false);
  const [showAnswerArr, setShowAnswerArr] = useState([
    "notAnswer",
    "notAnswer",
    "notAnswer",
  ]);
  const [currentVocab, setCurrentVocab] = useState(correctVocab?.vocab);
  const [currentOptions, setCurrentOptions] = useState(randomOptions);

  function getRandomIndex(): number {
    return Math.ceil(Math.random() * viewingBookInfo?.length);
  }

  useEffect(() => {
    getVocabBooks(userId);
  }, []);

  console.log(viewingBookInfo.sort(() => Math.random() - 0.5).slice(0, 25));

  return (
    <Wrapper>
      <div>Review</div>
      <Main>
        <Vocab>{currentVocab}</Vocab>
        <Options>
          {currentOptions?.map(([clickedVocab, def], index) => (
            <Option
              showAnswer={showAnswerArr[index]}
              onClick={() => {
                setShowNextBtn(true);
                let answerStatus = [...currentOptions].map(
                  ([vocabOption, insideDef], index) => {
                    if (vocabOption === currentVocab) return "correctAnswer";
                    if (
                      clickedVocab !== vocabOption &&
                      vocabOption !== currentVocab
                    )
                      return "notAnswer";
                    else return "wrongAnswer";
                  }
                );
                setShowAnswerArr(answerStatus);
              }}
            >
              {clickedVocab}: {def}
            </Option>
          ))}
          <NextBtn
            showNextBtn={showNextBtn}
            onClick={() => {
              setShowNextBtn(false);
              setCurrentVocab(correctVocab?.vocab);
              setCurrentOptions(randomOptions);
              setShowAnswerArr(["notAnswer", "notAnswer", "notAnswer"]);
            }}
          >
            Next
          </NextBtn>
        </Options>
      </Main>
    </Wrapper>
  );
}
