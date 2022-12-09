import styled from "styled-components";
import { collection, query, getDocs } from "firebase/firestore";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import { KeywordContext } from "../../context/KeywordContext";

const commonWords = `a、b、c、d、e、f、g、h、i、j、k、l、m、n、o、p、q、r、s、t、u、v、w、x、y、z i was are were am is you  he  she  it  we  they  me  him  her  us  them  i  you  he  she  it  we  they  what  who  me  him  her  it  us  you  them  whom  mine  yours  his  hers  ours  theirs  this  that  these  those  who  whom  which  what  whose  whoever  whatever  whichever  whomever  who  whom  whose  which  that  what  whatever  whoever  whomever  whichever  myself  yourself  himself  herself  itself  ourselves  themselves  myself  yourself  himself  herself  itself  ourselves  themselves  each other  one another  anything  everybody  another  each  few  many  none  some  all  any  anybody  anyone  everyone  everything  no one  nobody  nothing  none  other  others  several  somebody  someone  something  most  enough  little  more  both  either  neither  one  much  such   a minute later accordingly actually after after a short time afterwards also and another as an example as a consequence as a result as soon as at last at lenght because    because of this before besides briefly but consequently conversely equally important finally first for example for instance for this purpose for this reason fourth from here on further furthermore gradually hence however in addition in conclusion in contrast in fact in short in spite of in spite of this in summary in the end in the meanwhile in the meantime in the same manner in the same way just as important least last last of all lastly later meanwhile moreover nevertheless next nonetheless now nor of equal importance on the contrary on the following day on the other hand other hand or presently second similarly since so soon still subsequently such as the next week then thereafter therefore third thus to be specific to begin  with to illustrate to repeat to sum up too ultimately what whatever whoever whereas whomever when while with this in mind yet                     percent   x         tw a   bas a little bit of bread and no cheese a pox on a choo a ha a ten shun aaagh aaargh aagh aah aah  bisto aargh aaroo aaroo aaroo aarrgh aarrghh aaugh about sledge abracadabra absit omen abso fucking lutely absolutely abyssinia aces ach ach y fi achievement unlocked achoo ack action adad adieu adios adsbud adsheart adzooks affirmative afternoon ag agad agh agogare agreed ah ah ah ah ah me ah so ah well ah choo aha ahchoo ahem ahh ahlie ahooga ahoogah ahoy ahoy hoy ahuh ahum ai yah aiee aieee aight aikona aiya aiyah aiyee aiyo aiyoh alack alack and alas alackaday alakazam alamak alas alas and alack alg alhamdulillah alie aliensdidit all change all good in the hood all hail all hands on deck all right all righto all righty all serene all the best allah akbar allahu akbar alleluia alley oop alley oop alleyoop allez oop allez oop allez up alligator  allo allo allow it allrighty ally oop aloha alpha and omega alr alreet alright alrighty alrite amen amidships amirite anan anchor s aweigh and then everyone on the bus clapped andele anend any time anytime aol aooga aoogah apologies applesauce april fools april fools ar areet arf arg argh arigato a right aroo arooga aroogah arp arr arrah arr  arrey arrivederci as if as you like as you were as you wish as salamu alaykum asdfghjkl assalamu alaikum assalamu alaykum astaghfirullah at ten shun atchoo atishoo atta boy atta girl attaboy attagal attagirl attakid attention au reservoir au revoir auf wiedersehen augh aunt nell avast avaunt  ave it aw aw man aw shucks aw well away aweel awoo awooga awoogah awreet awright aww aww yeah ay ay ay ay ay me ay oop ay up ay  chihuahua aye aye aye              a a a  a la   la a back a cross a  a  a k a  ab ab  abaat aback of abaft abaht abaout abart abeam aboard aboat aboon aboot about aboutes abouts above abowt abreast abroad absent abt abt  abun abune abv  accd g to according to across across from acrosst acrost ad adjacent adown affor afloat afoor afore afront afta aftah after afther aftre aftuh again againest against agaynest agaynst ageinest ageinst agen agenest agenst ageynest ageynst agin aginst ago agyen ahead of ahind ahint ahn ajax aka ala alang alangst all along all for all over all up with along along about along of along the lines of along with alongest alongside alongsides alongst aloof alow amid amiddest amiddst amidest amidst among amonge amongest amongst amoung amoungest amoungst amyddest amyddst amydst an anear anearst anenst anent anigh anighst anti aout ap  apart apart from apres apr s apr s apropos apropos of apud around arownd arter as as against as far as as for as of as opposed to as per as regards as respects as soon as as to as well as ascr  aside from aslant aslope asprawl astern of astraddle astraddle of astride at at the cost of at the feet of at the hand of at the hands of at the point of at the risk of at the sight of athwart atilt atop att atween atwix awaye ayein ayen ayond ayont b b w b  b  back in baft bang on bar barring bating be be  because because of befo befo  befoir befor before befure behind behinde behine behither belong below ben
`;

