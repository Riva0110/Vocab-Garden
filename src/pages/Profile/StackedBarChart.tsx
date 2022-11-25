import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { db } from "../../firebase/firebase";

const data = [
  {
    docId: "1",
    userId: 1,
    time: "11/25",
    correctRate: 0.6,
    vocabBook: "unsorted",
  },
  {
    docId: "2",
    userId: 1,
    time: "11/24",
    correctRate: 0.1,
    vocabBook: "finance",
  },
  {
    docId: "3",
    userId: 1,
    time: "11/24",
    correctRate: 1,
    vocabBook: "technology",
  },
  {
    docId: "4",
    userId: 1,
    time: "11/20",
    correctRate: 0.7,
    vocabBook: "unsorted",
  },
  {
    docId: "5",
    userId: 1,
    time: "11/24",
    correctRate: 0.33,
    vocabBook: "unsorted",
  },
  {
    docId: "6",
    userId: 1,
    time: "11/20",
    correctRate: 0.7,
    vocabBook: "unsorted",
  },
  {
    docId: "7",
    userId: 1,
    time: "11/20",
    correctRate: 0.1,
    vocabBook: "finance",
  },
  {
    docId: "8",
    userId: 1,
    time: "11/24",
    correctRate: 0.33,
    vocabBook: "unsorted",
  },
];

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
`;

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
  width: 20px;
`;

const BarItem = styled.div`
  width: 100%;
  height: 30px;
  background-color: ${(props: Props) =>
    props.isHovered ? "darkgreen" : "#95caca"};
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
  background-color: white;
  opacity: 0.6;
`;

interface Props {
  isHovered: boolean;
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
  const [selectedId, setSelectedId] = useState("");
  const navigate = useNavigate();
  // async function test() {
  //   let list: any[] = [];
  //   const friendRef = collection(db, "users");
  //   const q = query(friendRef, where("state", "==", "offline"));
  //   const querySnapshot = await getDocs(q);
  //   querySnapshot.forEach((friendDoc) => {
  //     list = [...list, friendDoc.data()];
  //   });
  //   console.log(list);
  // }

  return (
    <Wrapper>
      <Title>Learning Record</Title>
      <Chart>
        {lastWeekDate().map((date) => (
          <Bar>
            {data
              .filter(
                ({ time }) =>
                  // `${new Date(time.seconds * 1000).getMonth() + 1}/${new Date(
                  //   time.seconds * 1000
                  // ).getDate()}`
                  time === date
              )
              .map(({ vocabBook, time, docId, correctRate }) => (
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
        ))}
      </Chart>
      <LabelX>
        {lastWeekDate().map((date: string) => (
          <DateText>{date}</DateText>
        ))}
      </LabelX>
    </Wrapper>
  );
}
