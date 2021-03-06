import { Storage } from "aws-amplify";
import React from "react";
import { useEffect } from "react";
import { PostList } from "../components/postList-comp";
import { Menu } from "../components/menu-comp";
import { duplicatesByMonth } from "../utils/duplicates";
import { listUserPosts, listAllUserPosts } from "../utils/listdata";
import { sortData } from "../utils/sort";
import { getFriends } from "../utils/friendRequests";
import { BsChevronDown } from "react-icons/bs";
import { PostType } from "../types/PostType";
import { UserType } from "../types/UserType";
import "../css/dashboard.css";

//temp set to public - this needs to change and implement groups for friends !fix
Storage.configure({ level: "public" });
//Shared Types will have their own file

type Props = {
  user: UserType;
  signOut: any; //TODO: adjust this
  friends: UserType[];
  setFriends: any; //TODO: adjust this
  userCred: string;
};

export const Dashboard = ({
  user,
  signOut,
  friends,
  setFriends,
  userCred,
}: Props) => {
  const [posts, setPosts] = React.useState<PostType[] | null>([]);
  const [allPosts, setAllPosts] = React.useState<PostType[] | null>([]);
  const [noPosts, setNoPosts] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string>("");

  useEffect(() => {
    listUserPosts(user.username)
      .then((data) => {
        setPosts(data.data.postByUser.items);
        const tokenID = data.data.postByUser.nextToken;
        setToken(tokenID);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    listAllUserPosts(user.username)
      .then((data) => {
        const listData = data.data.postByUser.items;
        sortData(listData);
        setAllPosts(duplicatesByMonth(listData));
        if (listData.length === 0) {
          setNoPosts(true);
        } else {
          setNoPosts(false);
        }
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

  //TODO: refactor to async/await
  const newPage = async () => {
    listUserPosts(user.username, token).then((data) => {
      if (token === null || undefined) return;
      setPosts((prev) => {
        return [...prev, ...data.data.postByUser.items];
      });
      const tokenID = data.data.postByUser.nextToken;
      console.log(tokenID, "tokeeeeeeen IDDDDDD");
      setToken(tokenID);
    });
  };

  if (noPosts === true) {
    return (
      <div className="container">
        {
          <Menu
            user={user}
            signOut={signOut}
            friends={friends}
            setFriends={setFriends}
            allPosts={allPosts}
            posts={posts}
            setPosts={setPosts}
            token={token}
            setToken={setToken}
            userCred={userCred}
          />
        }

        <div id="nodata">
          <h3>No posts to display ?? ??????????? ????????????`??</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <PostList posts={posts} setPosts={setPosts} setAllPosts={setAllPosts} />
      {
        <Menu
          user={user}
          signOut={signOut}
          friends={friends}
          setFriends={setFriends}
          allPosts={allPosts}
          posts={posts}
          setPosts={setPosts}
          token={token}
          setToken={setToken}
          userCred={userCred}
        />
      }
      <button id="footer" onClick={newPage}>
        <BsChevronDown />
      </button>
    </div>
  );
};
