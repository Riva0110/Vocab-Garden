import { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { keywordContext } from "../context/keywordContext";
import audio from "./audio.png";
import save from "./save.png";
import spinner from "./spinner.gif";

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

interface vocabDetailsInterface {
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
  const { keyword, setKeyword } = useContext(keywordContext);
  const [vocabDetails, setVocabDetails] = useState<vocabDetailsInterface>();
  const [isLoading, setIsLoading] = useState(true);
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

  const handlePlayAudio = () => {
    const audio = new Audio(vocabDetails?.phonetics?.[0].audio);
    audio.play();
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
          <SaveVocabImg src={save} alt="save" />
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
                      <Synonyms key={index}>
                        {synonym
                          ?.split(/([\s!]+)/)
                          .map((word: string, index: number) => (
                            <span key={index} onClick={() => setKeyword(word)}>
                              {word}
                            </span>
                          ))}
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
