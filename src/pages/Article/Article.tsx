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
import QuillEditor from "./Editor/QuillEditor";

const Wrapper = styled.div`
  display: flex;
`;

const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TitleBtnWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleLabel = styled.label`
  margin-bottom: 5px;
`;

const TitleInput = styled.input`
  margin-bottom: 20px;
`;

const ContentLabel = styled(TitleLabel)`
  white-space: pre-line;
`;

const Title = styled.div`
  line-height: 100%;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: black;
`;

const Content = styled.div`
  font-size: 16px;
  overflow-y: scroll;
  height: calc(100vh - 160px);
  background-color: rgb(255, 255, 255, 0.7);
`;

const Btns = styled.div`
  display: flex;
  gap: 10px;
`;

const DoneBtn = styled.button`
  margin-top: 50px;
`;

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

  function getSelectedText() {
    if (window.getSelection) {
      const txt = window.getSelection()?.toString();
      if (typeof txt !== "undefined") setKeyword(txt);
    }
  }

  const renderReadMode = () => (
    <>
      <TitleBtnWrapper>
        <Title onClick={() => getSelectedText()}>{title}</Title>
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
      </TitleBtnWrapper>
      <Content
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={() => getSelectedText()}
      />
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
        <QuillEditor content={content} setContent={setContent} />
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
              navigate(`/articles/${docRef.id}?title=${title}`);
            } else {
              alert("Title and content cannot be blank!");
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
