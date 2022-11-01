import { Link } from "react-router-dom";
import styled from "styled-components";
import audio from "../../components/audio.png";
import { keywordContext } from "../../context/keywordContext";
import { authContext } from "../../context/authContext";
import { vocabBookContext } from "../../context/vocabBookContext";
import { useContext, useState, useEffect } from "react";
import { doc, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Wrapper = styled.div``;
const Nav = styled.nav`
  margin-bottom: 20px;
`;
const NavLink = styled(Link)`
  margin-right: 20px;
`;

const Main = styled.div`
  display: flex;
`;

const VocabBookAndCard = styled.div`
  width: 50vw;
`;

const BookWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;
const Book = styled.div`
  text-align: center;
  width: 100px;
  height: 150px;
  border: 1px solid ${(props: Props) => (props.selected ? "red" : "gray")};
`;
const CardWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  width: 200px;
  border: 1px gray solid;
`;
const VocabTitle = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
`;
const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;

const Button = styled.button``;

interface CardsInterface {
  vocab: string;
  audioLink: string;
  partOfSpeech: string;
  definition: string;
}

interface Props {
  selected: boolean;
}

export default function VocabBook() {
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const [vocabCards, setVocabCards] = useState<CardsInterface[]>([]);
  const [newBook, setNewBook] = useState<string>();
  const [viewingBook, setViewingBook] = useState<string>("unsorted");
  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  const handleAddBook = async () => {
    if (newBook) {
      const docRef = doc(db, "vocabBooks", userId);
      await updateDoc(docRef, {
        [newBook]: arrayUnion(),
      });
      getVocabBooks(userId);
      alert(`Add a ${newBook} vocabbook successfully!`);
    }
  };

  useEffect(() => {
    getVocabBooks(userId);
    setVocabCards(vocabBooks["unsorted"]);
  }, []);

  return (
    <Wrapper>
      <Nav>
        <NavLink to="wordle">Wordle</NavLink>
        <NavLink to="review">Review</NavLink>
        <input onChange={(e) => setNewBook(e.target.value)} />
        <Button onClick={handleAddBook}>Add a Book</Button>
      </Nav>
      <Main>
        <VocabBookAndCard>
          <BookWrapper>
            {vocabBooks &&
              Object.keys(vocabBooks)?.map((book: string) => (
                <Book
                  selected={viewingBook === `${book}` ? true : false}
                  onClick={() => {
                    setViewingBook(book);
                    setVocabCards(vocabBooks[book]);
                  }}
                >
                  {book}
                  <br />({vocabBooks[book].length})
                </Book>
              ))}
          </BookWrapper>
          <CardWrapper>
            {vocabCards?.map(
              ({ vocab, audioLink, partOfSpeech, definition }, index) => (
                <Card>
                  <VocabTitle>
                    <p>
                      <span key={index} onClick={() => setKeyword(vocab)}>
                        {vocab}
                      </span>
                    </p>
                    {audioLink ? (
                      <AudioImg
                        src={audio}
                        alt="audio"
                        onClick={() => handlePlayAudio(audioLink)}
                      />
                    ) : (
                      ""
                    )}
                  </VocabTitle>
                  <p>{partOfSpeech}</p>
                  <p>
                    {definition
                      ?.split(/([\s!]+)/)
                      .map((word: string, index: number) => (
                        <span key={index} onClick={() => setKeyword(word)}>
                          {word}
                        </span>
                      ))}
                  </p>
                </Card>
              )
            )}
          </CardWrapper>
        </VocabBookAndCard>
      </Main>
    </Wrapper>
  );
}
