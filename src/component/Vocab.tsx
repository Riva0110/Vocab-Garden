import { useEffect, useState } from "react";
import styled from "styled-components";
import audio from "./audio.png";
import save from "./save.png";

const Wrapper = styled.div``;
const VocabWrapper = styled.div``;
const TitleContainer = styled.div``;
const Vocab = styled.div``;
const Phonetic = styled.div``;
const AudioImg = styled.img`
  width: 30px;
`;
const SaveVocabImg = styled.img`
  width: 30px;
`;

interface vocabDetailsInterface {
  word: string;
  phonetic?: string;
  phonetics?: string;
  meanings?: string;
  license?: string;
  sourceUrls?: string;
}

export default function VocabDetails() {
  const [vocabDetails, setVocabDetails] = useState<vocabDetailsInterface>();
  const resourceUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/daddy";

  useEffect(() => {
    async function fetchVocabDetails(resourceUrl: string) {
      const response = await fetch(resourceUrl);
      const data = await response.json();
      setVocabDetails(data[0]);
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
        </TitleContainer>
      </VocabWrapper>
    </Wrapper>
  );
}
