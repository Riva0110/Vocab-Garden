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
import { Navigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import plantLeft from "./plant-left.webp";
import plantRight from "./plant-right.webp";

const Wrapper = styled.div`
  display: flex;
  padding-top: 60px;
  color: gray;
`;

const Img = styled.img`
  position: fixed;
  width: 400px;
  right: 0px;
  bottom: 0px;
  opacity: 0.4;
  @media screen and (max-width: 801px) {
    opacity: 0.2;
  }
`;

const Img2 = styled.img`
  position: fixed;
  width: 550px;
  left: 0px;
  bottom: 0px;
  opacity: 0.4;
  @media screen and (max-width: 801px) {
    opacity: 0.2;
  }
`;

const FriendsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto;
  padding: 20px;
  min-width: 500px;
  height: 100%;
  z-index: 1;
  @media screen and (max-width: 601px) {
    width: 100%;
    min-width: 0px;
  }
`;

const Input = styled.input`
  width: 70%;
  height: 25px;
  border: none;
  font-size: 16px;
  &:focus {
    outline: none;
  }
`;

const Title = styled.div`
  margin-top: 50px;
  border-bottom: 1px solid gray;
  color: #607973;
  font-weight: 600;
`;

const FriendStateWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  color: ${(props: Props) => (props.stateColor === "online" ? "green" : "")};
`;

const FriendState = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  border: 1px solid
    ${(props: Props) => (props.stateColor === "online" ? "green" : "gray")};
  background-color: ${(props: Props) =>
    props.stateColor === "online" ? "green" : "white"};
`;

const FriendRequest = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid gray;
  border-radius: 10px;
  padding: 20px;
  background-color: white;
`;

const ReplyBtns = styled.div`
  display: flex;
`;

const Email = styled.div``;

const Friend = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const Empty = styled.div`
  width: 20px;
`;

interface Props {
  stateColor: string;
}

// eslint-disable-next-line no-unused-vars
type AddFunction = (msg: string) => void;

export default function Friends() {
  const { isLogin, userId } = useContext(AuthContext);
  const [myEmail, setMyEmail] = useState<string>();
  const [searchingEmail, setSearchingEmail] = useState<string>("");
  const [friendList, setFriendList] = useState<string[]>();
  const [friendRequest, setFriendRequest] = useState<string[]>();
  const [friendState, setFriendState] = useState<string[]>([]);
  const [awaitingFriendReply, setAwaitingFriendReply] = useState<string[]>();
  const emailInput = useRef<HTMLInputElement>(null);
  const ref = useRef<null | AddFunction>(null);

  useEffect(() => {
    let unsub;
    if (isLogin) {
      unsub = onSnapshot(doc(db, "users", userId), (doc) => {
        setMyEmail(doc.data()?.email);
        setFriendList(doc.data()?.friendList);
        setFriendRequest(doc.data()?.friendRequest);
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
        () => {
          let newFriendState: string[] = [];
          friendList?.forEach((friendEmail) => {
            async function checkState() {
              const friendRef = collection(db, "users");
              const q = query(friendRef, where("email", "==", friendEmail));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((friendDoc) => {
                newFriendState = [...newFriendState, friendDoc.data().state];
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
    let newFriendState: string[] = [];
    friendList?.forEach((friendEmail) => {
      async function checkState() {
        const friendRef = collection(db, "users");
        const q = query(friendRef, where("email", "==", friendEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((friendDoc) => {
          newFriendState = [...newFriendState, friendDoc.data().state];
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
    if (querySnapshot.empty) return ref.current?.("The user doesn't exist!");
    if (awaitingFriendReply?.includes(searchingEmail))
      return ref.current?.("Already sent!");
    if (friendList?.includes(searchingEmail))
      return ref.current?.("Already in friend list!");
    if (friendRequest?.includes(searchingEmail))
      return ref.current?.("The user is waiting for your reply!");
    querySnapshot.forEach((friendDoc) => {
      const updateFriendStatus = async () => {
        await updateDoc(doc(db, "users", friendDoc.id), {
          friendRequest: arrayUnion(myEmail),
        });
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
    if (querySnapshot.empty) ref.current?.("The user doesn't exist!");
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
    if (querySnapshot.empty) ref.current?.("The user doesn't exist!");
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

  return isLogin ? (
    <Wrapper>
      <Alert
        myChildren={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Img src={plantRight} alt="plant" />
      <Img2 src={plantLeft} alt="plant" />
      <FriendsWrapper>
        <FriendRequest>
          <Input
            ref={emailInput}
            placeholder="Search by emails..."
            onChange={(e) => setSearchingEmail(e.target.value)}
          />
          <div
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
            <Button btnType="primary">Send request</Button>
          </div>
        </FriendRequest>
        <Title>Friend List</Title>
        {friendList?.map((friendEmail: string, index: number) => (
          <Friend key={friendEmail}>
            <Email>{friendEmail}</Email>
            <FriendStateWrapper stateColor={friendState[index]}>
              {friendState[index]}
              <FriendState stateColor={friendState[index]} />
            </FriendStateWrapper>
          </Friend>
        ))}

        <Title>Friend Request</Title>
        {friendRequest?.map((friendEmail) => (
          <Friend key={friendEmail}>
            <Email>{friendEmail}</Email>
            <ReplyBtns>
              <div
                onClick={() => {
                  handleAccept(friendEmail);
                }}
              >
                <Button btnType="primary">Accept</Button>
              </div>
              <div
                onClick={() => {
                  handleReject(friendEmail);
                }}
              >
                <Button btnType="secondary">Reject</Button>
              </div>
            </ReplyBtns>
          </Friend>
        ))}
        <Title>Awaiting Reply</Title>
        {awaitingFriendReply?.map((friendEmail) => (
          <Friend key={friendEmail}>
            <Email>{friendEmail}</Email>
            <Empty />
          </Friend>
        ))}
      </FriendsWrapper>
    </Wrapper>
  ) : (
    <Navigate replace to="/profile" />
  );
}
