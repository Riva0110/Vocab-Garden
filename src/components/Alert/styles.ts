import styled from "styled-components";
import { animated } from "@react-spring/web";

export const Main = styled.div`
  cursor: pointer;
  color: #676767;
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
`;

export const Container = styled.div`
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  bottom: 60px;
  margin: 0 auto;
  left: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: flex-end;
  @media (max-width: 680px) {
    align-items: center;
  }
`;

export const Message = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 40ch;
  @media (max-width: 680px) {
    width: 100%;
  }
`;

export const Content = styled.div`
  color: white;
  background: #607973;
  opacity: 0.9;
  padding: auto;
  font-size: 1em;
  display: flex;
  justify-content: center;
  overflow: hidden;
  height: 50px;
  border-radius: 3px;
`;

export const Button = styled.button`
  cursor: pointer;
  pointer-events: all;
  outline: 0;
  border: none;
  background: transparent;
  display: flex;
  align-self: flex-end;
  overflow: hidden;
  margin: 0;
  padding: 0;
  padding-bottom: 14px;
  color: rgba(255, 255, 255, 0.5);
  :hover {
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const Life = styled(animated.div)`
  position: absolute;
  bottom: 0;
  left: 0px;
  width: auto;
  background-image: linear-gradient(130deg, lightgray, gray);
  height: 5px;
`;
