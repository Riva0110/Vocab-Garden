import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { keywordContext } from "../../context/keywordContext";
import { authContext } from "../../context/authContext";
import { vocabBookContext, VocabBooks } from "../../context/vocabBookContext";
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  Fragment,
} from "react";
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
import plant from "./plant.webp";
import deleteBtn from "./delete.png";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import ReactWordcloud, { Optional, Options } from "react-wordcloud";

const Wrapper = styled.div`
  display: flex;
  padding: 80px 20px 20px 20px;
  gap: 30px;
`;

const Img = styled.img`
  position: fixed;
  right: 0px;
  bottom: 0px;
  width: 500px;
  opacity: 0.5;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const VocabBookWrapper = styled.div`
  width: calc((100% - 30px) / 2);
  height: calc(100vh - 160px);
  z-index: 1;
  @media screen and (max-width: 601px) {
    width: calc(100vw - 40px);
    padding: 0 10px;
  }
`;

const BookWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 40px;
  margin-bottom: 20px;
  align-items: center;
  overflow-x: scroll;
  border-bottom: 1px solid gray;
`;

const Book = styled.div`
  text-align: center;
  min-width: 150px;
  height: 100%;
  line-height: 40px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border: ${(props: Props) => (props.selected ? "1px solid gray" : "none")};
  /* border-bottom: ${(props: Props) =>
    props.selected ? "none" : "1px solid gray"}; */
  border-bottom: none;
  color: ${(props: Props) => (props.selected ? "black" : "gray")};
  background-color: ${(props: Props) => (props.selected ? "white" : "none")};
  padding: auto;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const BookInfoWrapper = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-between;
  align-items: center;
  @media screen and (max-width: 1031px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const BookButtons = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const AddButton = styled.button`
  width: 20px;
  height: 20px;
  margin-left: 10px;
  background-color: #607973;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

const Delete = styled.div`
  display: flex;
  align-items: center;
`;

const CardWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow-y: scroll;
  height: calc(100vh - 277px);
  @media screen and (max-width: 1031px) {
    height: calc(100vh - 322px);
  }
`;

const NoCards = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  width: calc((100% - 20px) / 2);
  height: 120px;
  border: 1px solid lightgray;
  border-top: 3px #607973 solid;
  overflow-y: scroll;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  @media screen and (max-width: 1101px) {
    width: 100%;
    height: auto;
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
  font-size: 18px;
  font-weight: 600;
  color: black;
  margin-bottom: 10px;
`;

const Vocab = styled.span`
  cursor: pointer;
`;

const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;

const ButtonImg = styled.img`
  width: 20px;
  cursor: pointer;
`;

const Input = styled.input`
  outline: none;
  border: 1px solid lightgray;
  height: 25px;
  padding-left: 10px;
`;

interface Props {
  selected?: boolean;
  weight?: boolean;
}

interface Log {
  isCorrect: boolean;
  testTime: {};
}

type AddFunction = (msg: string) => void;

const options = {
  enableTooltip: true,
  deterministic: true,
  fontFamily: "Poppins",
  fontSizes: [30, 50],
  fontStyle: "normal",
  fontWeight: "normal",
  padding: 1,
  rotations: 2,
  rotationAngles: [0, 0],
  scale: "sqrt",
  spiral: "archimedean",
  transitionDuration: 1000,
} as Optional<Options>;

const size = [600, 600] as [number, number];

function getAllWords(vocabBooks: VocabBooks) {
  let allWords: {
    vocab: string;
    audioLink: string;
    partOfSpeech: string;
    definition: string;
    isCorrect?: boolean | undefined;
    correctRate: number;
    log: Log[];
  }[] = [];
  const wordsByBook = Object.keys(vocabBooks).map((key) => {
    allWords = allWords.concat(vocabBooks[key]);
    return allWords;
  });
  return wordsByBook[wordsByBook.length - 1]?.filter(
    (vocab) => vocab.correctRate < 0.5 && vocab.log.length >= 5
  );
}

