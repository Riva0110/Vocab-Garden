import { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { keywordContext } from "../context/keywordContext";
import { authContext } from "..//context/authContext";
import { getDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";
import audio from "./audio.png";
import save from "./save.png";
import spinner from "./spinner.gif";

interface Props {
  isPopuping: boolean;
}

const Wrapper = styled.div`
  font-size: 12px;
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
  top: 125px;
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
  const { userId } = useContext(authContext);
  const { keyword, setKeyword } = useContext(keywordContext);
  const [vocabDetails, setVocabDetails] = useState<VocabDetailsInterface>();
  const [vocabBooks, setVocabBooks] = useState({});
  const [newBook, setNewBook] = useState<string>();
  const [selectedvocabBook, setSelectedvocabBook] =
    useState<string>("unsorted");
  const [isLoading, setIsLoading] = useState(true);
  const [isPopuping, setIsPopuping] = useState(false);
  const resourceUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;

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

  const getVocabBooks = async () => {
    const vocabBooksRef = doc(db, "vocabBooks", userId);
    const docSnap = await getDoc(vocabBooksRef);
    if (docSnap) {
      const vocabBooksData = docSnap.data() as {};
      setVocabBooks(vocabBooksData);
    }
  };

  useEffect(() => {
    getVocabBooks();
  }, []);

  const handlePlayAudio = () => {
    const audio = new Audio(vocabDetails?.phonetics?.[0].audio);
    audio.play();
  };

  const handleAddBook = async () => {
    if (newBook) {
      const docRef = doc(db, "vocabBooks", userId);
      await updateDoc(docRef, {
        [newBook]: arrayUnion(),
      });
      getVocabBooks();
    }
  };

  const handleSaveVocab = async (selectedvocabBook: string) => {
    const docRef = doc(db, "vocabBooks", userId);
    await updateDoc(docRef, {
      [selectedvocabBook]: arrayUnion({
        vocab: vocabDetails?.word,
        audioLink: vocabDetails?.phonetics?.[0]?.audio,
        partOfSpeech: vocabDetails?.meanings?.[0].partOfSpeech,
        definition: vocabDetails?.meanings?.[0].definitions?.[0].definition,
      }),
    });
  };

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
            src={save}
            alt="save"
            onClick={() => setIsPopuping(true)}
          />
          <SavePopup isPopuping={isPopuping}>
            <label>Book</label>
            <Select
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
                      <span key={index} onClick={() => setKeyword(word)}>
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
                                onClick={() => setKeyword(word)}
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
                                  onClick={() => setKeyword(word)}
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
                      <Synonyms key={index} onClick={() => setKeyword(synonym)}>
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
      <Wrapper>No result</Wrapper>
    </>
  );
}
