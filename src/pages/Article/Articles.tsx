import styled from "styled-components";
import VocabDetails from "../../component/VocabDetails";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect } from "react";
import { authContext } from "../../context/authContext";

const Wrapper = styled.div`
  display: flex;
`;
const ArticlesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 60%;
`;
const ArticleTitle = styled.div`
  margin-bottom: 20px;
`;
const Date = styled.div`
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
}

export default function Articles() {
  const { userId } = useContext(authContext);
  const navigate = useNavigate();
  const [articleList, setArticleList] = useState<articleListInterface[]>([]);
  // const [isEditing, setIsEditing] = useState<boolean>();

  useEffect(() => {
    const getArticles = async (userId: string) => {
      let articleListData: articleListInterface[] = [];
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "articles")
      );
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          const article = doc.data() as articleListInterface;
          articleListData = [...articleListData, article];
        });
        setArticleList(articleListData);
      }
    };
    getArticles(userId);
  }, [userId]);

  return (
    <Wrapper>
      <ArticlesWrapper>
        <AddBtn
          onClick={() => {
            navigate("/articles/article");
            // setIsEditing(true);
          }}
        >
          +
        </AddBtn>
        {articleList?.map(({ time, title }, index) => {
          // const readableTime = new Date(time.seconds);
          return (
            <ArticleTitle key={index}>
              <Date>{time.toLocaleString()}</Date>
              <Title
                onClick={() => {
                  navigate("/articles/article");
                  // setIsEditing(false);
                }}
              >
                {title}
              </Title>
            </ArticleTitle>
          );
        })}
      </ArticlesWrapper>
      <VocabDetails />
      {/* isEditing={isEditing} setIsEditing={setIsEditing} */}
    </Wrapper>
  );
}
