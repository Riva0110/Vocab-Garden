import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";

const Wrapper = styled.div`
  width: 100%;
  padding: 20px;
  margin-top: 30px;
`;

const Title = styled.div`
  text-align: center;
  border-top: 1px solid lightgray;
  padding-top: 60px;
  margin-bottom: 20px;
  font-size: 20px;
`;

const Unit = styled.div``;

const Chart = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  min-height: 250px;
  border-left: 1px solid gray;
  border-bottom: 1px solid gray;
  position: relative;
`;

const LabelX = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 14px;
  padding-top: 10px;
`;

const DateText = styled.div`
  width: 32px;
`;

const Bar = styled.div`
  width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ReviewCount = styled.div`
  text-align: center;
  color: #607973;
`;

const BarItem = styled.div`
  width: 100%;
  height: 30px;
  background-color: ${(props: Props) =>
    props.isHovered ? "#607973" : "#95caca"};
  border-bottom: 1px solid white;
  cursor: pointer;
  @media screen and (max-width: 1025px) {
    width: 80%;
  }
`;

const Message = styled.div`
  position: absolute;
  left: 0;
  top: -20px;
  width: 100%;
  z-index: 100;
  padding: 20px;
  display: ${(props: Props) => (props.isHovered ? "flex" : "none")};
  justify-content: space-between;
  flex-direction: column;
  text-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  color: gray;
  opacity: 0.6;
`;

interface Props {
  isHovered: boolean;
}

interface Data {
  docId: string;
  userId: string;
  time: {
    seconds: number;
    nanoseconds: number;
  };
  correctRate: number;
  vocabBook: string;
}

function getWeekTime(n: number) {
  const now = new Date();
  const time = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  return `${time.getMonth() + 1}/${time.getDate()}`;
}

const lastWeekDate = () => {
  const date = [6, 5, 4, 3, 2, 1, 0];
  return date.map((day) => getWeekTime(day));
};

export default function StackedBarChart() {
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState<Data[] | []>([]);

  useEffect(() => {
    async function getReviewLog() {
      let resData: Data[] | [] = [];
      const friendRef = collection(db, "reviewLog");
      const q = query(friendRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((reviewDoc) => {
        resData = [...resData, reviewDoc.data() as Data];
      });
      setData(resData);
    }

    getReviewLog();
  }, [userId]);

  return (
    <Wrapper>
      <Title>Learning Record</Title>
      <Unit>Times</Unit>
      <Chart>
        {lastWeekDate().map((date) => {
          const filteredData = data.filter(
            ({ time }) =>
              `${new Date(time.seconds * 1000).getMonth() + 1}/${new Date(
                time.seconds * 1000
              ).getDate()}` === date
          );
          return (
            <Bar key={date}>
              {filteredData.length !== 0 && (
                <ReviewCount>{filteredData.length}</ReviewCount>
              )}
              {filteredData.map(({ vocabBook, docId, correctRate }) => (
                <BarItem
                  key={docId}
                  isHovered={docId === selectedId}
                  onMouseEnter={() => setSelectedId(docId)}
                  onMouseLeave={() => setSelectedId("")}
                  onClick={() => navigate("/vocabbook")}
                >
                  <Message isHovered={docId === selectedId}>
                    <div>
                      [VocabBook]{""}
                      {""} {vocabBook}
                    </div>
                    <div>[Correct Rate] {Math.floor(correctRate * 100)}% </div>
                  </Message>
                </BarItem>
              ))}
            </Bar>
          );
        })}
      </Chart>
      <LabelX>
        {lastWeekDate().map((date: string) => (
          <DateText key={date}>{date}</DateText>
        ))}
      </LabelX>
    </Wrapper>
  );
}
