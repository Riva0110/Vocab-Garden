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
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import styled from "styled-components";
import { db } from "../../firebase/firebase";

const Wrapper = styled.div`
  display: flex;
  padding-top: 60px;
`;

const FriendsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto;
  width: 30vw;
`;

const Input = styled.input`
  width: 80%;
`;

const FriendBtn = styled.button`
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

const Email = styled.div`
  margin-top: 20px;
`;

export default function Friends() {
  const { userId } = useContext(authContext);
  const [myEmail, setMyEmail] = useState<string>();
  const [searchingEmail, setSearchingEmail] = useState<string>("");
  const [friendList, setFriendList] = useState<string[]>();
  const [friendRequest, setfriendRequest] = useState<string[]>();
  const [awaitingFriendReply, setAwaitingFriendReply] = useState<string[]>();
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getMyUserInfo = async () => {
      const userSnap = await getDoc(doc(db, "users", userId));
      setMyEmail(userSnap?.data()?.email);
      setFriendList(userSnap?.data()?.friendList);
      setfriendRequest(userSnap?.data()?.friendRequest);
    };
    getMyUserInfo();
  }, [userId]);

  useEffect(() => {
    console.log(userId);
    const unsub = onSnapshot(doc(db, "users", userId), (doc) => {
      console.log("Current data: ", doc.data());
      setFriendList(doc.data()?.friendList);
      setfriendRequest(doc.data()?.friendRequest);
      setAwaitingFriendReply(doc.data()?.awaitingFriendReply);
    });

    return unsub;
  }, [userId]);

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
        {friendList?.map((friendEmail) => (
          <Email key={friendEmail}>{friendEmail}</Email>
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
