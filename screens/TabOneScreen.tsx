import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, TouchableHighlight, TouchableOpacity } from 'react-native';
import { FlatList, Text, View } from '../components/Themed';
import { SWITCH_WISH_LIST } from '../constants/WishList';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabOneScreen() {

    const [isLoading, setIsLoading] = useState(true);
    const [listData, setListData]: Array<any> = useState([]);
    const [compactView, setCompactView] = useState(false);

    const _onItemClick = async (id: string) => {
        try {
            const url = `https://ec.nintendo.com/NL/nl/titles/${id}`;
            // const isAvailable = await InAppBrowser.isAvailable();
            // if (isAvailable) {
            //     InAppBrowser.open(url, {
            //         // iOS Properties
            //         dismissButtonStyle: 'cancel',
            //         preferredBarTintColor: 'gray',
            //         preferredControlTintColor: 'white',
            //         // Android Properties
            //         showTitle: true,
            //         toolbarColor: '#6200EE',
            //         secondaryToolbarColor: 'black',
            //         enableUrlBarHiding: true,
            //         enableDefaultShare: true,
            //         forceCloseOnRedirection: true,
            //     }).then((result: any) => {
            //         Alert.alert(JSON.stringify(result));
            //     });
            // } else {
            Linking.openURL(url);
            // }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const _getArrayChunks = (list: Array<any>, chunkSize: number) => {
        return [...Array(Math.ceil(list.length / chunkSize))].map((_, i) => list.slice(i * chunkSize, i * chunkSize + chunkSize));
    };

    const _getPrices = async (ids: Array<number>) => {
        const url = `https://switch-price-api.vercel.app/get-game-price`;
        const priceData = await fetch(`${url}?ids=${ids.join(',')}`);

        if (priceData.status === 403) throw new Error('PRICE_Rate_Limit');
        if (!priceData.ok) throw new Error('PRICE_get_request_failed');

        const response = await priceData.json();
        return response.prices;
    };

    const isDiscounted = (item: any) => {
        return item.discount_price;
    };

    const getDisplayPrice = (item: any) => {
        if (isDiscounted(item)) {
            return item.discount_price.amount;
        }
        return item.regular_price.raw_value > 0 ? item.regular_price.amount : 'Free';
    };

    const getOriginalPrice = (item: any) => {
        return item.regular_price.amount;
    };

    const getDiscount = (item: any) => {
        return Math.round(100 * (item.regular_price.raw_value - item.discount_price.raw_value) / item.regular_price.raw_value);
    };

    const toggleCompactView = () => {
        setCompactView(!compactView);
    };

    useEffect(() => {
        async function getPricesList() {
            const switchWishListChunks = _getArrayChunks(SWITCH_WISH_LIST.map(item => item.id), 50);
            let pricesList: Array<any> = [];
            for (const chunk of switchWishListChunks) {
                const priceResponse = await _getPrices(chunk);
                pricesList = pricesList.concat(priceResponse);
            }
            const fullPricesList = await SWITCH_WISH_LIST.map((item, i) => Object.assign({}, item, pricesList[i]));
            setListData(fullPricesList);
            setIsLoading(false);
        }

        getPricesList();
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleCompactView} style={styles.buttonContainer}>
                <MaterialIcons name={compactView ? 'view-agenda' : 'view-headline'} size={64} color="gold" />
            </TouchableOpacity>
            <View style={styles.container}>
                {isLoading ?
                    <ActivityIndicator size="large" color="#fff" /> :
                    <FlatList
                        data={listData}
                        keyExtractor={(item => item.id.toString())}
                        ListEmptyComponent={() => (<Text style={styles.text}>You have no games on your wishlist</Text>)}
                        renderItem={({ item }) => (
                            <TouchableHighlight key={item.id.toString()} onPress={() => _onItemClick(item.id)}>
                                <View style={styles.item}>
                                    {compactView ? null :
                                        <Image
                                            source={{
                                                uri: item.image,
                                            }}
                                            style={{ width: 272, height: 153 }}
                                        />}
                                    <View style={compactView ? styles.compactView : styles.normalView}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        {compactView ? <Text style={styles.separator}>|</Text> : null}
                                        <View style={styles.priceAndDiscount}>
                                            {isDiscounted(item) ?
                                                <React.Fragment>
                                                    <Text style={styles.originalPrice}>{getOriginalPrice(item)}</Text>
                                                    <Text style={styles.discountPrice}>{getDisplayPrice(item)}</Text>
                                                    <Text style={styles.discount}>-{getDiscount(item)}%</Text>
                                                </React.Fragment> :
                                                <Text style={styles.displayPrice}>{getOriginalPrice(item)}</Text>
                                            }
                                        </View>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        )}
                    />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        left: 5,
        top: 5,
        elevation: 8,
        zIndex: 1,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        backgroundColor: '#460096',
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    title: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    item: {
        padding: 10,
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        paddingTop: 8
    },
    separator: { paddingTop: 8, paddingRight: 8, paddingLeft: 8 },
    compactView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    normalView: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceAndDiscount: {
        flexDirection: 'row',
    },
    discountPrice: {
        marginTop: 8,
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
    originalPrice: {
        marginTop: 12,
        marginRight: 8,
        fontSize: 12,
        color: '#ccc',
        textDecorationLine: 'line-through',
    },
    displayPrice: {},
    discount: {
        marginTop: 6,
        marginLeft: 8,
        padding: 4,
        paddingLeft: 6,
        backgroundColor: '#df0b18',
        color: '#fff',
        fontWeight: 'bold',
    },
});
