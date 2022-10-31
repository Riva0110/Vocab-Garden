import styled from "styled-components";
import VocabDetails from "../../component/VocabDetails";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/authContext";
import { keywordContext } from "../../context/keywordContext";
import {
  doc,
  collection,
  query,
  where,
  setDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Wrapper = styled.div`
  display: flex;
`;
const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 60%;
`;
const TitleLabel = styled.label``;
const TitleInput = styled.input``;
const ContentLabel = styled(TitleLabel)`
  white-space: pre-line;
`;
const ContentTextArea = styled.textarea`
  height: 100%;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
`;
const Content = styled.div`
  font-size: 14px;
`;

const Btns = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const DoneBtn = styled.button``;
const BackBtn = styled.button`
  width: 50px;
`;
const EditBtn = styled(BackBtn)``;

export default function Article() {
  const navigate = useNavigate();
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const [isEditing, setIsEditing] = useState<boolean>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const articleId = urlParams.get("id");
  const articleAdding = urlParams.get("add");

  useEffect(() => {
    const getArticleContent = async (articleId: string) => {
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef, where("id", "==", articleId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setTitle(doc.data().title);
        setContent(doc.data().content);
      });
    };
    if (articleId) getArticleContent(articleId);
    if (articleAdding) setIsEditing(true);
  }, [userId, articleId, articleAdding]);

  return (
    <Wrapper>
      <ArticleWrapper>
        {isEditing ? (
          articleAdding ? (
            <>
              <TitleLabel>Title</TitleLabel>
              <TitleInput
                type="text"
                onChange={(e) => setTitle(e.target.value)}
              />
              <ContentLabel>Content</ContentLabel>
              <ContentTextArea onChange={(e) => setContent(e.target.value)} />
              <DoneBtn
                onClick={async () => {
                  if (title && content) {
                    setIsEditing(false);
                    const docRef = doc(
                      collection(db, "users", userId, "articles")
                    );
                    await setDoc(docRef, {
                      id: docRef.id,
                      title,
                      content,
                      time: new Date(),
                    });
                  } else {
                    alert("Title and content cannot be left blank!");
                  }
                }}
              >
                Done
              </DoneBtn>
            </>
          ) : (
            <>
              <TitleLabel>Title</TitleLabel>
              <TitleInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <ContentLabel>Content</ContentLabel>
              <ContentTextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <DoneBtn
                onClick={async () => {
                  if (title && content && userId && articleId) {
                    setIsEditing(false);
                    const docRef = doc(
                      db,
                      "users",
                      userId,
                      "articles",
                      articleId
                    );
                    await updateDoc(docRef, {
                      title,
                      content,
                    });
                  } else {
                    alert("Title and content cannot be left blank!");
                  }
                }}
              >
                Done
              </DoneBtn>
            </>
          )
        ) : (
          <>
            <Btns>
              <BackBtn onClick={() => navigate("/articles")}>Back</BackBtn>
              <EditBtn
                onClick={() => {
                  setIsEditing(true);
                  navigate(
                    `/articles/article?title=${title}&id=${articleId}&edit=true`
                  );
                }}
              >
                Edit
              </EditBtn>
            </Btns>
            <Title>
              {title.split(/([\s!]+)/).map((word: string, index: number) => (
                <span key={index} onClick={() => setKeyword(word)}>
                  {word}
                </span>
              ))}
            </Title>
            <Content>
              {content.split(/([\s!]+)/).map((word: string, index: number) => (
                <span key={index} onClick={() => setKeyword(word)}>
                  {word}
                </span>
              ))}
            </Content>
          </>
        )}
      </ArticleWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
