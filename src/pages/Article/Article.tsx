import styled from "styled-components";
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
  width: 50%;
`;
const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 80%;
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
  const articlePathName = window.location.pathname.slice(10);

  useEffect(() => {
    const getArticleContent = async (articlePathName: string) => {
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef, where("id", "==", articlePathName));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setTitle(doc.data().title);
        setContent(doc.data().content);
      });
    };
    if (articlePathName) getArticleContent(articlePathName);
    if (articlePathName === "add") setIsEditing(true);
  }, [userId, articlePathName]);

  const renderReadMode = () => (
    <>
      <Btns>
        <BackBtn onClick={() => navigate("/articles")}>Back</BackBtn>
        <EditBtn
          onClick={() => {
            setIsEditing(true);
            navigate(`/articles/${articlePathName}?title=${title}&edit=true`);
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
  );

  const renderEditMode = () => {
    return (
      <>
        <TitleLabel>Title</TitleLabel>
        <TitleInput
          type="text"
          defaultValue={articlePathName === "add" ? "" : title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <ContentLabel>Content</ContentLabel>
        <ContentTextArea
          defaultValue={articlePathName === "add" ? "" : content}
          onChange={(e) => setContent(e.target.value)}
        />
        <DoneBtn
          onClick={async () => {
            if (title && content && userId && articlePathName !== "add") {
              setIsEditing(false);
              const docRef = doc(
                db,
                "users",
                userId,
                "articles",
                articlePathName
              );
              await updateDoc(docRef, {
                title,
                content,
              });
            } else if (title && content) {
              setIsEditing(false);
              const docRef = doc(collection(db, "users", userId, "articles"));
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
    );
  };

  return (
    <Wrapper>
      <ArticleWrapper>
        {isEditing ? renderEditMode() : renderReadMode()}
      </ArticleWrapper>
    </Wrapper>
  );
}
