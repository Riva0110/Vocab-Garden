import { Link } from "react-router-dom";
import styled from "styled-components";
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
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import audio from "../../components/audio.png";
import saved from "../../components/saved.png";
import VocabDetails from "../../components/VocabDetails";
import { useViewingBook } from "./VocabBookLayout";
import plant from "./plant.png";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
`;

const Img = styled.img`
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 500px;
`;

const Nav = styled.nav`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
`;

const NavLink = styled(Link)`
  margin-right: 20px;
  text-decoration: none;
  color: darkgreen;
  font-weight: 600;
`;

const VocabBookWrapper = styled.div`
  width: 50vw;
  margin-right: 20px;
  z-index: 1;
`;

const VocabBookAndCard = styled.div``;

const BookWrapper = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  width: 100%;
  height: 150px;
  margin-bottom: 20px;
  align-items: center;
  overflow-x: scroll;
`;

const Book = styled.div`
  text-align: center;
  min-width: 150px;
  height: 80px;
  border: solid
    ${(props: Props) => (props.selected ? "2px darkgreen" : "1px gray")};
  color: ${(props: Props) => (props.selected ? "black" : "gray")};
  background-color: lightgray;
  padding: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
`;

const CardWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  overflow-y: scroll;
  height: calc(100vh - 350px);
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  width: calc((100% - 90px) / 2);
  height: 100px;
  border: 1px gray solid;
  overflow-y: scroll;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  @media screen and (max-width: 960px) {
    width: 100%;
  }
`;

const CardText = styled.div`
  text-align: start;
  font-weight: ${(props: Props) => (props.weight ? "600" : "")};
`;

const VocabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const VocabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 20px;
  font-weight: 600;
`;

const Vocab = styled.span`
  cursor: pointer;
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
  const { viewingBook, setViewingBook } = useViewingBook();
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const { vocabBooks, getVocabBooks, isSaved, setIsSaved } =
    useContext(vocabBookContext);
  const [newBook, setNewBook] = useState<string>();

  const topWrongWords = getAllWords()?.slice(0, 10);

  useEffect(() => {
    if (topWrongWords?.length >= 5) {
      async function setWrongWordsDoc() {
        await setDoc(doc(db, "wrongWordsBook", userId), {
          topWrongWords,
        });
      }
      setWrongWordsDoc();
    }
  }, [topWrongWords, userId]);

  function getAllWords() {
    let allWords: {
      vocab: string;
      audioLink: string;
      partOfSpeech: string;
      definition: string;
      isCorrect?: boolean | undefined;
      correctRate: number;
    }[] = [];
    const wordsByBook = Object.keys(vocabBooks).map((key) => {
      allWords = allWords.concat(vocabBooks[key]);
      return allWords;
    });
    return wordsByBook[wordsByBook.length - 1]?.filter(
      (vocab) => vocab.correctRate < 0.5
    );
  }

  const correctRateOfBooksArr = getCorrectRateOfBooks().map((logOfBook) => {
    const correctCount = logOfBook.reduce((acc, item) => {
      if (item.isCorrect) {
        acc += 1;
      }
      console.log(logOfBook.length);
      return acc;
    }, 0);
    return correctCount / logOfBook.length || 0;
  });

  function getCorrectRateOfBooks() {
    let log: any[][] = [];
    Object.keys(vocabBooks).forEach((key, index) => {
      let insideLog: any[] = [];
      vocabBooks[key].map((vocab) => {
        if (vocab.log) {
          insideLog = [...insideLog, ...vocab.log];
        }

        return insideLog;
      });
      log = [...log, insideLog];
    });
    return log;
  }

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
      if (isSaved) setIsSaved(false);
      setTimeout(
        alert,
        200,
        `Remove vocab "${vocab}" from "${viewingBook}" sucessfully!`
      );
    }
  };

  function getSelectedText() {
    if (window.getSelection) {
      const txt = window.getSelection()?.toString();
      if (typeof txt !== "undefined") setKeyword(txt);
    }
  }

  useEffect(() => {
    if (Object.keys(vocabBooks).length === 0) {
      getVocabBooks(userId);
    }
  }, [getVocabBooks, userId, vocabBooks, vocabBooks.length]);

  return (
    <Wrapper>
      <Img src={plant} alt="plant" />
      <VocabBookWrapper>
        <Nav>
          <div>
            <input onChange={(e) => setNewBook(e.target.value)} />
            <Button onClick={handleAddBook}>Add a Book</Button>
          </div>
          <div>
            <NavLink to="wordle">Wordle</NavLink>
            {vocabBooks[viewingBook]?.length >= 5 ||
            topWrongWords?.length >= 5 ? (
              <NavLink to="review">Review</NavLink>
            ) : (
              <NavLink
                to=""
                onClick={() =>
                  alert("Please save at least 5 vocab cards in this book!")
                }
              >
                Review
              </NavLink>
            )}
          </div>
        </Nav>
        <VocabBookAndCard>
          <BookWrapper>
            {Object.keys(vocabBooks).map((book: string, index) => (
              <Book
                selected={viewingBook === `${book}` ? true : false}
                onClick={() => {
                  setViewingBook(book);
                }}
              >
                {book.toLocaleLowerCase()}({vocabBooks?.[book]?.length})
                <br />
                {Math.round(correctRateOfBooksArr[index] * 100)}%
                <br />
                <button onClick={() => handleDeleteBook(book)}>Delete</button>
              </Book>
            ))}
            <Book
              selected={viewingBook === "wrong words" ? true : false}
              onClick={() => {
                setViewingBook("wrong words");
              }}
            >
              wrong words({topWrongWords?.length})
              <br />
              <div> &lt; 50%</div>
              <br />
            </Book>
          </BookWrapper>
          <CardWrapper>
            {viewingBook === "wrong words" ? (
              <>
                {topWrongWords?.map(
                  (
                    { vocab, audioLink, partOfSpeech, definition, correctRate },
                    index
                  ) => (
                    <>
                      <Card>
                        <VocabHeader>
                          <VocabTitle>
                            <Vocab
                              key={index}
                              onClick={() => setKeyword(vocab)}
                            >
                              {vocab}
                            </Vocab>
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
                          <div>{Math.round(correctRate * 100)}%</div>
                        </VocabHeader>
                        <CardText
                          weight={true}
                          onClick={() => getSelectedText()}
                        >
                          ({partOfSpeech})
                        </CardText>
                        <CardText onClick={() => getSelectedText()}>
                          {definition}
                        </CardText>
                      </Card>
                    </>
                  )
                )}
              </>
            ) : (
              <>
                {vocabBooks[viewingBook]?.map(
                  (
                    { vocab, audioLink, partOfSpeech, definition, correctRate },
                    index
                  ) => (
                    <>
                      <Card>
                        <VocabHeader>
                          <VocabTitle>
                            <Vocab
                              key={index}
                              onClick={() => setKeyword(vocab)}
                            >
                              {vocab}
                            </Vocab>
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
                          <div>{Math.round(correctRate * 100)}%</div>
                        </VocabHeader>
                        <CardText
                          weight={true}
                          onClick={() => getSelectedText()}
                        >
                          ({partOfSpeech})
                        </CardText>
                        <CardText onClick={() => getSelectedText()}>
                          {definition}
                        </CardText>
                      </Card>
                    </>
                  )
                )}
              </>
            )}
          </CardWrapper>
        </VocabBookAndCard>
      </VocabBookWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
