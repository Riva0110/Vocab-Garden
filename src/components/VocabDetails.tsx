import { useEffect, useState, useContext, useRef, Fragment } from "react";
import { useOnClickOutside } from "./useOnClickOutside";
import styled, { css } from "styled-components";
import { keywordContext } from "../context/KeywordContext";
import { authContext } from "../context/AuthContext";
import { vocabBookContext } from "../context/VocabBookContext";
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
import Alert from "./Alert/Alert";
import Button from "./Button/Button";
import googleTranslate from "./googleTranslate.png";
import { X } from "react-feather";
import Hint from "../components/Hint/Hint";

interface Props {
  isPopuping?: boolean;
  showVocabInMobile?: boolean;
}

const Wrapper = styled.div`
  font-size: 16px;
  width: calc((100% - 30px) / 2);
  height: calc(100vh - 160px);
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid lightgray;
  z-index: 1;
  @media screen and (max-width: 601px) {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: rgba(255, 255, 255);
    height: 0;
    transition: height 0.4s ease-out, opacity 0.2s ease-in,
      visibility 0.2s ease-in;
    visibility: 0;
    opacity: 0;
    ${(props: Props) =>
      props.showVocabInMobile &&
      css`
        opacity: 1;
        visibility: 1;
        height: calc(100vh - 300px);
      `}
  }
`;

const ErrorMsg = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #607973;
`;

const XDiv = styled(X)`
  display: none;
  cursor: pointer;
  @media screen and (max-width: 601px) {
    display: flex;
  } ;
`;

const SpinnerImg = styled.img`
  width: 40px;
`;
const VocabWrapper = styled.div`
  height: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Title = styled.div`
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
  cursor: pointer;
`;

const SaveVocabImg = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const GoogleTranslateImg = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const A = styled.a`
  display: flex;
  align-items: center;
`;

const SavePopup = styled.div`
  position: absolute;
  border: 1px solid lightgray;
  border-radius: 10px;
  top: 130px;
  background-color: white;
  display: ${(props: Props) => (props.isPopuping ? "block" : "none")};
  padding: 10px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  @media screen and (max-width: 601px) {
    top: 50px;
  }
`;

const Select = styled.select`
  width: 100%;
  height: 25px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid lightgray;
  background-color: white;
  padding-left: 10px;
  &:focus {
    outline: none;
  }
`;

const Buttons = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 10px;
`;

const AddBookWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  outline: none;
  border: 1px solid lightgray;
  height: 25px;
  padding-left: 15px;
`;

const AddButton = styled.div`
  display: flex;
  justify-content: center;
  width: 20px;
  line-height: 20px;
  height: 20px;
  margin-left: 10px;
  background-color: #607973;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

const Meanings = styled.div`
  overflow-y: scroll;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
  height: calc(100% - 20px);
`;

const PartOfSpeech = styled.div`
  color: darkgreen;
  margin-top: 30px;
  margin-bottom: 20px;
  border-bottom: 1px lightgray solid;
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