export default function VocabBook() {
  const navigate = useNavigate();
  const { viewingBook, setViewingBook } = useViewingBook();
  const { userId } = useContext(authContext);
  const { setKeyword } = useContext(keywordContext);
  const { vocabBooks, getVocabBooks, isSaved, setIsSaved } =
    useContext(vocabBookContext);
  const [newBook, setNewBook] = useState<string>();
  const [bookCorrectRate, setBookCorrectRate] = useState<number>();
  const ref = useRef<null | AddFunction>(null);
  const newBookRef = useRef<HTMLInputElement>(null);
  const topWrongWords = useMemo(() => {
    if (vocabBooks) {
      return getAllWords(vocabBooks)
        ?.slice(0, 10)
        .map(({ vocab, correctRate, definition }) => ({
          text: vocab,
          value: Math.floor(correctRate * 100),
          definition: definition,
        }));
    }
  }, [vocabBooks]);

  const callbacks = useMemo(() => {
    return {
      onWordClick: (word: any) => {
        setKeyword(word.text);
      },
      getWordTooltip: (word: any) => null,
    };
  }, [setKeyword]);

  useEffect(() => {
    if (
      vocabBooks &&
      Object.keys(vocabBooks) &&
      Object.keys(vocabBooks).length === 0
    ) {
      getVocabBooks(userId);
    }
  }, [getVocabBooks, userId, vocabBooks]);

  useEffect(() => {
    if (topWrongWords && topWrongWords.length >= 5) {
      async function setWrongWordsDoc() {
        await setDoc(doc(db, "wrongWordsBook", userId), {
          topWrongWords,
        });
      }
      setWrongWordsDoc();
    }
  }, [topWrongWords, userId]);

  const correctRateOfBooksArr = getCorrectRateOfBooks()?.map((logOfBook) => {
    const correctCount = logOfBook.reduce((acc, item) => {
      if (item.isCorrect) {
        acc += 1;
      }
      return acc;
    }, 0);
    return correctCount / logOfBook.length || 0;
  });

  function getCorrectRateOfBooks() {
    let log: any[][] = [];
    if (!vocabBooks) return;
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

  useEffect(() => {
    if (typeof bookCorrectRate !== "undefined") return;
    const findUnsorted = (e: string) => e === "unsorted";
    const indexOfUnsorted = Object.keys(vocabBooks).findIndex(findUnsorted);
    if (correctRateOfBooksArr) {
      setBookCorrectRate(
        Math.round(correctRateOfBooksArr[indexOfUnsorted] * 100) || 0
      );
    }
  }, [bookCorrectRate, correctRateOfBooksArr, vocabBooks]);

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
      if (newBookRef.current) {
        newBookRef.current.value = "";
      }
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
    }
  };

  function getSelectedText() {
    if (window.getSelection) {
      const txt = window.getSelection()?.toString();
      if (typeof txt !== "undefined" && txt !== "") setKeyword(txt);
    }
  }

  return (
    <Wrapper>
      <Alert
        children={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Img src={plant} alt="plant" />
      <VocabBookWrapper>
        <BookWrapper>
          {vocabBooks &&
            Object.keys(vocabBooks).map((book: string, index) => (
              <Fragment key={book}>
                <Book
                  selected={viewingBook === `${book}`}
                  onClick={() => {
                    setViewingBook(book);
                    if (correctRateOfBooksArr) {
                      setBookCorrectRate(
                        Math.round(correctRateOfBooksArr[index] * 100)
                      );
                    }
                  }}
                >
                  {book.toLocaleLowerCase()} ({vocabBooks?.[book]?.length})
                </Book>
              </Fragment>
            ))}
          <Book
            selected={viewingBook === "wrong words"}
            onClick={() => {
              setViewingBook("wrong words");
            }}
          >
            wrong words ({topWrongWords?.length})
            <br />
          </Book>
        </BookWrapper>
        <BookInfoWrapper>
          <BookButtons>
            <div>
              <Input
                onChange={(e) => setNewBook(e.target.value)}
                placeholder="Add a book"
                ref={newBookRef}
              />
              <AddButton onClick={handleAddBook}>+</AddButton>
            </div>
            <Delete>
              {viewingBook !== "wrong words" && (
                <ButtonImg
                  src={deleteBtn}
                  alt="delete"
                  onClick={() => handleDeleteBook(viewingBook)}
                />
              )}
            </Delete>
          </BookButtons>
          <Nav>
            <div>
              Correct rate:{" "}
              {viewingBook === "wrong words" ? "<50%" : `${bookCorrectRate}%`}
            </div>
            <div
              onClick={() =>
                vocabBooks[viewingBook]?.length >= 5 ||
                (viewingBook === "wrong words" &&
                  topWrongWords &&
                  topWrongWords.length >= 5)
                  ? navigate("/vocabbook/review")
                  : ref.current?.(
                      "Please save at least 5 vocab cards in this book!"
                    )
              }
            >
              {viewingBook !== "wrong words" && (
                <Button btnType={"primary"}>Review</Button>
              )}
            </div>
          </Nav>
        </BookInfoWrapper>
        <CardWrapper>
          {viewingBook === "wrong words" ? (
            topWrongWords && (
              <ReactWordcloud
                words={topWrongWords}
                callbacks={callbacks}
                options={options}
                size={size}
              />
            )
          ) : (
            <>
              {vocabBooks && vocabBooks[viewingBook].length ? (
                vocabBooks[viewingBook]?.map(
                  (
                    { vocab, audioLink, partOfSpeech, definition, correctRate },
                    index
                  ) => (
                    <Fragment key={vocab}>
                      <Card>
                        <VocabHeader>
                          <VocabTitle>
                            <Vocab
                              key={index}
                              onClick={() => vocab !== "" && setKeyword(vocab)}
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
                            <ButtonImg
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
                    </Fragment>
                  )
                )
              ) : (
                <NoCards>Save words and start reviewing!</NoCards>
              )}
            </>
          )}
        </CardWrapper>
      </VocabBookWrapper>
      <VocabDetails />
    </Wrapper>
  );
}
