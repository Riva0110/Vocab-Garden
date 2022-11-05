import styled, { css } from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
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
  padding: 20px;
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
  useEffect(() => {
    console.log("riewlayout");
  }, []);

  return (
    <Wrapper>
      <Outlet
      // context={{
      //   isBattle,
      //   setIsBattle,
      //   gameOver,
      //   setGameOver,
      //   round,
      //   setRound,
      //   pin,
      //   setPin,
      //   answerCount,
      //   setAnswerCount,
      //   reviewingQuestions,
      //   setReviewingQuestions,
      // }}
      />
    </Wrapper>
  );
}

// export function useReview() {
//   return useOutletContext<ContextType>();
// }