const commonWordsArray = commonWords
  .toLocaleLowerCase()
  .replace(/[^a-zA-Z]/g, " ")
  .split(" ");

const Wrapper = styled.div``;

const WordsWrapper = styled.div`
  background-color: rgb(255, 255, 255, 0.7);
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const Btn = styled.button`
  width: 70px;
`;

const Input = styled.input`
  width: 50px;
`;

const Words = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: calc(100vh - 160px);
  overflow-y: scroll;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
`;

export const ArticleWords = () => {
  const { userId } = useContext(AuthContext);
  const [content, setContent] = useState<string>("");
  const [sortByCount, setSortByCount] = useState<boolean>(false);
  const [low, setLow] = useState<string>();
  const [high, setHigh] = useState<string>();
  const { setKeyword } = useContext(KeywordContext);
  const navigate = useNavigate();
  const [articleWords, setArticleWords] = useState<[string, number][]>([]);
  const articleWordsArray = useRef<[string, number][]>([]);

  useEffect(() => {
    const getArticleContent = async () => {
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setContent((prev) => prev + doc.data().content);
      });
    };
    getArticleContent();
  }, [userId]);

  useEffect(() => {
    const countArticleWords = content
      .toLocaleLowerCase()
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .filter((x) => !commonWordsArray.includes(x))
      .reduce<Record<string, number>>(function (obj, item) {
        if (!obj[item]) {
          obj[item] = 0;
        }
        obj[item]++;
        return obj;
      }, {});
    if (sortByCount) {
      articleWordsArray.current = Object.entries(countArticleWords).sort(
        (a, b) => b[1] - a[1]
      );
      setArticleWords(articleWordsArray.current);
    } else {
      articleWordsArray.current = Object.entries(countArticleWords);
      setArticleWords(articleWordsArray.current);
    }
  }, [content, sortByCount]);

  return (
    <Wrapper>
      <WordsWrapper>
        <Buttons>
          <Btn onClick={() => navigate("/articles")}>Back</Btn>
          <Btn onClick={() => setSortByCount(false)}>Default</Btn>
          <Btn onClick={() => setSortByCount(true)}>Sort</Btn>
          <Input placeholder="low" onChange={(e) => setLow(e.target.value)} />
          <Input placeholder="high" onChange={(e) => setHigh(e.target.value)} />
          <Btn
            onClick={() => {
              if (low && high) {
                setArticleWords(
                  articleWordsArray?.current?.filter(
                    (x) => x[1] > Number(low) && x[1] < Number(high)
                  )
                );
              } else if (low) {
                setArticleWords(
                  articleWordsArray?.current?.filter((x) => x[1] > Number(low))
                );
              } else {
                setArticleWords(
                  articleWordsArray?.current?.filter((x) => x[1] < Number(high))
                );
              }
            }}
          >
            filter({articleWords?.length})
          </Btn>
        </Buttons>
        <Words>
          {articleWords?.map((word) => (
            <div
              key={word[0]}
              onClick={() => word[0] !== "" && setKeyword(word[0])}
            >
              {word[0]}: {word[1]}
            </div>
          ))}
        </Words>
      </WordsWrapper>
    </Wrapper>
  );
};
