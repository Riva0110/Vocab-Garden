import styled from "styled-components";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useEffect } from "react";
import { authContext } from "../../context/authContext";
import Button from "../../components/Button";

const ArticlesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ArticleTitle = styled.div`
  margin-bottom: 20px;
  cursor: pointer;
`;

const Time = styled.div`
  color: gray;
  font-size: 14px;
`;

const Title = styled.div`
  border-bottom: 1px solid lightgray;
  padding-bottom: 10px;
  padding-top: 10px;
  font-weight: 600;
`;

const Btns = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

interface ArticleListInterface {
  time: {
    seconds: number;
    nanoseconds: number;
  };
  title: string;
  content: string;
  id: string;
}

export default function Articles() {
  const { userId } = useContext(authContext);
  const navigate = useNavigate();
  const [articleList, setArticleList] = useState<ArticleListInterface[]>([]);

  useEffect(() => {
    const getArticles = async (userId: string) => {
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef, orderBy("time", "desc"));
      let articleListData: ArticleListInterface[] = [];
      const querySnapshot = await getDocs(q);
      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          const article = doc.data() as ArticleListInterface;
          articleListData = [...articleListData, article];
        });
        setArticleList(articleListData);
      }
    };
    getArticles(userId);
  }, [userId]);

  return (
    <div className="App">
      <ArticlesWrapper>
        <Btns>
          {/* <div
            onClick={() => {
              navigate("/articles/words");
            }}
          >
            <Button btnType="secondary">Article Words</Button>
          </div> */}
          <div
            onClick={() => {
              navigate("/articles/add");
            }}
          >
            <Button btnType="primary">Add Article</Button>
          </div>
        </Btns>
        {articleList?.map(({ time, title, id }, index) => {
          const newDate = new Date(time.seconds * 1000);
          return (
            <ArticleTitle
              key={index}
              onClick={() => {
                navigate(`/articles/${id}?title=${title}`);
              }}
            >
              <Time>{newDate.toLocaleString()}</Time>
              <Title>{title}</Title>
            </ArticleTitle>
          );
        })}
      </ArticlesWrapper>
    </div>
  );
}
