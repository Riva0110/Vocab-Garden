import styled from "styled-components";
import { useState, useContext, useEffect, useRef } from "react";
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
import Button from "../../components/Button";
import Alert from "../../components/Alert/Alert";

const Wrapper = styled.div`
  display: flex;
`;

const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
`;

const TitleLabel = styled.label`
  margin-bottom: 5px;
`;

const TitleInput = styled.input`
  margin-bottom: 20px;
  border: 1px lightgray solid;
  &:focus {
    outline: none;
  }
  padding: 5px 15px;
  color: #3f3c3c;
`;

const ContentLabel = styled(TitleLabel)`
  white-space: pre-line;
`;

const Title = styled.div`
  line-height: 100%;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: black;
`;

const Content = styled.div`
  font-size: 16px;
  overflow-y: scroll;
  height: calc(100vh - 240px);
`;

const Btns = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
`;

const ButtonDiv = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: flex-end;
`;

type AddFunction = (msg: string) => void;

export default function Article() {
  const navigate = useNavigate();
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const [isEditing, setIsEditing] = useState<boolean>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const articlePathName = window.location.pathname.slice(10);
  const ref = useRef<null | AddFunction>(null);

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
      <Btns>
        <div onClick={() => navigate("/articles")}>
          <Button btnType="secondary">Back</Button>
        </div>
        <div
          onClick={() => {
            setIsEditing(true);
            navigate(`/articles/${articlePathName}?title=${title}&edit=true`);
          }}
        >
          <Button btnType="primary">Edit</Button>
        </div>
      </Btns>
      <Title onClick={() => getSelectedText()}>{title}</Title>
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
        <ButtonDiv
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
              ref.current?.("Title and content cannot be blank!");
            }
          }}
        >
          <Button btnType="primary">Done</Button>
        </ButtonDiv>
      </>
    );
  };

  return (
    <Wrapper>
      <Alert
        children={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <ArticleWrapper>
        {isEditing ? renderEditMode() : renderReadMode()}
      </ArticleWrapper>
    </Wrapper>
  );
}
