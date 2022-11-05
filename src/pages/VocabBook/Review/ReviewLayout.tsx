import styled, { css } from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { useViewingBook } from "../VocabBookLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100vw;
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

// type ContextType = {
//   isBattle: boolean;
//   setIsBattle: React.Dispatch<React.SetStateAction<boolean>>;
//   gameOver: boolean;
//   setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
//   round: number;
//   setRound: React.Dispatch<React.SetStateAction<number>>;
//   pin: number;
//   setPin: React.Dispatch<React.SetStateAction<number>>;
//   answerCount: { correct: number; wrong: number };
//   setAnswerCount: React.Dispatch<
//     React.SetStateAction<{ correct: number; wrong: number }>
//   >;
//   reviewingQuestions: ReviewingQuestions[];
//   setReviewingQuestions: React.Dispatch<
//     React.SetStateAction<ReviewingQuestions[]>
//   >;
// };

export default function ReviewLayout() {
  const navigate = useNavigate();
  const [isBattle, setIsBattle] = useState<boolean>(false);
  const [pin, setPin] = useState<number>();
  const { viewingBook } = useViewingBook();

  useEffect(() => {
    console.log("riewlayout", "viewingBook", viewingBook);
    const randomPin = Math.floor(Math.random() * 10000);
    setPin(randomPin);
  }, []);

  return (
    <Wrapper>
      <ModeBtns>
        <ReviewModeBtn
        // isBattle={isBattle}
        // onClick={() => {
        //   setIsBattle(false);
        //   navigate("/vocabbook/review");
        // }}
        >
          Single Mode
        </ReviewModeBtn>
        <ReviewModeBtn
          isBattle={!isBattle}
          onClick={() => {
            setIsBattle(true);
            navigate(`/vocabbook/review/${pin}`);
          }}
        >
          Battle Mode
        </ReviewModeBtn>
      </ModeBtns>
      <Outlet context={{ viewingBook }} />
    </Wrapper>
  );
}
