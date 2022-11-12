import { useEffect, useState, useContext, useRef } from "react";
import styled from "styled-components";
import { keywordContext } from "../context/keywordContext";
import { authContext } from "../context/authContext";
import { vocabBookContext } from "../context/vocabBookContext";
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
  padding-right: 20px;
  height: calc(100vh - 30px);
  overflow-y: scroll;
`;
const SpinnerImg = styled.img`
  width: 40px;
`;
const VocabWrapper = styled.div``;
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;
`;
const Vocab = styled.div`
  font-size: 20px;
  font-weight: 800;
`;
const Phonetic = styled.div``;
const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;
const SaveVocabImg = styled.img`
  width: 20px;
  height: 20px;
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
  margin-bottom: 20px;
  border-bottom: 1px gray solid;
  font-size: 14px;
`;

const SubTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
`;

const DefinitionWrapper = styled.div`
  margin-bottom: 5px;
`;

const Definition = styled.li``;

const Synonyms = styled.div``;

const Example = styled.div``;

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

    await updateDoc(vocabRef, {
      [selectedvocabBook]: arrayUnion({
        vocab: vocabDetails?.word,
        audioLink: vocabDetails?.phonetics?.[0]?.audio || "",
        partOfSpeech: vocabDetails?.meanings?.[0].partOfSpeech,
        definition: vocabDetails?.meanings?.[0].definitions?.[0].definition,
        correctRate: 0,
        log: [],
      }),
    });
    await setDoc(doc(db, "savedVocabs", `${userId}+${vocabDetails?.word}`), {
      userId,
      vocab: vocabDetails?.word,
      vocabBook: selectedvocabBook,
      audioLink: vocabDetails?.phonetics?.[0]?.audio || "",
      partOfSpeech: vocabDetails?.meanings?.[0].partOfSpeech,
      definition: vocabDetails?.meanings?.[0].definitions?.[0].definition,
      correctRate: 0,
      log: [],
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

  function getSelectedText() {
    if (window.getSelection) {
      const txt = window.getSelection()?.toString();
      if (typeof txt !== "undefined") setKeyword(txt);
    }
  }

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      const response = await fetch(resourceUrl);
      const data = await response.json();
      if (data.title === "No Definitions Found")
        return alert("Sorry......No result.");
      setVocabDetails(data[0]);
      setIsLoading(false);
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
  ) : (
    <Wrapper>
      <VocabWrapper>
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
                <PartOfSpeech
                  key={partOfSpeech}
                  onClick={() => getSelectedText()}
                >
                  {partOfSpeech}
                </PartOfSpeech>
                <SubTitle onClick={() => getSelectedText()}>
                  Definitions
                </SubTitle>
                <ul>
                  {definitions?.map(
                    ({ definition, example }, index: number) => (
                      <DefinitionWrapper key={index}>
                        <Definition
                          key={definition}
                          onClick={() => getSelectedText()}
                        >
                          {definition}
                        </Definition>
                        {example && (
                          <Example onClick={() => getSelectedText()}>
                            "{example}"
                          </Example>
                        )}
                      </DefinitionWrapper>
                    )
                  )}
                </ul>
                {synonyms?.length !== 0 ? (
                  <>
                    <SubTitle onClick={() => getSelectedText()}>
                      Synonyms
                    </SubTitle>
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
  );
}
