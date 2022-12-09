import styled from "styled-components";
import { Outlet, useOutletContext, useNavigate } from "react-router-dom";
import {
  useState,
  useEffect,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { VocabBookContext } from "../../../context/VocabBookContext";
import { AuthContext } from "../../../context/AuthContext";
import { useViewingBook } from "../VocabBookLayout";
import { db } from "../../../firebase/firebase";
import Hint from "../../../components/Hint/Hint";

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

const ModeBtnsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 100;
`;

const VocabBook = styled.div`
  width: 33%;
`;

const HintWrapper = styled.div`
  width: 33%;
  display: flex;
  justify-content: end;
`;

const ModeBtns = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 33%;
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
  border: 1px lightgray solid;
`;

const GameRule = styled.div`
  background-color: lightgray;
  padding: 10px;
`;

type ContextType = {
  questionsNumber: number;
  isBattle: boolean;
  setIsBattle: Dispatch<SetStateAction<boolean>>;
};

const questionsNumber = 5;

export default function ReviewLayout() {
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);
  const [isBattle, setIsBattle] = useState<boolean>(false);
  const roomId = Math.floor(Math.random() * 10000);
  const { viewingBook } = useViewingBook();
  const { vocabBooks } = useContext(VocabBookContext);
  const [name, setName] = useState<string>();

  const questionsArr = vocabBooks[viewingBook]
    ?.sort(() => Math.random() - 0.5)
    .slice(0, questionsNumber)
    .map((question) => ({
      ...question,
    }));

  useEffect(() => {
    const getUserInfo = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      setName(docSnap?.data()?.name);
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
      invitingList: [],
    });
  };

  return (
    <Wrapper>
      <ModeBtnsWrapper>
        {window.screen.width > 401 ? (
          <VocabBook>[VocabBook] {viewingBook}</VocabBook>
        ) : (
          <VocabBook></VocabBook>
        )}
        <ModeBtns>
          <ModeBtn
            isBattle={!isBattle}
            onClick={() => {
              setIsBattle(false);
              navigate("/vocabbook/review");
            }}
          >
            Single {window.screen.width > 750 && "Mode"}
          </ModeBtn>
          <ModeBtn
            isBattle={isBattle}
            onClick={() => {
              handleSetBattleRoom();
              setIsBattle(true);
              navigate(`/vocabbook/review/${userId + roomId}`);
            }}
          >
            Battle {window.screen.width > 750 && "Mode"}
          </ModeBtn>
        </ModeBtns>
        <HintWrapper>
          <Hint>
            <GameRule>
              If you are in a challenge,
              <br /> you can get 1 point by two ways:
              <br />
              <br />
              1. [Single Mode] <br />
              ．correct rate &gt;= 80%
              <br />
              <br />
              2. [Battle Mode] <br />
              ．Invite your friends to battle <br />
              ．Win the battle!
              <br />
              ．correct rate &gt;= 80%
              <br />
              <br />
              Reminder:
              <br />
              1. You need to review at least once a day,
              <br />
              &nbsp;&nbsp;&nbsp;otherwise you would lose 1 point per day.
              <br />
              2. If the score was deducted to 0,
              <br />
              &nbsp;&nbsp;&nbsp;the plant would die.
              <br />
            </GameRule>
            <br />
            Haven&apos;t started a challenge?
            <div
              onClick={() => {
                navigate("/profile");
              }}
            >
              &gt;&gt;&gt; Click me &gt;&gt;&gt;
            </div>
          </Hint>
        </HintWrapper>
      </ModeBtnsWrapper>
      <Outlet
        context={{ viewingBook, questionsNumber, isBattle, setIsBattle }}
      />
    </Wrapper>
  );
}

export function useReviewLayout() {
  return useOutletContext<ContextType>();
}
