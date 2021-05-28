import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, TouchableHighlight } from 'react-native';
import { FlatList, Text, View } from '../components/Themed';
import { SWITCH_WISH_LIST } from '../constants/WishList';

export default function TabTwoScreen() {

    const [isLoading, setIsLoading] = useState(true);
    const [discountedListData, setDiscountedListData]: Array<any> = useState([]);

    const _onItemClick = async (id: string) => {
        try {
            Linking.openURL(`https://ec.nintendo.com/NL/nl/titles/${id}`);
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

    useEffect(() => {
        async function getPricesList() {
            const switchWishListChunks = _getArrayChunks(SWITCH_WISH_LIST.map(item => item.id), 50);
            let pricesList: Array<any> = [];
            for (const chunk of switchWishListChunks) {
                const priceResponse = await _getPrices(chunk);
                pricesList = pricesList.concat(priceResponse);
            }
            const discountedPricesList = await SWITCH_WISH_LIST.map((item, i) => Object.assign({}, item, pricesList[i])).filter(game => game.discount_price);
            setDiscountedListData(discountedPricesList);
            setIsLoading(false);
        }

        getPricesList();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                {isLoading ?
                    <ActivityIndicator size="large" color="#fff" /> :
                    <FlatList
                        data={discountedListData}
                        keyExtractor={(item => item.id.toString())}
                        ListEmptyComponent={() => (<Text style={styles.text}>There aren't any discounts at this time</Text>)}
                        renderItem={({ item }) => (
                            <TouchableHighlight key={item.id.toString()} onPress={() => _onItemClick(item.id)}>
                                <View style={styles.item}>
                                    <Image
                                        source={{
                                            uri: item.image,
                                        }}
                                        style={{ width: 272, height: 153 }}
                                    />
                                    <Text style={styles.text}>{item.title}</Text>
                                    <Text style={[isDiscounted(item) ? styles.discountText : styles.text]}>
                                        {getDisplayPrice(item)} {isDiscounted(item) ?
                                        <React.Fragment>
                                            <Text style={styles.originalPrice}>{getOriginalPrice(item)}</Text>
                                            <Text style={styles.discount}>-{getDiscount(item)}%</Text>
                                        </React.Fragment>
                                        : null}
                                    </Text>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    item: {
        padding: 10,
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: { paddingTop: 8 },
    discountText: {
        color: 'red',
        marginTop: 8,
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    discount: {
        marginLeft: 8,
        padding: 4,
        backgroundColor: '#ccc',
        color: '#000',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
