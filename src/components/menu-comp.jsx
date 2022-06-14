import { FriendsList } from './friendsList-comp';
import { Timeline } from './timeline-comp';
import { GiBackwardTime } from 'react-icons/gi';
import { FaUserFriends } from 'react-icons/fa';
import { useState } from 'react';
import '../css/menu.css'

export function Menu({user, friends, setFriends, allPosts, posts, setPosts, token, setToken}) {

const [menu, setMenu] = useState(true)

    return (
        <div id="menu">
            <GiBackwardTime onClick={() => setMenu(true)} />
            <FaUserFriends onClick={() => setMenu(false)} />
            { (!menu) ?
            <FriendsList user={user} friends={friends} setFriends={setFriends}/>:
            <Timeline allPosts={allPosts} posts={posts} setPosts={setPosts} token={token} setToken={setToken}/>
            }
        </div>
    )
}