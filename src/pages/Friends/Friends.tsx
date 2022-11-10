import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  width: 20%;
`;

const Title = styled.div`
  margin-top: 20px;
  border-bottom: 1px solid gray;
`;

const FriendRequest = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function Friends() {
  const [searchingEmail, setSearchingEmail] = useState<string>("");

  const handleSendRequest = async () => {
    const friendRef = collection(db, "users");
    const q = query(friendRef, where("email", "==", searchingEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) alert("The user doesn't exist!");
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
    });
  };

  return (
    <Wrapper>
      <FriendsWrapper>
        <FriendRequest>
          <Input
            placeholder="search by email..."
            onChange={(e) => setSearchingEmail(e.target.value)}
          />
          <FriendBtn onClick={handleSendRequest}>Send Request</FriendBtn>
        </FriendRequest>
        <Title>Friend List</Title>
        <Title>Friend Request</Title>
        <FriendRequest>
          <p>xxxx@xxxx.xx</p>
          <FriendBtn>Add Friend</FriendBtn>
        </FriendRequest>
        <Title>Awaiting Reply</Title>
      </FriendsWrapper>
    </Wrapper>
  );
}
