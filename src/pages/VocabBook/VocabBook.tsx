import { Link } from "react-router-dom";
import styled from "styled-components";
import VocabDetails from "../../components/VocabDetails";
import audio from "../../components/audio.png";
import { keywordContext } from "../../context/keywordContext";
import { useContext } from "react";

const Wrapper = styled.div``;
const Nav = styled.nav`
  margin-bottom: 20px;
`;
const NavLink = styled(Link)`
  margin-right: 20px;
`;

const Main = styled.div`
  display: flex;
`;

const VocabBookAndCard = styled.div`
  width: 50vw;
`;

const BookWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;
const Book = styled.div`
  text-align: center;
  line-height: 150px;
  width: 100px;
  height: 150px;
  border: 1px gray solid;
`;
const CardWrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  width: 200px;
  border: 1px gray solid;
`;
const VocabTitle = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
`;
const AudioImg = styled.img`
  width: 20px;
  height: 20px;
`;

const books = ["unsorted", "finance", "technology"];
const cards = [
  {
    vocab: "greeting",
    partOfSpeech: "verb",
    definition:
      "To welcome in a friendly manner, either in person or through another means e.g. writing or over the phone/internet",
  },
  {
    vocab: "welcome",
    audioLink:
      "https://api.dictionaryapi.dev/media/pronunciations/en/welcome-uk.mp3",
    partOfSpeech: "noun",
    definition:
      "The act of greeting someone’s arrival, especially by saying 'Welcome!'; reception.",
  },
  {
    vocab: "guest",
    audioLink:
      "https://api.dictionaryapi.dev/media/pronunciations/en/guest-us.mp3",
    partOfSpeech: "noun",
    definition:
      "A recipient of hospitality, specifically someone staying by invitation at the house of another.",
  },
];

export default function VocabBook() {
  const { setKeyword } = useContext(keywordContext);
  const handlePlayAudio = (audioLink: string) => {
    const audio = new Audio(audioLink);
    audio.play();
  };

  return (
    <Wrapper>
      <Nav>
        <NavLink to="wordle">Wordle</NavLink>
        <NavLink to="review">Review</NavLink>
      </Nav>
      <Main>
        <VocabBookAndCard>
          <BookWrapper>
            {books.map((book) => (
              <Book>{book}</Book>
            ))}
          </BookWrapper>
          <CardWrapper>
            {cards.map(
              ({ vocab, audioLink, partOfSpeech, definition }, index) => (
                <Card>
                  <VocabTitle>
                    <p>
                      <span key={index} onClick={() => setKeyword(vocab)}>
                        {vocab}
                      </span>
                    </p>
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
                  <p>{partOfSpeech}</p>
                  <p>
                    {definition
                      ?.split(/([\s!]+)/)
                      .map((word: string, index: number) => (
                        <span key={index} onClick={() => setKeyword(word)}>
                          {word}
                        </span>
                      ))}
                  </p>
                </Card>
              )
            )}
          </CardWrapper>
        </VocabBookAndCard>
      </Main>
    </Wrapper>
  );
}
