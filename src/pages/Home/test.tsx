import { useState } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  padding: 20px;
`;

interface ObjectInterface {
  type: number;
  content: string[];
}

interface Props {
  hey: ObjectInterface;
  setHey: React.Dispatch<React.SetStateAction<ObjectInterface>>;
}

export default function Test(props: Props) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Zet");

  // const handleClick = () => {
  //   // flushSync(() => {
  //   setCount(count + 1);
  //   // });
  //   setName(name + "1");

  //   console.log(count);
  // };

  return (
    <Wrapper>
      <p>{props.hey.content[0]}</p>
      {/* <p>
        {count} {name}
      </p>
      <button onClick={handleClick}></button> */}
    </Wrapper>
  );
}
