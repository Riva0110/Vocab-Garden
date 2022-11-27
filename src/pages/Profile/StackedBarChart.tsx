import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authContext } from "../../context/authContext";
import { db } from "../../firebase/firebase";

// const data = [
//   {
//     docId: "1",
//     userId: 1,
//     time: "11/25",
//     correctRate: 0.6,
//     vocabBook: "unsorted",
//   },
//   {
//     docId: "2",
//     userId: 1,
//     time: "11/24",
//     correctRate: 0.1,
//     vocabBook: "finance",
//   },
//   {
//     docId: "3",
//     userId: 1,
//     time: "11/24",
//     correctRate: 1,
//     vocabBook: "technology",
//   },
//   {
//     docId: "4",
//     userId: 1,
//     time: "11/20",
//     correctRate: 0.7,
//     vocabBook: "unsorted",
//   },
//   {
//     docId: "5",
//     userId: 1,
//     time: "11/24",
//     correctRate: 0.33,
//     vocabBook: "unsorted",
//   },
//   {
//     docId: "6",
//     userId: 1,
//     time: "11/20",
//     correctRate: 0.7,
//     vocabBook: "unsorted",
//   },
//   {
//     docId: "7",
//     userId: 1,
//     time: "11/20",
//     correctRate: 0.1,
//     vocabBook: "finance",
//   },
//   {
//     docId: "8",
//     userId: 1,
//     time: "11/24",
//     correctRate: 0.33,
//     vocabBook: "unsorted",
//   },
// ];

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
  min-height: 200px;
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

const DateText = styled.div``;

const Bar = styled.div`
  width: 30px;
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
  const { userId } = useContext(authContext);
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
      console.log(resData);
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
            <Bar>
              {filteredData.length !== 0 && (
                <ReviewCount>{filteredData.length}</ReviewCount>
              )}
              {filteredData.map(({ vocabBook, docId, correctRate }) => (
                <BarItem
                  isHovered={docId === selectedId}
                  onMouseEnter={(e) => setSelectedId(docId)}
                  onMouseLeave={(e) => setSelectedId("")}
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
          <DateText>{date}</DateText>
        ))}
      </LabelX>
    </Wrapper>
  );
}
