import styled from "styled-components";
import VocabDetails from "../../component/VocabDetails";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/authContext";
import { doc, collection, addDoc, setDoc } from "firebase/firestore";
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
                setIsEditing(false);
                await addDoc(collection(db, "users", userId, "articles"), {
                  title,
                  content,
                  time: new Date(),
                });
              }}
            >
              Done
            </DoneBtn>
          </>
        ) : (
          <>
            <BackBtn onClick={() => navigate("/articles")}>Back</BackBtn>
            <EditBtn onClick={() => setIsEditing(true)}>Edit</EditBtn>
            <Title>Welcome Welcome</Title>
            <Content>
              Definitions Whose arrival is a cause of joy; received with
              gladness; admitted willingly to the house, entertainment, or
              company. "Refugees welcome in London!" Producing gladness. "a
              welcome present;  welcome news" Free to have or enjoy
              gratuitously. "You are welcome to the use of my library." \r\n
              Definitions Whose arrival is a cause of joy; received with
              gladness; admitted willingly to the house, entertainment, or
              company. "Refugees welcome in London!" Producing gladness. "a
              welcome present;  welcome news" Free to have or enjoy
              gratuitously. "You are welcome to the use of my library." \r\n
              Definitions Whose arrival is a cause of joy; received with
              gladness; admitted willingly to the house, entertainment, or
              company. "Refugees welcome in London!" Producing gladness. "a
              welcome present;  welcome news" Free to have or enjoy
              gratuitously. "You are welcome to the use of my library."
            </Content>
          </>
        )}
      </ArticleWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
