import { useEffect, useState, useContext, useRef } from "react";
import styled from "styled-components";
import { keywordContext } from "../context/keywordContext";
import { authContext } from "../context/authContext";
import { vocabBookContext } from "../context/vocabBookContext";
// import { useSaveVocab } from "../App";
import {
  updateDoc,
  doc,
  arrayUnion,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import audio from "./audio.png";
import save from "./save.png";
import saved from "./saved.png";
import spinner from "./spinner.gif";

interface Props {
  isPopuping: boolean;
}

const Wrapper = styled.div`
  font-size: 12px;
  height: calc(100vh - 30px);
  overflow-y: scroll;
`;
const SpinnerImg = styled.img`
  width: 40px;
`;
const VocabWrapper = styled.div``;
const TitleContainer = styled.div`
  display: flex;
  gap: 10px;
`;
const Vocab = styled.div`
  font-size: 20px;
  font-weight: 800;
`;
const Phonetic = styled.div``;
const AudioImg = styled.img`
  width: 20px;
`;
const SaveVocabImg = styled.img`
  width: 20px;
`;
const SavePopup = styled.div`
  position: absolute;
  border: 1px solid gray;
  border-radius: 10px;
  top: 170px;
  background-color: white;
  display: ${(props: Props) => (props.isPopuping ? "block" : "none")};
  padding: 10px;
`;
const Select = styled.select`
  width: 80%;
  margin-left: 10px;
`;
const Buttons = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 10px;
`;
const Button = styled.button``;
const Meanings = styled.div``;
const PartOfSpeech = styled.div`
  color: green;
  margin-top: 30px;
  border-bottom: 1px gray solid;
`;

const DefinitionWrapper = styled.div`
  font-size: 10px;
  margin-bottom: 5px;
`;

const Definition = styled.li`
  font-weight: 600;
`;

const Synonyms = styled.div`
  font-size: 10px;
`;

const Example = styled.div`
  font-size: 10px;
`;

const LastVocabBtn = styled.button`
  width: 50px;
  height: 20px;
`;

interface VocabDetailsInterface {
  word?: string;
  phonetic?: string;
  phonetics?: [
    {
      audio?: string;
    }
  ];
  meanings?: [
    {
      partOfSpeech?: string;
      definitions?: [
        {
          definition?: string;
          example?: string;
        }
      ];
      synonyms?: string[];
      antonyms?: string[];
    }
  ];
  license?: object;
  sourceUrls?: [];
}

export default function VocabDetails() {
  // const { isSaved, setIsSaved } = useSaveVocab();
  const { userId } = useContext(authContext);
  const { keyword, setKeyword } = useContext(keywordContext);
  const { vocabBooks, getVocabBooks, isSaved, setIsSaved } =
    useContext(vocabBookContext);
  const [vocabDetails, setVocabDetails] = useState<VocabDetailsInterface>();
  const [newBook, setNewBook] = useState<string>();
  const [selectedvocabBook, setSelectedvocabBook] =
    useState<string>("unsorted");
  const [isLoading, setIsLoading] = useState(true);
  const [isPopuping, setIsPopuping] = useState(false);
  const popup = useRef<HTMLDivElement>(null);
  // const [isSaved, setIsSaved] = useState(false);
  const resourceUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;

  const handlePlayAudio = () => {
    const audio = new Audio(vocabDetails?.phonetics?.[0].audio);
    audio.play();
  };

  const handleAddBook = async () => {
    if (newBook) {
      const vocabRef = doc(db, "vocabBooks", userId);
      await updateDoc(vocabRef, {
        [newBook]: arrayUnion(),
      });
      await getVocabBooks(userId);
    }
  };

  const handleSaveVocab = async (selectedvocabBook: string) => {
    setIsSaved(true);
    const vocabRef = doc(db, "vocabBooks", userId);

    console.log({
      [selectedvocabBook]: {
        vocab: vocabDetails?.word,
        audioLink: vocabDetails?.phonetics?.[0]?.audio,
        partOfSpeech: vocabDetails?.meanings?.[0].partOfSpeech,
        definition: vocabDetails?.meanings?.[0].definitions?.[0].definition,
      },
    });

    await updateDoc(vocabRef, {
      [selectedvocabBook]: arrayUnion({
        vocab: vocabDetails?.word,
        audioLink: vocabDetails?.phonetics?.[0]?.audio || "",
        partOfSpeech: vocabDetails?.meanings?.[0].partOfSpeech,
        definition: vocabDetails?.meanings?.[0].definitions?.[0].definition,
      }),
    });
    await setDoc(doc(db, "savedVocabs", `${userId}+${vocabDetails?.word}`), {
      vocab: vocabDetails?.word,
      vocabBook: selectedvocabBook,
    });
    await getVocabBooks(userId);
  };

  const handleDeleteVocabFromBook = async () => {
    const docRef = doc(db, "savedVocabs", `${userId}+${keyword}`);
    const docSnap = await getDoc(docRef);
    const savedVocabBook = docSnap.data()?.vocabBook;

    const yes = window.confirm(
      `Are you sure to unsave "${keyword}" from "${savedVocabBook}"?`
    );
    if (yes) {
      setIsSaved(false);
      await deleteDoc(doc(db, "savedVocabs", `${userId}+${keyword}`));
      const vocabRef = doc(db, "vocabBooks", userId);
      const updateVocabCard = vocabBooks[savedVocabBook].filter(
        (vocabcard) => vocabcard.vocab !== keyword
      );
      await updateDoc(vocabRef, {
        [savedVocabBook]: updateVocabCard,
      });
      getVocabBooks(userId);
      setTimeout(alert, 200, `Unsave vocab "${keyword}" sucessfully!`);
    }
  };

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      try {
        const response = await fetch(resourceUrl);
        const data = await response.json();
        setVocabDetails(data[0]);
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    }
    fetchVocabDetails(resourceUrl);
  }, [resourceUrl]);

  // useEffect(() => {
  //   getVocabBooks(userId);
  //   document.addEventListener("click", handleClickElement, false);
  //   return () => {
  //     document.removeEventListener("click", handleClickElement, false);
  //   };
  // }, []);

  // const handleClickElement = (e: any) => {
  //   if (popup.current) console.log(1, popup.current.contains(e.target));
  //   if (isPopuping && popup.current && !popup.current.contains(e.target)) {
  //     console.log(2);
  //     setIsPopuping(false);
  //   }
  // };

  useEffect(() => {
    setIsSaved(false);
    const checkIfSaved = async () => {
      const docRef = doc(db, "savedVocabs", `${userId}+${keyword}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.data()?.vocab === keyword) {
        setIsSaved(true);
      }
    };
    checkIfSaved();
  }, [userId, keyword, setIsSaved]);

  return isLoading ? (
    <p>
      <SpinnerImg src={spinner} alt="spinner" />
    </p>
  ) : vocabDetails ? (
    <Wrapper>
      <VocabWrapper>
        <LastVocabBtn>Back</LastVocabBtn>
        <TitleContainer>
          <Vocab>{vocabDetails?.word}</Vocab>
          <Phonetic>{vocabDetails?.phonetic}</Phonetic>
          {vocabDetails?.phonetics?.[0]?.audio && (
            <AudioImg src={audio} alt="audio" onClick={handlePlayAudio} />
          )}
          <SaveVocabImg
            src={isSaved ? saved : save}
            alt="save"
            onClick={() =>
              isSaved ? handleDeleteVocabFromBook() : setIsPopuping(true)
            }
          />
          <SavePopup isPopuping={isPopuping} ref={popup}>
            <label>Book</label>
            <Select
              value={selectedvocabBook}
              onChange={(e: any) => {
                setSelectedvocabBook(e.target.value);
              }}
            >
              {Object.keys(vocabBooks)?.map((vocabBook, index) => (
                <option key={vocabBook + index}>{vocabBook}</option>
              ))}
            </Select>
            <Buttons>
              <input onChange={(e) => setNewBook(e.target.value)} />
              <Button onClick={() => handleAddBook()}>Add a book</Button>
              <Button onClick={() => setIsPopuping(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (selectedvocabBook) {
                    handleSaveVocab(selectedvocabBook);
                    getVocabBooks(userId);
                    setIsPopuping(false);
                    alert(
                      `"${keyword}" saved in the "${selectedvocabBook}" vocabbook successfully!`
                    );
                  }
                }}
              >
                Done
              </Button>
            </Buttons>
          </SavePopup>
        </TitleContainer>
        <Meanings>
          {vocabDetails?.meanings?.map(
            ({ partOfSpeech, definitions, synonyms }) => (
              <>
                <PartOfSpeech key={partOfSpeech}>
                  {partOfSpeech
                    ?.split(/([\s!]+)/)
                    .map((word: string, index: number) => (
                      <span
                        key={index}
                        onClick={() => {
                          setKeyword(word);
                          setIsPopuping(false);
                        }}
                      >
                        {word}
                      </span>
                    ))}
                </PartOfSpeech>
                <p>Definitions</p>
                <ul>
                  {definitions?.map(
                    ({ definition, example }, index: number) => (
                      <DefinitionWrapper key={index}>
                        <Definition key={definition}>
                          {definition
                            ?.split(/([\s!]+)/)
                            .map((word: string, index: number) => (
                              <span
                                key={index}
                                onClick={() => {
                                  setKeyword(word);
                                  setIsPopuping(false);
                                }}
                              >
                                {word}
                              </span>
                            ))}
                        </Definition>
                        {example && (
                          <Example>
                            "
                            {example
                              ?.split(/([\s!]+)/)
                              .map((word: string, index: number) => (
                                <span
                                  key={index}
                                  onClick={() => {
                                    setKeyword(word);
                                    setIsPopuping(false);
                                  }}
                                >
                                  {word}
                                </span>
                              ))}
                            "
                          </Example>
                        )}
                      </DefinitionWrapper>
                    )
                  )}
                </ul>
                {synonyms?.length !== 0 ? (
                  <>
                    <p>Synonyms</p>
                    {synonyms?.map((synonym: string, index: number) => (
                      <Synonyms
                        key={index}
                        onClick={() => {
                          setKeyword(synonym);
                          setIsPopuping(false);
                        }}
                      >
                        {synonym}
                      </Synonyms>
                    ))}
                  </>
                ) : (
                  ""
                )}
              </>
            )
          )}
        </Meanings>
      </VocabWrapper>
    </Wrapper>
  ) : (
    <>
      <LastVocabBtn>Back</LastVocabBtn>
      <Wrapper>Sorry......No result.</Wrapper>
    </>
  );
}
