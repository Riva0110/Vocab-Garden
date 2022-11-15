import styled, { css } from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import { useViewingBook } from "../VocabBookLayout";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import Button from "../../../components/Button";

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
  padding: 80px 20px 20px 20px;
`;

const ModeBtns = styled.div`
  display: flex;
  gap: 20px;
`;

type ContextType = {
  questionsNumber: number;
  isBattle: boolean;
  setIsBattle: React.Dispatch<React.SetStateAction<boolean>>;
};

const questionsNumber = 5;

export default function ReviewLayout() {
  const navigate = useNavigate();
  const { userId } = useContext(authContext);
  const [isBattle, setIsBattle] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<number>();
  const { viewingBook } = useViewingBook();
  const { vocabBooks } = useContext(vocabBookContext);
  const [name, setName] = useState<string>();

  const questionsArr = vocabBooks[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber)
    .map((question) => ({
      ...question,
    }));

  useEffect(() => {
    const randomRoomId = Math.floor(Math.random() * 10000);
    setRoomId(randomRoomId);
  }, [viewingBook]);

  useEffect(() => {
    const getUserInfo = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap: any = await getDoc(docRef);
      setName(docSnap.data().name);
    };
    getUserInfo();
  }, [userId]);

  const handleSetBattleRoom = async () => {
    await setDoc(doc(db, "battleRooms", userId + roomId), {
      roomId: roomId,
      ownerId: userId,
      competitorId: "",
      ownerName: name,
      competitorName: "",
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
        <div
          onClick={() => {
            setIsBattle(false);
            navigate("/vocabbook/review");
          }}
        >
          <Button btnType={isBattle ? "secondary" : "primary"}>
            Single Mode
          </Button>
        </div>
        <div
          onClick={() => {
            handleSetBattleRoom();
            setIsBattle(true);
            navigate(`/vocabbook/review/${userId + roomId}`);
          }}
        >
          <Button btnType={isBattle ? "primary" : "secondary"}>
            Battle Mode
          </Button>
        </div>
      </ModeBtns>
      <Outlet
        context={{ viewingBook, questionsNumber, isBattle, setIsBattle }}
      />
    </Wrapper>
  );
}

export function useReviewLayout() {
  return useOutletContext<ContextType>();
}
