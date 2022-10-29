import { useEffect, useState } from "react";
import styled from "styled-components";
import audio from "./audio.png";
import save from "./save.png";

const Wrapper = styled.div`
  font-size: 12px;
`;
const VocabWrapper = styled.div``;
const TitleContainer = styled.div``;
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
  font-weight: 800;
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
  phonetics?: object[];
  meanings?: object[];
  license?: object;
  sourceUrls?: [];
}

interface meaningInterface {
  partOfSpeech?: string;
  definitions?: object[];
  synonyms?: string[];
  antonyms?: string[];
}

interface definitionInterface {
  definition?: string;
  example?: string;
}

export default function VocabDetails() {
  const [vocabDetails, setVocabDetails] = useState<vocabDetailsInterface>();
  const resourceUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/day";

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      try {
        const response = await fetch(resourceUrl);
        const data = await response.json();
        setVocabDetails(data[0]);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    fetchVocabDetails(resourceUrl);
  }, []);

  return (
    <Wrapper>
      <VocabWrapper>
        <TitleContainer>
          <Vocab>{vocabDetails?.word}</Vocab>
          <Phonetic>{vocabDetails?.phonetic}</Phonetic>
          <AudioImg src={audio} alt="audio" />
          <SaveVocabImg src={save} alt="save" />
          <Meanings>
            {vocabDetails?.meanings?.map((meaning: meaningInterface) => (
              <>
                <PartOfSpeech key={meaning.partOfSpeech}>
                  {meaning.partOfSpeech}
                </PartOfSpeech>
                <p>Definitions</p>
                <ul>
                  {meaning.definitions?.map(
                    (definition: definitionInterface) => (
                      <DefinitionWrapper>
                        <Definition>{definition.definition}</Definition>
                        <Example>
                          {definition.example && `"${definition.example}"`}
                        </Example>
                      </DefinitionWrapper>
                    )
                  )}
                </ul>
                {meaning.synonyms?.length === 0 ? (
                  ""
                ) : (
                  <>
                    <p>Synonyms</p>
                    {meaning.synonyms?.map((synonym: string) => (
                      <Synonyms>{synonym}</Synonyms>
                    ))}
                  </>
                )}
              </>
            ))}
          </Meanings>
        </TitleContainer>
      </VocabWrapper>
    </Wrapper>
  );
}
