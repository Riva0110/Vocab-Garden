import { authContext } from "../../context/authContext";
import { useContext, useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import styled from "styled-components";
import { db } from "../../firebase/firebase";
import plant from "./plant.png";
import plant2 from "./plant2.png";
import plant3 from "./plant3.png";

const Wrapper = styled.div`
  display: flex;
  padding-top: 60px;
`;

const Img = styled.img`
  position: absolute;
  width: 50vw;
  min-width: 400px;
  max-width: 500px;
  right: 0px;
  bottom: 0px;
`;

const Img2 = styled.img`
  position: absolute;
  width: 400px;
  left: 40px;
  top: 0px;
`;

// const Img3 = styled.img`
//   position: absolute;
//   height: 100vh;
//   min-width: 400px;
//   max-width: 500px;
//   right: 0px;
//   bottom: 0px;
// `;

const FriendsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto;
  padding: 10px;
  width: 500px;
  height: 80vh;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.7);
  @media screen and (max-width: 600px) {
    width: 100%;
    margin: 50px 10px;
  }
`;

const Input = styled.input`
  width: 80%;
`;

const FriendBtn = styled.button`
  width: 200px;
  height: 20px;
`;

const Title = styled.div`
  margin-top: 50px;
  border-bottom: 1px solid gray;
`;

const FriendRequest = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Email = styled.div``;

const Friend = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

export default function Friends() {
  const { isLogin, userId } = useContext(authContext);
  const [myEmail, setMyEmail] = useState<string>();
  const [searchingEmail, setSearchingEmail] = useState<string>("");
  const [friendList, setFriendList] = useState<string[]>();
  const [friendRequest, setfriendRequest] = useState<string[]>();
  const [friendState, setFriendState] = useState<string[]>([]);
  const [awaitingFriendReply, setAwaitingFriendReply] = useState<string[]>();
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsub;
    if (isLogin) {
      unsub = onSnapshot(doc(db, "users", userId), (doc) => {
        setMyEmail(doc.data()?.email);
        setFriendList(doc.data()?.friendList);
        setfriendRequest(doc.data()?.friendRequest);
        setAwaitingFriendReply(doc.data()?.awaitingFriendReply);
      });
    }
    return unsub;
  }, [isLogin, userId]);

  useEffect(() => {
    let unsub;
    if (isLogin && friendList?.length) {
      unsub = onSnapshot(
        query(collection(db, "users"), where("email", "in", friendList)),
        (doc) => {
          let newFriendState: any = [];
          friendList?.forEach((friendEmail) => {
            async function checkState() {
              const friendRef = collection(db, "users");
              const q = query(friendRef, where("email", "==", friendEmail));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((friendDoc) => {
                newFriendState = [...newFriendState, friendDoc.data().state];
                console.log("newFriendState", newFriendState);
              });
              setFriendState(newFriendState);
            }
            checkState();
          });
        }
      );
    }
    return unsub;
  }, [friendList, isLogin, userId]);

  useEffect(() => {
    let newFriendState: any = [];
    friendList?.forEach((friendEmail) => {
      async function checkState() {
        const friendRef = collection(db, "users");
        const q = query(friendRef, where("email", "==", friendEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((friendDoc) => {
          newFriendState = [...newFriendState, friendDoc.data().state];
          console.log("newFriendState", newFriendState);
        });
        setFriendState(newFriendState);
      }
      checkState();
    });
  }, [friendList]);

  const handleSendRequest = async () => {
    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", searchingEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return alert("The user doesn't exist!");
    if (awaitingFriendReply?.includes(searchingEmail))
      return alert("You have already sent request to the user!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          friendRequest: arrayUnion(myEmail),
        });
        alert(
          `You have sent friend request to ${searchingEmail} successfully!`
        );
        await updateDoc(doc(db, "users", userId), {
          awaitingFriendReply: arrayUnion(searchingEmail),
        });
      };
      updateFriendStatus();
    });
  };

  const handleAccept = async (friendEmail: string) => {
    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", friendEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) alert("The user doesn't exist!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          friendList: arrayUnion(myEmail),
          awaitingFriendReply: arrayRemove(myEmail),
        });
        await updateDoc(doc(db, "users", userId), {
          friendRequest: arrayRemove(friendEmail),
          friendList: arrayUnion(friendEmail),
        });
      };
      updateFriendStatus();
    });
  };

  const handleReject = async (friendEmail: string) => {
    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", friendEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) alert("The user doesn't exist!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          awaitingFriendReply: arrayRemove(myEmail),
        });
        await updateDoc(doc(db, "users", userId), {
          friendRequest: arrayRemove(friendEmail),
        });
      };
      updateFriendStatus();
    });
  };

  return (
    <Wrapper>
      <Img src={plant} alt="plant" />
      <Img2 src={plant2} alt="plant" />
      <FriendsWrapper>
        <FriendRequest>
          <Input
            ref={emailInput}
            placeholder="search by email..."
            onChange={(e) => setSearchingEmail(e.target.value)}
          />
          <FriendBtn
            onClick={() => {
              if (
                emailInput.current !== undefined &&
                emailInput.current !== null
              ) {
                emailInput.current.value = "";
              }
              handleSendRequest();
            }}
          >
            Send Request
          </FriendBtn>
        </FriendRequest>
        <Title>Friend List</Title>
        {friendList?.map((friendEmail: string, index: number) => (
          <Friend>
            <Email key={friendEmail}>{friendEmail}</Email>
            <div>{friendState[index]}</div>
          </Friend>
        ))}

        <Title>Friend Request</Title>
        {friendRequest?.map((friendEmail) => (
          <FriendRequest>
            <Email key={friendEmail}>{friendEmail}</Email>
            <div>
              <FriendBtn onClick={() => handleAccept(friendEmail)}>
                Accept
              </FriendBtn>
              <FriendBtn onClick={() => handleReject(friendEmail)}>
                Reject
              </FriendBtn>
            </div>
          </FriendRequest>
        ))}
        <Title>Awaiting Reply</Title>
        {awaitingFriendReply?.map((friendEmail) => (
          <Email key={friendEmail}>{friendEmail}</Email>
        ))}
      </FriendsWrapper>
    </Wrapper>
  );
}
