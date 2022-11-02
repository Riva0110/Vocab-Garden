import { Link } from "react-router-dom";
import styled from "styled-components";
import audio from "../../components/audio.png";
import { keywordContext } from "../../context/keywordContext";
import { authContext } from "../../context/authContext";
import { vocabBookContext } from "../../context/vocabBookContext";
import { useContext, useState, useEffect } from "react";
import {
  doc,
  arrayUnion,
  updateDoc,
  deleteField,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import saved from "../../components/saved.png";
import VocabDetails from "../../components/VocabDetails";
import { useViewingBook } from "../../App";

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
  height: 100px;
  overflow-y: scroll;
  margin-right: 30px;
`;
const Book = styled.div`
  text-align: center;
  width: 100px;
  height: 50px;
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
  height: 100px;
  border: 1px gray solid;
  overflow-y: scroll;
`;

const CardText = styled.div`
  text-align: start;
  font-weight: ${(props: Props) => (props.weight ? "600" : "")};
`;

const VocabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 20px;
  font-weight: 600;
`;
const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;

const SaveVocabImg = styled.img`
  width: 20px;
`;

const Button = styled.button``;

interface Props {
  selected?: boolean;
  weight?: boolean;
}

export default function VocabBook() {
  // const { viewingBook, setViewingBook } = useViewingBook();
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const { vocabBooks, getVocabBooks } = useContext(vocabBookContext);
  const [newBook, setNewBook] = useState<string>();
  const [viewingBook, setViewingBook] = useState<string>("unsorted");

  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  const handleAddBook = async () => {
    if (newBook) {
      const vocabRef = doc(db, "vocabBooks", userId);
      await updateDoc(vocabRef, {
        [newBook]: arrayUnion(),
      });
      getVocabBooks(userId);
      setTimeout(alert, 200, `Add a "${newBook}" vocabbook successfully!`);
    }
  };

  const handleDeleteBook = async (book: string) => {
    const yes = window.confirm(`Are you sure to delete book "${book}"?`);

    if (yes) {
      const vocabRef = doc(db, "vocabBooks", userId);
      await updateDoc(vocabRef, {
        [book]: deleteField(),
      });
      getVocabBooks(userId);
      setTimeout(alert, 200, `Delete book "${book}" sucessfully!`);
    }
  };

  const handleDeleteVocabFromBook = async (vocab: string) => {
    const yes = window.confirm(
      `Are you sure to remove "${vocab}" from "${viewingBook}"?`
    );
    if (yes) {
      const vocabRef = doc(db, "vocabBooks", userId);
      const updateVocabCard = vocabBooks[viewingBook].filter(
        (vocabcard) => vocabcard.vocab !== vocab
      );
      await updateDoc(vocabRef, {
        [viewingBook]: updateVocabCard,
      });
      await deleteDoc(doc(db, "savedVocabs", `${userId}+${vocab}`));
      getVocabBooks(userId);
      setTimeout(
        alert,
        200,
        `Remove vocab "${vocab}" from "${viewingBook}" sucessfully!`
      );
    }
  };

  useEffect(() => {
    getVocabBooks(userId);
  }, []);

  return (
    <Wrapper>
      <Nav>
        <NavLink to="wordle">Wordle</NavLink>
        {vocabBooks[viewingBook]?.length >= 20 ? (
          <NavLink to="review">Review</NavLink>
        ) : (
          <span
            onClick={() =>
              alert("Please save at least 20 vocab cards in this book!")
            }
          >
            Review
          </span>
        )}

        <input onChange={(e) => setNewBook(e.target.value)} />
        <Button onClick={handleAddBook}>Add a Book</Button>
      </Nav>
      <Main>
        <VocabBookAndCard>
          <BookWrapper>
            {Object.keys(vocabBooks)
              ?.sort()
              .map((book: string) => (
                <Book
                  selected={viewingBook === `${book}` ? true : false}
                  onClick={() => {
                    setViewingBook(book);
                  }}
                >
                  {book.toLocaleLowerCase()}
                  <br />({vocabBooks?.[book]?.length})
                  <button onClick={() => handleDeleteBook(book)}>Delete</button>
                </Book>
              ))}
          </BookWrapper>
          <CardWrapper>
            {vocabBooks[viewingBook]?.map(
              ({ vocab, audioLink, partOfSpeech, definition }, index) => (
                <>
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
                      <SaveVocabImg
                        src={saved}
                        alt="save"
                        onClick={() => handleDeleteVocabFromBook(vocab)}
                      />
                    </VocabTitle>
                    <CardText weight={true}>{partOfSpeech}</CardText>
                    <CardText>
                      {definition
                        ?.split(/([\s!]+)/)
                        .map((word: string, index: number) => (
                          <span key={index} onClick={() => setKeyword(word)}>
                            {word}
                          </span>
                        ))}
                    </CardText>
                  </Card>
                </>
              )
            )}
          </CardWrapper>
        </VocabBookAndCard>
        <VocabDetails />
      </Main>
    </Wrapper>
  );
}
