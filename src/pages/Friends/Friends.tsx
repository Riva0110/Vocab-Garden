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
import plantRight from "./plant-right.png";
import plantLeft from "./plant-left.png";
import { Navigate } from "react-router-dom";
import Button from "../../components/Button";
import Alert from "../../components/Alert/Alert";

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
  opacity: 0.2;
`;

const Img2 = styled.img`
  position: fixed;
  width: 550px;
  left: 0px;
  bottom: 0px;
  opacity: 0.2;
`;

const FriendsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px auto;
  padding: 10px;
  min-width: 500px;
  height: 100%;
  z-index: 1;
  @media screen and (max-width: 601px) {
    width: 100%;
    padding: 20px;
  }
`;

const Input = styled.input`
  width: 70%;
  height: 25px;
  border: none;
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

type AddFunction = (msg: string) => void;

export default function Friends() {
  const { isLogin, userId } = useContext(authContext);
  const [myEmail, setMyEmail] = useState<string>();
  const [searchingEmail, setSearchingEmail] = useState<string>("");
  const [friendList, setFriendList] = useState<string[]>();
  const [friendRequest, setfriendRequest] = useState<string[]>();
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
        children={(add: AddFunction) => {
          ref.current = add;
        }}
      />
      <Img src={plantRight} alt="plant" />
      <Img2 src={plantLeft} alt="plant" />
      <FriendsWrapper>
        <FriendRequest>
          <Input
            ref={emailInput}
            placeholder="search friends by email..."
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
          <Friend>
            <Email key={friendEmail}>{friendEmail}</Email>
            <FriendStateWrapper stateColor={friendState[index]}>
              {friendState[index]}
              <FriendState stateColor={friendState[index]} />
            </FriendStateWrapper>
          </Friend>
        ))}

        <Title>Friend Request</Title>
        {friendRequest?.map((friendEmail) => (
          <Friend>
            <Email key={friendEmail}>{friendEmail}</Email>
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
          <Friend>
            <Email key={friendEmail}>{friendEmail}</Email>
            <Empty />
          </Friend>
        ))}
      </FriendsWrapper>
    </Wrapper>
  ) : (
    <Navigate replace to="/profile" />
  );
}
