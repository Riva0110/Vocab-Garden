import { Link } from "react-router-dom";
import styled from "styled-components";
import audio from "../../components/audio.png";
import { keywordContext } from "../../context/keywordContext";
import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { getDoc, doc, arrayUnion, updateDoc } from "firebase/firestore";
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
  line-height: 150px;
  width: 100px;
  height: 150px;
  border: 1px gray solid;
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

interface BooksInterface {
  [key: string]: [
    {
      vocab: string;
      audioLink: string;
      partOfSpeech: string;
      definition: string;
    }
  ];
}

interface CardsInterface {
  vocab: string;
  audioLink: string;
  partOfSpeech: string;
  definition: string;
}

export default function VocabBook() {
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const [vocabBooks, setVocabBooks] = useState<BooksInterface>();
  const [vocabCards, setVocabCards] = useState<CardsInterface[]>([]);
  const [newBook, setNewBook] = useState<string>();
  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  const getVocabBooks = async () => {
    const vocabBooksRef = doc(db, "vocabBooks", userId);
    const docSnap = await getDoc(vocabBooksRef);
    if (docSnap) {
      const vocabBooksData = docSnap.data() as BooksInterface;
      setVocabBooks(vocabBooksData);
      setVocabCards(vocabBooksData.unsorted);
    }
  };

  const handleAddBook = async () => {
    if (newBook) {
      const docRef = doc(db, "vocabBooks", userId);
      await updateDoc(docRef, {
        [newBook]: arrayUnion(),
      });
      getVocabBooks();
      alert(`Add a ${newBook} vocabbook successfully!`);
    }
  };

  useEffect(() => {
    getVocabBooks();
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
                <Book>{book}</Book>
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
