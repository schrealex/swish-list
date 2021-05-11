import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, StyleSheet, TouchableHighlight } from 'react-native';
import { FlatList, Text, View } from '../components/Themed';
import { SWITCH_WISH_LIST } from '../constants/WishList';

export default function TabTwoScreen() {

    const [discountedListData, setDiscountedListData]: Array<any> = useState([]);

    const _onItemClick = async (title_id: string) => {
        try {
            Linking.openURL(`https://ec.nintendo.com/NL/nl/titles/${title_id}`);
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

    useEffect(() => {
        async function getPricesList() {
            const switchWishListChunks = _getArrayChunks(SWITCH_WISH_LIST.map(item => item.title_id), 50);
            let pricesList: Array<any> = [];
            for (const chunk of switchWishListChunks) {
                const priceResponse = await _getPrices(chunk);
                pricesList = pricesList.concat(priceResponse);
            }
            const discountedPricesList = await SWITCH_WISH_LIST.map((item, i) => Object.assign({}, item, pricesList[i])).filter(game => game.discount_price);
            setDiscountedListData(discountedPricesList);
        }

        getPricesList();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                {discountedListData ? <FlatList
                    data={discountedListData}
                    keyExtractor={(item => item.title_id.toString())}
                    ListEmptyComponent={() => (!discountedListData.length ?
                        <Text style={styles.text}>The aren't any discounts at this time</Text>
                        : null)
                    }
                    renderItem={({ item }) => (
                        <TouchableHighlight key={item.title_id.toString()} onPress={() => _onItemClick(item.title_id)}>
                            <View style={styles.item}>
                                <Image
                                    source={{
                                        uri: item.image,
                                    }}
                                    style={{ width: 272, height: 153 }}
                                />
                                <Text style={styles.text}>{item.title}</Text>
                                <Text style={[isDiscounted(item) ? styles.discountText : styles.text]}>Price: {getDisplayPrice(item)}</Text>
                            </View>
                        </TouchableHighlight>
                    )}
                /> : null}
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
    discountText: { color: 'red' },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
