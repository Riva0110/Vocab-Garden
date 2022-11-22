import styled from "styled-components";
import { Outlet, useOutletContext } from "react-router-dom";
import { vocabBookContext } from "../../../context/vocabBookContext";
import { authContext } from "../../../context/authContext";
import { useViewingBook } from "../VocabBookLayout";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  padding: 80px 20px 20px 20px;
`;

const ModeBtns = styled.div`
  display: flex;
  gap: 20px;
  position: relative;
  z-index: 100;
`;

const ModeBtn = styled.button`
  width: 150px;
  height: 25px;
  line-height: 25px;
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
  cursor: pointer;
  background-color: ${(props: Props) =>
    props.isBattle ? "#9dc0b8" : "rgb(255, 255, 255, 0.3)"};
  color: ${(props: Props) => (props.isBattle ? "#3e4e4a" : "#607973")};
  font-size: 14px;
  border-radius: 5px;
  border: none;
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
        <ModeBtn
          isBattle={!isBattle}
          onClick={() => {
            setIsBattle(false);
            navigate("/vocabbook/review");
          }}
        >
          Single Mode
        </ModeBtn>
        <ModeBtn
          isBattle={isBattle}
          onClick={() => {
            handleSetBattleRoom();
            setIsBattle(true);
            navigate(`/vocabbook/review/${userId + roomId}`);
          }}
        >
          Battle Mode
        </ModeBtn>
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
