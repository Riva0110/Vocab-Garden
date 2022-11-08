import styled, { css } from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import { useViewingBook } from "../VocabBookLayout";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";

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

type ContextType = {
  questionsNumber: number;

  // isBattle?: boolean;
  // setIsBattle?: React.Dispatch<React.SetStateAction<boolean>>;
  // gameOver: boolean;
  // setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  // round: number;
  // setRound: React.Dispatch<React.SetStateAction<number>>;
  // pin: number;
  // setPin: React.Dispatch<React.SetStateAction<number>>;
  // answerCount: { correct: number; wrong: number };
  // setAnswerCount: React.Dispatch<
  //   React.SetStateAction<{ correct: number; wrong: number }>
  // >;
  // reviewingQuestions: ReviewingQuestions[];
  // setReviewingQuestions: React.Dispatch<
  //   React.SetStateAction<ReviewingQuestions[]>
  // >;
};

const questionsNumber = 5;

export default function ReviewLayout() {
  const navigate = useNavigate();
  const { userId } = useContext(authContext);
  const [isBattle, setIsBattle] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<number>();
  const { viewingBook } = useViewingBook();
  const { vocabBooks } = useContext(vocabBookContext);

  const questionsArr = vocabBooks[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber)
    .map((question) => ({
      ...question,
      // ownerAnswer: "",
      // competitorAnswer: "",
    }));

  useEffect(() => {
    const randomRoomId = Math.floor(Math.random() * 10000);
    setRoomId(randomRoomId);
  }, [viewingBook]);

  const handleSetBattleRoom = async () => {
    await setDoc(doc(db, "battleRooms", userId + roomId), {
      roomId: roomId,
      ownerId: userId,
      competitorId: "",
      // ownerName: ownerName,
      status: "waiting",
      questions: questionsArr,
      answerCount: {
        owner: { correct: 0, wrong: 0 },
        competitor: { correct: 0, wrong: 0 },
      },
    });
  };

  return (
    <Wrapper>
      <ModeBtns>
        <ReviewModeBtn
          isBattle={isBattle}
          onClick={() => {
            setIsBattle(false);
            navigate("/vocabbook/review");
          }}
        >
          Single Mode
        </ReviewModeBtn>
        <ReviewModeBtn
          isBattle={!isBattle}
          onClick={() => {
            handleSetBattleRoom();
            setIsBattle(true);
            navigate(`/vocabbook/review/${userId + roomId}`);
          }}
        >
          Battle Mode
        </ReviewModeBtn>
      </ModeBtns>
      <Outlet context={{ viewingBook, questionsNumber }} />
    </Wrapper>
  );
}

export function useReviewLayout() {
  return useOutletContext<ContextType>();
}
