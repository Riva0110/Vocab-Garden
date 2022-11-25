import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../../firebase/firebase";

const data = [
  {
    userId: 1,
    time: "11/25",
    correctRate: 0.6,
    vocabBook: "unsorted",
  },
  {
    userId: 1,
    time: "11/24",
    correctRate: 0.1,
    vocabBook: "finance",
  },
  {
    userId: 1,
    time: "11/24",
    correctRate: 1,
    vocabBook: "technology",
  },
  {
    userId: 1,
    time: "11/20",
    correctRate: 0.7,
    vocabBook: "unsorted",
  },
  {
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
  background-color: #95caca;
  border: 1px solid white;
  position: relative;
`;

const Message = styled.div`
  position: absolute;
  top: 18px;
  right: 10px;
  min-width: 225px;
  z-index: 1000;
  border: 1px solid #607973;
  border-radius: 10px;
  padding: 20px;
  display: ${(props: Props) => (props.isShown ? "block" : "none")};
  background-color: #fff;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  white-space: pre-line;
`;

interface Props {
  isShown: boolean;
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
  const [isShown, setIsShown] = useState(false);
  console.log(isShown);
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
                ({ vocabBook, time }) =>
                  // `${new Date(time.seconds * 1000).getMonth() + 1}/${new Date(
                  //   time.seconds * 1000
                  // ).getDate()}`
                  time === date
              )
              .map(() => (
                <BarItem
                  onMouseEnter={(e) => setIsShown(true)}
                  onMouseLeave={(e) => setIsShown(false)}
                >
                  <Message isShown={isShown}>hello</Message>
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
