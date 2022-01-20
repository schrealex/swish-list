import * as React from 'react';
import { ListTypes } from '../enums/ListTypes';
import ListView from '../components/ListView';

export default function WishListScreen() {

    // TODO: Add sync function
    // Steps to sync:
    // 1. Open sign in page with URL
    // 2. Sign in and use token to call API
    // 3. Call API and get Wishlist games
    //
    // const syncWishList = () => {
    //     props.navigation.navigate(
    //         'Browser',
    //         { url: 'https://accounts.nintendo.com/connect/1.0.0/authorize?state=uz4ZfBIvppSh3Pgvb67Idiw9p9VLT8tO9cdss1Sb-1FdjWPs&redirect_uri=npf71b963c1b7b6d119://auth&client_id=71b963c1b7b6d119&scope=openid%20user%20user.birthday%20user.mii%20user.screenName&response_type=session_token_code&session_token_code_challenge=aNgS7j3xMuXaRrrWdQgnaqhbTWs3HqB2QS2PQtmRkqY&session_token_code_challenge_method=S256&theme=login_form' }
    //     );
    //
    //     // Linking.openURL('https://accounts.nintendo.com/connect/1.0.0/authorize?state=uz4ZfBIvppSh3Pgvb67Idiw9p9VLT8tO9cdss1Sb-1FdjWPs&redirect_uri=npf71b963c1b7b6d119://auth&client_id=71b963c1b7b6d119&scope=openid%20user%20user.birthday%20user.mii%20user.screenName&response_type=session_token_code&session_token_code_challenge=aNgS7j3xMuXaRrrWdQgnaqhbTWs3HqB2QS2PQtmRkqY&session_token_code_challenge_method=S256&theme=login_form');
    // };

    return <ListView listType={ListTypes.Full} emptyText="You have no games on your wishlist"></ListView>;
};
