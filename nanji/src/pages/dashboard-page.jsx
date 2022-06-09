
import { Storage, API } from "aws-amplify"
import { postByDate, listPosts } from "../graphql/queries"
import { useState, useEffect } from "react"
import { PostList } from '../components/postList-comp'
import { Timeline } from "../components/timeline-comp"
import { duplicates, duplicatesByMonth } from "../utils/duplicates"
import { sortData } from "../utils/sort"
import { BsChevronDown } from 'react-icons/bs';

Storage.configure({ level: 'private' });

let tokenID;
let limitNum = 5;

export function Dashboard() {

    //sorted posts with limit
    const [posts, setPosts] = useState([])
    //all posts
    const [allPosts, setAllPosts] = useState([])

    const [noPosts, setNoPosts] = useState(false)

    useEffect(() => {
        tokenID = null;
        listSortedPosts().then((data) => {
            setPosts(data.data.postByDate.items);
            tokenID = data.data.postByDate.nextToken;
            console.log(data)
            return tokenID;
        })
    }, [])

    useEffect(() => {
        listAllPosts().then((data) => {
            const listData = data.data.listPosts.items
            setAllPosts(sortData(listData));
            if (listData.length === 0) {
                setNoPosts(true);
            } else {
                setNoPosts(false);
            }
        })
    }, [])

    async function listSortedPosts () {
        const postData = await API.graphql({ query: postByDate, authMode: 'AMAZON_COGNITO_USER_POOLS', variables: { type: "Post", sortDirection: "DESC", limit: limitNum, nextToken: tokenID } })
        const posts = await Promise.all(postData.data.postByDate.items.map(async post => {
            const image = await Storage.get(post.image)
            post.s3Image = image
            return post
        } ));
        //removes duplicate dates
        duplicates(postData.data.postByDate.items)
        return postData
    };

    async function listAllPosts () {
        const allPostData = await API.graphql({ query: listPosts, authMode: 'AMAZON_COGNITO_USER_POOLS' })
        duplicatesByMonth(allPostData.data.listPosts.items)
        return allPostData
    }

    async function newPage () {
        listSortedPosts()
        .then((data) => {
            if (tokenID === null) return;
            setPosts(prev => {
                return [...prev, ...data.data.postByDate.items]
            })
            tokenID = data.data.postByDate.nextToken;
            return tokenID;
        })
    }
if (noPosts === true) {
    return (
        <div id="nodata">
            <h3>No posts to display ʕ ´•̥̥̥ ᴥ•̥̥̥`ʔ</h3>
        </div>
    )
} else {
    return (
        <>
        <div class="container">
            <PostList posts={posts} setPosts={setPosts} />
            <Timeline allPosts={allPosts}/>
            <button id="footer" onClick={newPage}><BsChevronDown /></button>
        </div>
        </>
    )
}
}