import styled from "styled-components";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/authContext";
import { keywordContext } from "../../context/keywordContext";

const commonWords = `i  you  he  she  it  we  they  me  him  her  us  them  i  you  he  she  it  we  they  what  who  me  him  her  it  us  you  them  whom  mine  yours  his  hers  ours  theirs  this  that  these  those  who  whom  which  what  whose  whoever  whatever  whichever  whomever  who  whom  whose  which  that  what  whatever  whoever  whomever  whichever  myself  yourself  himself  herself  itself  ourselves  themselves  myself  yourself  himself  herself  itself  ourselves  themselves  each other  one another  anything  everybody  another  each  few  many  none  some  all  any  anybody  anyone  everyone  everything  no one  nobody  nothing  none  other  others  several  somebody  someone  something  most  enough  little  more  both  either  neither  one  much  such   a minute later accordingly actually after after a short time afterwards also and another as an example as a consequence as a result as soon as at last at lenght because    because of this before besides briefly but consequently conversely equally important finally first for example for instance for this purpose for this reason fourth from here on further furthermore gradually hence however in addition in conclusion in contrast in fact in short in spite of in spite of this in summary in the end in the meanwhile in the meantime in the same manner in the same way just as important least last last of all lastly later meanwhile moreover nevertheless next nonetheless now nor of equal importance on the contrary on the following day on the other hand other hand or presently second similarly since so soon still subsequently such as the next week then thereafter therefore third thus to be specific to begin  with to illustrate to repeat to sum up too ultimately what whatever whoever whereas whomever when while with this in mind yet                     percent   x         tw a   bas a little bit of bread and no cheese a pox on a choo a ha a ten shun aaagh aaargh aagh aah aah  bisto aargh aaroo aaroo aaroo aarrgh aarrghh aaugh about sledge abracadabra absit omen abso fucking lutely absolutely abyssinia aces ach ach y fi achievement unlocked achoo ack action adad adieu adios adsbud adsheart adzooks affirmative afternoon ag agad agh agogare agreed ah ah ah ah ah me ah so ah well ah choo aha ahchoo ahem ahh ahlie ahooga ahoogah ahoy ahoy hoy ahuh ahum ai yah aiee aieee aight aikona aiya aiyah aiyee aiyo aiyoh alack alack and alas alackaday alakazam alamak alas alas and alack alg alhamdulillah alie aliensdidit all change all good in the hood all hail all hands on deck all right all righto all righty all serene all the best allah akbar allahu akbar alleluia alley oop alley oop alleyoop allez oop allez oop allez up alligator  allo allo allow it allrighty ally oop aloha alpha and omega alr alreet alright alrighty alrite amen amidships amirite anan anchor s aweigh and then everyone on the bus clapped andele anend any time anytime aol aooga aoogah apologies applesauce april fools april fools ar areet arf arg argh arigato a right aroo arooga aroogah arp arr arrah arr  arrey arrivederci as if as you like as you were as you wish as salamu alaykum asdfghjkl assalamu alaikum assalamu alaykum astaghfirullah at ten shun atchoo atishoo atta boy atta girl attaboy attagal attagirl attakid attention au reservoir au revoir auf wiedersehen augh aunt nell avast avaunt  ave it aw aw man aw shucks aw well away aweel awoo awooga awoogah awreet awright aww aww yeah ay ay ay ay ay me ay oop ay up ay  chihuahua aye aye aye              a a a  a la   la a back a cross a  a  a k a  ab ab  abaat aback of abaft abaht abaout abart abeam aboard aboat aboon aboot about aboutes abouts above abowt abreast abroad absent abt abt  abun abune abv  accd g to according to across across from acrosst acrost ad adjacent adown affor afloat afoor afore afront afta aftah after afther aftre aftuh again againest against agaynest agaynst ageinest ageinst agen agenest agenst ageynest ageynst agin aginst ago agyen ahead of ahind ahint ahn ajax aka ala alang alangst all along all for all over all up with along along about along of along the lines of along with alongest alongside alongsides alongst aloof alow amid amiddest amiddst amidest amidst among amonge amongest amongst amoung amoungest amoungst amyddest amyddst amydst an anear anearst anenst anent anigh anighst anti aout ap  apart apart from apres apr s apr s apropos apropos of apud around arownd arter as as against as far as as for as of as opposed to as per as regards as respects as soon as as to as well as ascr  aside from aslant aslope asprawl astern of astraddle astraddle of astride at at the cost of at the feet of at the hand of at the hands of at the point of at the risk of at the sight of athwart atilt atop att atween atwix awaye ayein ayen ayond ayont b b w b  b  back in baft bang on bar barring bating be be  because because of befo befo  befoir befor before befure behind behinde behine behither belong below ben
`;

const commonWordsArray = commonWords
  .toLocaleLowerCase()
  .replace(/[^a-zA-Z]/g, " ")
  .split(" ");

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
  width: 50%;
`;

const BackBtn = styled.button`
  width: 50px;
`;

const Words = styled.div`
  display: flex;
`;

export const ArticleWords = () => {
  const { userId } = useContext(authContext);
  const [content, setContent] = useState<string>("");
  const { setKeyword } = useContext(keywordContext);
  const navigate = useNavigate();
  const [articleWords, setArticleWords] = useState<string[]>();

  useEffect(() => {
    const getArticleContent = async () => {
      let contents: string = "";
      const articleRef = collection(db, "users", userId, "articles");
      const q = query(articleRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        contents = contents + doc.data().content;
        setContent(contents);
      });
    };
    getArticleContent();
  }, []);

  useEffect(() => {
    const countArticleWords = content
      .toLocaleLowerCase()
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .filter((x: any) => !commonWordsArray.includes(x))
      .reduce(function (obj: any, item: any) {
        if (!obj[item]) {
          obj[item] = 0;
        }
        obj[item]++;
        return obj;
      }, {});
    setArticleWords(countArticleWords);
  }, [content]);

  return (
    <Wrapper>
      <BackBtn onClick={() => navigate("/articles")}>Back</BackBtn>
      <p>ArticleWords</p>
      <Words>
        <div>
          {articleWords &&
            Object.keys(articleWords)?.map((word, index) => (
              <p key={index} onClick={() => setKeyword(word)}>
                {word}
              </p>
            ))}
        </div>
        <div>
          {articleWords &&
            Object.values(articleWords).map((count, index) => <p>{count}</p>)}
        </div>
      </Words>
    </Wrapper>
  );
};
