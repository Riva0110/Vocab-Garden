import styled from "styled-components";
import VocabDetails from "../../component/VocabDetails";
import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

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
const Date = styled.div``;
const Title = styled.div``;
const AddBtn = styled.button`
  width: 50px;
  margin-left: auto;
`;

const testArticles = [
  { date: 1667099325, title: "Hello, World!" },
  { date: 1667099361, title: "heyyyyyyyyyyyyyyyyyyy" },
];

export default function Articles() {
  const navigate = useNavigate();
  // const [isEditing, setIsEditing] = useState<boolean>();
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
        {testArticles.map(({ date, title }, index) => {
          return (
            <ArticleTitle>
              <Date>{date}</Date>
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