type AddFunction = (msg: string) => void;

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
  const [isError, setIsError] = useState(false);
  const [isPopuping, setIsPopuping] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const resourceUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
  const ref = useRef<null | AddFunction>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showVocabInMobile, setShowVocabInMobile] = useState(false);
  useOnClickOutside(popupRef, () => setIsPopuping(false));

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
      getVocabBooks(userId);
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
    getVocabBooks(userId);
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
    }
  };

  function checkDevice() {
    const userAgentInfo = navigator.userAgent;
    const Agents = [
      "Android",
      "iPhone",
      "SymbianOS",
      "Windows Phone",
      "iPad",
      "iPod",
    ];
    let flag = "desktop";
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = "mobile";
        break;
      }
    }
    return flag;
  }

  function getSelectedText() {
    if (checkDevice() === "desktop") {
      if (window.getSelection) {
        const txt = window.getSelection()?.toString();
        if (typeof txt !== "undefined") setKeyword(txt);
      }
    }
  }

  useEffect(() => {
    let mobileSelection;
    if (checkDevice() === "mobile") {
      mobileSelection = document.addEventListener("selectionchange", (e) => {
        const value = document.getSelection()?.toString();
        if (value) {
          setKeyword(value);
          document.getSelection()?.empty();
        }
      });
    }
    return mobileSelection;
  }, [setKeyword]);

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      try {
        if (!keyword) {
          throw new Error("No Keyword");
        }
        const response = await fetch(resourceUrl);
        const data = await response.json();

        if (response.status === 200) {
          setVocabDetails(data[0]);
          setShowVocabInMobile(true);
          const searchRef = doc(db, "searchHistory", userId);
          updateDoc(searchRef, { words: arrayUnion(keyword) });
        } else if (data.title === "No Definitions Found") {
          if (vocabDetails && vocabDetails.word !== undefined)
            setKeyword(vocabDetails.word);
          ref.current?.("Sorry......No result.");
        }

        if (response.status === 500) {
          setIsError(true);
        }
      } catch (err) {
        if (err instanceof Error) ref.current?.(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    if (keyword?.trim()?.toLowerCase() !== vocabDetails?.word) {
      fetchVocabDetails(resourceUrl);
    }
  }, [keyword, resourceUrl, setKeyword, userId, vocabDetails]);

  useEffect(() => {
    getVocabBooks(userId);
  }, [getVocabBooks, userId]);

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

  if (isLoading)
    return (
      <p>
        <SpinnerImg src={spinner} alt="spinner" />
      </p>
    );

  return isError ? (
    <Wrapper showVocabInMobile={showVocabInMobile}>
      <ErrorMsg>
        [ It should be vocabulary's definition here. ]
        <br />
        <br />
        Sorry, something went wrong and it's not your fault.
        <br />
        You can try the search again at later time.
      </ErrorMsg>
    </Wrapper>
  ) : (
    <>
      <Alert
        children={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Wrapper showVocabInMobile={showVocabInMobile}>
        <VocabWrapper>
          <TitleContainer>
            <Title>
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
              <A
                target="blank"
                href={`https://translate.google.com.tw/?hl=zh-TW&sl=en&tl=zh-TW&text=${vocabDetails?.word}%0A&op=translate`}
              >
                <GoogleTranslateImg
                  src={googleTranslate}
                  alt="googleTranslate"
                />
              </A>
              <SavePopup isPopuping={isPopuping} ref={popupRef}>
                <label>Save to Book:</label>
                <Select
                  value={selectedvocabBook}
                  onChange={(e) => {
                    setSelectedvocabBook(e.target.value);
                  }}
                >
                  {vocabBooks &&
                    Object.keys(vocabBooks)?.map((vocabBook, index) => (
                      <option key={vocabBook + index}>
                        {vocabBook.toLocaleLowerCase()}
                      </option>
                    ))}
                </Select>
                <AddBookWrapper>
                  <Input
                    ref={inputRef}
                    onChange={(e) => {
                      setNewBook(e.target.value);
                    }}
                    placeholder="Add a VocabBook"
                  />
                  <AddButton
                    onClick={async () => {
                      if (newBook && newBook?.trim() !== "") {
                        await handleAddBook();
                        setSelectedvocabBook(newBook);
                      }
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    +
                  </AddButton>
                </AddBookWrapper>
                <Buttons>
                  <Button
                    btnType="secondary"
                    onClick={() => setIsPopuping(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    btnType="primary"
                    onClick={() => {
                      if (selectedvocabBook) {
                        handleSaveVocab(selectedvocabBook);
                        getVocabBooks(userId);
                        setIsPopuping(false);
                        ref.current?.(`"${keyword}" saved successfully!`);
                      }
                    }}
                  >
                    Done
                  </Button>
                </Buttons>
              </SavePopup>
              <Hint>
                Select any words to search word's definition! <br />
                <br /> (Desktop =&gt; double click) <br /> (Mobile =&gt; long
                press)
              </Hint>
            </Title>
            <XDiv
              size={16}
              onClick={() => {
                setShowVocabInMobile(false);
              }}
            />
          </TitleContainer>
          <Meanings>
            {vocabDetails?.meanings?.map(
              ({ partOfSpeech, definitions, synonyms }, index) => (
                <Fragment key={index}>
                  <PartOfSpeech onClick={() => getSelectedText()}>
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
                  {synonyms?.length !== 0 && (
                    <>
                      <SubTitle onClick={() => getSelectedText()}>
                        Synonyms
                      </SubTitle>
                      {synonyms?.map((synonym: string, index: number) => (
                        <Synonyms
                          key={index}
                          onClick={() => {
                            synonym !== "" && setKeyword(synonym);
                            setIsPopuping(false);
                          }}
                        >
                          {synonym}
                        </Synonyms>
                      ))}
                    </>
                  )}
                </Fragment>
              )
            )}
            {keyword === "" && (
              <>
                <br />
                <div style={{ color: "gray" }}>
                  Select or double click any words to get more information!
                </div>
              </>
            )}
          </Meanings>
        </VocabWrapper>
      </Wrapper>
    </>
  );
}
