import "../css/friends.css";
import { API } from "aws-amplify";
import { Alert } from "@aws-amplify/ui-react";
import {
  getOutgoingRequests,
  getIncomingRequests,
  getFriends,
} from "../utils/friendRequests";
import { getUserOutgoing, getUserIncoming } from "../graphql/custom";
import {
  createFriend,
  deleteIncomingFriendRequest,
  deleteOutgoingFriendRequest,
} from "../graphql/mutations";
import { useEffect, useState } from "react";
import { BiUserPlus, BiUserMinus } from "react-icons/bi";
import { TiCancelOutline } from "react-icons/ti";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import React from "react";

type UserType = {
  username: string;
  id: string;
  family_name: string;
  given_name: string;
  preferred_username: string;
};
type Props = {
  user: UserType;
  outGoing: UserType[];
  setOutGoing: React.Dispatch<React.SetStateAction<UserType[]>>;
  incoming: UserType[];
  setIncoming: React.Dispatch<React.SetStateAction<UserType[]>>;
  setFriends: React.Dispatch<React.SetStateAction<any[]>>;
};

export function RequestList({
  user,
  outGoing,
  setOutGoing,
  incoming,
  setIncoming,
  setFriends,
}: Props) {
  const [acceptedStatus, setAcceptedStatus] = useState<boolean>(false);
  const [deniedStatus, setDeniedStatus] = useState<boolean>(false);
  const [cancelledStatus, setCancelledStatus] = useState<boolean>(false);

  useEffect(() => {
    getOutgoingRequests(user.username)
      .then((data) => {
        setOutGoing(data);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    getIncomingRequests(user.username)
      .then((data) => {
        setIncoming(data);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    getFriends(user.username)
      .then((data) => {
        setFriends(data);
      })
      .catch((error) => console.log(error));
  }, []);

  function dismissAlerts() {
    setAcceptedStatus(false);
    setDeniedStatus(false);
    setCancelledStatus(false);
  }

  const handleIncomingRequest = async (currentUser, oppositeUser) => {
    try {
      //get incoming requests
      const incomingRequests: GraphQLResult<any> = await API.graphql({
        query: getUserIncoming,
        authMode: "AMAZON_COGNITO_USER_POOLS",
        variables: { id: currentUser },
      });
      const reqIncoming =
        incomingRequests.data.getUser.incoming_friend_requests.items;
      const selectedIncoming = reqIncoming.filter(
        (el) => el.request_from === oppositeUser
      );
      //delete incoming request that matches
      const deleteIncomingRequest = await API.graphql({
        query: deleteIncomingFriendRequest,
        authMode: "AMAZON_COGNITO_USER_POOLS",
        variables: { input: { id: selectedIncoming[0].id } },
      });
      //update incoming state
      getIncomingRequests(user.username).then((data) => {
        setIncoming(data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleOutgoingRequest = async (currentUser, oppositeUser) => {
    try {
      //get outgoing request for other user
      const outgoingRequests: GraphQLResult<any> = await API.graphql({
        query: getUserOutgoing,
        authMode: "AMAZON_COGNITO_USER_POOLS",
        variables: { id: oppositeUser },
      });
      const reqOutgoing =
        outgoingRequests.data.getUser.outgoing_friend_requests.items;
      const selectedOutgoing = reqOutgoing.filter(
        (el) => el.request_to === currentUser
      );
      // //delete outgoing request that matches
      const deleteOutgoingRequest = await API.graphql({
        query: deleteOutgoingFriendRequest,
        authMode: "AMAZON_COGNITO_USER_POOLS",
        variables: { input: { id: selectedOutgoing[0].id } },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const acceptRequestHandler = async (selectedID) => {
    //accept request
    const acceptedRequest = {
      userFriendsId: user.username,
      friend_with: selectedID,
      owner: user.username,
    };
    const createAcceptedRequest = await API.graphql({
      query: createFriend,
      authMode: "AMAZON_COGNITO_USER_POOLS",
      variables: { input: acceptedRequest },
    });
    const friendAcceptedRequest = {
      userFriendsId: selectedID,
      friend_with: user.username,
      owner: selectedID,
    };
    const createFriendAcceptedRequest = await API.graphql({
      query: createFriend,
      authMode: "AMAZON_COGNITO_USER_POOLS",
      variables: { input: friendAcceptedRequest },
    });
    //handle requests
    handleIncomingRequest(user.username, selectedID);
    handleOutgoingRequest(user.username, selectedID);
    //update friends list
    getFriends(user.username).then((data) => {
      setFriends(data);
    });
    setAcceptedStatus(true);
  };

  const denyRequestHandler = async (selectedID) => {
    await handleIncomingRequest(user.username, selectedID);
    await handleOutgoingRequest(user.username, selectedID);
    getIncomingRequests(user.username)
      .then((data) => {
        setIncoming(data);
        setDeniedStatus(true);
      })
      .catch((error) => console.log(error));
  };

  const cancelRequestHandler = async (selectedID) => {
    await handleIncomingRequest(selectedID, user.username);
    await handleOutgoingRequest(selectedID, user.username);
    getOutgoingRequests(user.username)
      .then((data) => {
        setOutGoing(data);
        setCancelledStatus(true);
      })
      .catch((error) => console.log(error));
  };

  //requests should be their own component !fix
  return (
    <>
      <div id="requestlist" onClick={dismissAlerts}>
        <h4>Friend Requests</h4>
        <div className="outgoing">
          <h5>Pending Sent Requests</h5>
          {outGoing &&
            outGoing.map((req) => {
              return (
                <div className="individualrequest" key={req.id} id={req.id}>
                  <div className="textinfo">
                    <p>Name: {req.given_name + " " + req.family_name}</p>
                    <p>Username: {req.preferred_username}</p>
                  </div>
                  <div className="iconinfo">
                    <TiCancelOutline
                      className="denyrequest"
                      onClick={() => cancelRequestHandler(req.id)}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="incoming">
          <h5>Pending Received Requests</h5>
          {incoming &&
            incoming.map((req) => (
              <div className="individualrequest" key={req.id} id={req.id}>
                <div className="textinfo">
                  <p>Name: {req.given_name + " " + req.family_name}</p>
                  <p>Username: {req.preferred_username}</p>
                </div>
                <div className="iconinfo">
                  <BiUserPlus
                    className="acceptrequest"
                    onClick={() => acceptRequestHandler(req.id)}
                  />
                  <BiUserMinus
                    className="denyrequest"
                    onClick={() => denyRequestHandler(req.id)}
                  />
                </div>
              </div>
            ))}
        </div>
        {acceptedStatus ? (
          <Alert variation="success" isDismissible={true}>
            Friend Request Accepted ?? ???????????
          </Alert>
        ) : (
          ""
        )}
        {deniedStatus ? (
          <Alert variation="success" isDismissible={true}>
            Friend Request Denied ?????`??????????
          </Alert>
        ) : (
          ""
        )}
        {cancelledStatus ? (
          <Alert variation="success" isDismissible={true}>
            Freind Request Cancelled ??????????????????? ??? ?????????
          </Alert>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
