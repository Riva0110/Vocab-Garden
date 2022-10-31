import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect } from "react";
import { authContext } from "../../context/authContext";
import { Outlet } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
`;
const ArticlesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 50%;
`;
const ArticleTitle = styled.div`
  margin-bottom: 20px;
  cursor: pointer;
`;
const Time = styled.div`
  color: gray;
  font-size: 10px;
`;
const Title = styled.div`
  border-bottom: 1px solid gray;
`;
const AddBtn = styled.button`
  width: 50px;
  margin-left: auto;
`;

interface articleListInterface {
  time: {
    seconds: number;
    nanoseconds: number;
  };
  title: string;
  content: string;
  id: string;
}

export default function ArticlesLayout() {
  return (
    <Wrapper>
      <Outlet />
      <VocabDetails />
    </Wrapper>
  );
}
