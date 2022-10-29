import { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { keywordContext } from "../context/keywordContext";
import audio from "./audio.png";
import save from "./save.png";

const Wrapper = styled.div`
  font-size: 12px;
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
  const [vocabDetails, setVocabDetails] = useState<vocabDetailsInterface>();
  const [audioUrl, setAudioUrl] = useState();
  const { keyword } = useContext(keywordContext);
  const resourceUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
  console.log(keyword);

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      try {
        const response = await fetch(resourceUrl);
        const data = await response.json();
        setVocabDetails(data[0]);
        setAudioUrl(data[0].phonetics.slice(0, 1)[0].audio);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    fetchVocabDetails(resourceUrl);
  }, [resourceUrl]);

  const handlePlayAudio = () => {
    // const audio = new Audio(vocabDetails?.phonetics?[0].audio);
    console.log(audioUrl);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return vocabDetails ? (
    <Wrapper>
      <VocabWrapper>
        <TitleContainer>
          <Vocab>{vocabDetails?.word}</Vocab>
          <Phonetic>{vocabDetails?.phonetic}</Phonetic>
          {audioUrl && (
            <AudioImg src={audio} alt="audio" onClick={handlePlayAudio} />
          )}
          <SaveVocabImg src={save} alt="save" />
        </TitleContainer>
        <Meanings>
          {vocabDetails?.meanings?.map(
            ({ partOfSpeech, definitions, synonyms }) => (
              <>
                <PartOfSpeech key={partOfSpeech}>{partOfSpeech}</PartOfSpeech>
                <p>Definitions</p>
                <ul>
                  {definitions?.map(
                    ({ definition, example }, index: number) => (
                      <DefinitionWrapper key={index}>
                        <Definition>{definition}</Definition>
                        <Example>{example && `"${example}"`}</Example>
                      </DefinitionWrapper>
                    )
                  )}
                </ul>
                {synonyms?.length !== 0 ? (
                  <>
                    <p>Synonyms</p>
                    {synonyms?.map((synonym: string, index: number) => (
                      <Synonyms key={index}>{synonym}</Synonyms>
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
    <Wrapper>no result</Wrapper>
  );
}
