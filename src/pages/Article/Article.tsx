import styled from "styled-components";
import VocabDetails from "../../component/VocabDetails";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/authContext";
import {
  doc,
  collection,
  query,
  where,
  setDoc,
  getDocs,
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

const Title = styled.div``;
const Content = styled.div``;

const DoneBtn = styled.button``;
const BackBtn = styled.button`
  width: 50px;
  margin-left: auto;
`;
const EditBtn = styled(BackBtn)``;

// interface Props {
//   isEditing: boolean;
//   setIsEditing: Dispatch<SetStateAction<boolean>>;
// }

// { isEditing, setIsEditing }: Props

export default function Article() {
  const navigate = useNavigate();
  const { userId } = useContext(authContext);
  const [isEditing, setIsEditing] = useState<boolean>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const articleId = urlParams.get("id");

  useEffect(() => {
    const getArticleContent = async (articleId: string) => {
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef, where("id", "==", articleId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        setTitle(doc.data().title);
        setContent(doc.data().content);
      });
    };
    if (articleId) getArticleContent(articleId);
  }, [articleId]);

  return (
    <Wrapper>
      <ArticleWrapper>
        {isEditing ? (
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
            <BackBtn onClick={() => navigate("/articles")}>Back</BackBtn>
            <EditBtn onClick={() => setIsEditing(true)}>Edit</EditBtn>
            <Title>{title}</Title>
            <Content>{content}</Content>
          </>
        )}
      </ArticleWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
