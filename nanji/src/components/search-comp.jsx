import { SearchField } from '@aws-amplify/ui-react';
import { API } from "aws-amplify"
import { searchUsers } from "../graphql/queries"
import { useState } from 'react';
import { BsFillPersonPlusFill } from 'react-icons/bs'
import { createOutgoingFriendRequest } from "../graphql/mutations"
import { listOutgoingFriendRequests } from "../graphql/queries"
import { getUserByUser } from '../graphql/custom';
import '../css/search.css'

export function Search({user, outGoing, setOutGoing}) {

    const [userSearch, setUserSearch] = useState();
    const [searchResult, setSearchResult] = useState(false);
    const [selectedUser, setSelectedUser] = useState();

    const searchHandler = async(event) => {
        const result = await API.graphql({query: searchUsers, authMode: 'AMAZON_COGNITO_USER_POOLS', variables: {filter: {preferred_username: { match: event }}} })
        const results = result.data.searchUsers.items
        if (results.length > 0) {
            setSearchResult(true);
            setUserSearch(results);
        }
        if (results.length <= 0) {
            setUserSearch([])
            setSearchResult(false)
        }
    }

    const friendRequestHandler = async(event) => {
        //get id from target
        const selectedID = (event.target.parentNode.getAttribute('id') === null || undefined) ? event.target.parentNode.parentNode.getAttribute('id') : event.target.parentNode.getAttribute('id');
        //get user data associated with target
        const userData = await API.graphql({query: getUserByUser, authMode: 'AMAZON_COGNITO_USER_POOLS', variables: {id: selectedID } });
        //prevent multiple requests to the same person
        const RequestExists = await API.graphql({ query: listOutgoingFriendRequests, authMode: 'AMAZON_COGNITO_USER_POOLS', filter: { request_to: {eq: selectedID}} });
        if (RequestExists.data.listOutgoingFriendRequests.items.length > 0) return;
        // state new friend request data
        const friendRequest = {userOutgoing_friend_requestsId: user.username, request_to: selectedID};
        //create a new friend request
        const result = await API.graphql({query: createOutgoingFriendRequest, authMode: 'AMAZON_COGNITO_USER_POOLS', variables: {input: friendRequest } });
        const newRequest = userData.data.getUser
        setOutGoing(prev => {
            return [...prev, newRequest]
        });
        alert('friend request sent');
    }

 return (

    <>
    <div class="search">
        <h4>Search for friends and family</h4>
        <SearchField label="Search for friends and family" placeholder="Search here..."
        onSubmit={searchHandler}
        />

    <div>
        {(searchResult) ?
        <div>
            {userSearch.map((userResult) => (
                <div id={userResult.id} key={userResult.id} class="searchresults">
                <ul>
                    <li>Name: {userResult.given_name + ' ' + userResult.family_name}</li>
                    <li>Username: {userResult.preferred_username}</li>
                </ul>
                <BsFillPersonPlusFill onClick={friendRequestHandler}/>
                </div>
            ))}
        </div>
        : <div class="searchresults"><h4>No results</h4></div>}
    </div>
    </div>
    </>
    )
}