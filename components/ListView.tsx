import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, TouchableHighlight } from 'react-native';
import { FlatList, Text, View } from './Themed';
import { Avatar, FAB, IconButton, Menu, Provider } from 'react-native-paper';
import { SWITCH_WISH_LIST } from '../constants/WishList';

import dayjs from 'dayjs';

// @ts-ignore
import carrie from '../assets/images/carrie.gif';
// @ts-ignore
import georgeCostanza from '../assets/images/george_costanza.gif';
// @ts-ignore
import travolta from '../assets/images/travolta.gif';
// @ts-ignore
import travoltaStore from '../assets/images/travolta_store.gif';
import { ListTypes } from '../enums/ListTypes';
import { ListViewItem } from '../types/ListViewItem';
import { HLTBInfo } from '../types/HLTBInfo';

export default function ListView({ listType, emptyText }: { listType: ListTypes, emptyText: string }) {

    const [isLoading, setIsLoading] = useState(true);
    const [listData, setListData] = useState<ListViewItem[]>([]);
    const [sortAscending, setSortAscending] = useState(true);
    const [compactView, setCompactView] = useState(false);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const notFoundImages = [carrie, georgeCostanza, travolta, travoltaStore];

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

    const getDaysOfSaleRemaining = (date: any) => {
        const saleUntil = dayjs(date);
        const today = dayjs();
        return Math.ceil(saleUntil.diff(today, 'day', true));
    };

    const getDaysOfSaleRemainingText = (date: any) => {
        const daysRemaining = getDaysOfSaleRemaining(date);
        return daysRemaining > 1 ? `${daysRemaining} days remaining` : 'Last day of sale!';
    };

    const getHLTBInformation = async (title: string): Promise<HLTBInfo> => {
        const filteredTitle = filterCharacters(title);

        const url = `https://game-information.vercel.app/get-game-info`;
        const gameInfo = await fetch(`${url}?title=${filteredTitle}`);

        if (gameInfo.status === 403) throw new Error('Game info rate limit');
        if (!gameInfo.ok) throw new Error('GET Game info request failed');

        const response = await gameInfo.json();
        return response.find((item: any) => item.searchTerm === filteredTitle);
    };

    const filterCharacters = (title: string): string => {
        const copyrightSign = String.fromCharCode(169);
        const registeredSign = String.fromCharCode(174);
        const trademarkSymbol = String.fromCharCode(8482);
        let filteredTitle = title.replace(copyrightSign, '');
        filteredTitle = filteredTitle.replace(registeredSign, '');
        filteredTitle = filteredTitle.replace(trademarkSymbol, '');
        filteredTitle = filteredTitle.replace('Remastered', '').trim();
        return filteredTitle;
    };

    const toggleCompactView = () => {
        setCompactView(!compactView);
    };

    const sortList = () => {
        const sortedList = [...listData].sort((a: any, b: any) => {
            return sortAscending ? b.title.toLowerCase().localeCompare(a.title.toLowerCase()) :
                a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });
        setSortAscending(!sortAscending);
        setListData(sortedList);
        closeMenu();
    };

    const sortByPrice = () => {
        const sortedList = [...listData].sort((a: any, b: any) => sortAscending ?
            parseFloat(listType === ListTypes.Discounts ? a.discount_price.raw_value : a.regular_price.raw_value) -
            parseFloat(listType === ListTypes.Discounts ? b.discount_price.raw_value : b.regular_price.raw_value) :
            parseFloat(listType === ListTypes.Discounts ? b.discount_price.raw_value : b.regular_price.raw_value) -
            parseFloat(listType === ListTypes.Discounts ? a.discount_price.raw_value : a.regular_price.raw_value));
        setSortAscending(!sortAscending);
        setListData(sortedList);
        closeMenu();
    };

    const sortByDiscountPercentage = () => {
        const sortedList = [...listData].sort((a: any, b: any) => {
            if (a.discount_price && b.discount_price) {
                return sortAscending ? getDiscount(b) - getDiscount(a) : getDiscount(a) - getDiscount(b);
            }
            return (a.discount_price && !b.discount_price) ? -1 : (!a.discount_price && b.discount_price) ? 1 : 0;
        });
        setSortAscending(!sortAscending);
        setListData(sortedList);
        closeMenu();
    };

    const sortByDaysRemaining = () => {
        const sortedList = [...listData].sort((a: any, b: any) => {
            const dayOfSaleRemainingA = getDaysOfSaleRemaining(a.discount_price.end_datetime);
            const dayOfSaleRemainingB = getDaysOfSaleRemaining(b.discount_price.end_datetime);
            return !sortAscending ? dayOfSaleRemainingB - dayOfSaleRemainingA : dayOfSaleRemainingA - dayOfSaleRemainingB;
        });
        setSortAscending(!sortAscending);
        setListData(sortedList);
        closeMenu();
    };

    const openMenu = () => {
        setFilterMenuOpen(true);
    };

    const closeMenu = () => setFilterMenuOpen(false);

    const getNotFoundImage = () => {
        const random = (Math.floor(Math.random() * 4));
        return notFoundImages[random];
    };

    useEffect(() => {
        let mounted = true;

        async function getPricesList() {
            const switchWishListChunks = _getArrayChunks(SWITCH_WISH_LIST.map(item => item.id), 50);
            let pricesList: Array<any> = [];
            for (const chunk of switchWishListChunks) {
                const priceResponse = await _getPrices(chunk);
                pricesList = pricesList.concat(priceResponse);
            }
            let dataList: Array<ListViewItem> = await SWITCH_WISH_LIST.map((item, i) => Object.assign({}, item, pricesList[i]));
            dataList = listType === ListTypes.Discounts ? dataList.filter(game => game.discount_price) : dataList;

            // Add HLTB information to the dataList
            await Promise.all(dataList.map(async (item: ListViewItem) => item.hltbInfo = await getHLTBInformation(item.title)));

            setListData(dataList);
            setIsLoading(false);
        }

        if (mounted) {
            getPricesList();
        }

        return function cleanUp() {
            mounted = false;
        };
    }, []);


    return (
        <Provider>
            <View style={styles.container}>

                <FAB icon={compactView ? 'view-agenda' : 'view-headline'} color="gold" onPress={toggleCompactView} style={styles.viewButton} />
                {/* TODO: Implement syncing: <FAB icon="sync" color="gold" onPress={syncWishList} style={styles.syncButton} />*/}

                <View
                    style={{
                        width: '100%',
                        paddingTop: 20,
                        paddingRight: 20,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        alignContent: 'flex-end',
                        justifyContent: 'flex-end',
                    }}>
                    <Menu
                        visible={filterMenuOpen}
                        onDismiss={closeMenu}
                        anchor={
                            <IconButton icon="sort-variant" color="gold" size={37.5} style={{ backgroundColor: 'rgba(243,197,0,0.34)', }}
                                        onPress={openMenu}> </IconButton>
                        }
                    >
                        <Menu.Item onPress={sortList} title="Sort alphabetical" />
                        <Menu.Item onPress={sortByPrice} title="Sort by discount price" />
                        <Menu.Item onPress={sortByDiscountPercentage} title="Sort by discount %" />
                        {listType === ListTypes.Discounts ? <Menu.Item onPress={sortByDaysRemaining} title="Sort by days remaining" /> : null}
                    </Menu>
                </View>

                <View style={styles.container}>
                    {isLoading ?
                        <ActivityIndicator size="large" color="#fff" /> :
                        <FlatList
                            data={listData}
                            keyExtractor={(item => item.id.toString())}
                            ListEmptyComponent={() => (
                                <View>
                                    <Text style={styles.centerText}>{{ emptyText }}</Text>
                                    <Image
                                        source={getNotFoundImage()}
                                        style={{ width: 360 }}
                                    />
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableHighlight key={item.id.toString()} onPress={() => _onItemClick(item.id)}>
                                    <View style={styles.item}>
                                        {compactView ? null :
                                            <Image
                                                source={{
                                                    uri: item.image,
                                                }}
                                                style={{ width: 272, height: 153 }}
                                            />
                                        }
                                        <View style={compactView ? styles.compactView : styles.normalView}>
                                            <Text style={styles.text}>{item.title}</Text>
                                            {item.hltbInfo && item.hltbInfo.gameplayMain > 0 ? (
                                                <View style={styles.timeToBeatContainer}>
                                                    <Avatar.Icon icon="clock" color="gold" size={32}
                                                                 style={{ backgroundColor: 'rgba(243,197,0,0.34)', }} />
                                                    <View style={styles.timeToBeatWrapper}>
                                                        <View style={styles.timeToBeat}>
                                                            <Avatar.Icon icon="flag-checkered" color="gold" size={24}
                                                                         style={{ backgroundColor: 'rgba(243,197,0,0.34)', }} />
                                                            <Text style={styles.timeToBeatText}>{item.hltbInfo.gameplayMain} hours</Text>
                                                        </View>
                                                        {item.hltbInfo.gameplayCompletionist > 0 ?
                                                            <View style={styles.timeToBeat}>
                                                                <Avatar.Icon icon="trophy" color="gold" size={24}
                                                                             style={{ backgroundColor: 'rgba(243,197,0,0.34)', }} />
                                                                <Text style={styles.timeToBeatText}>{item.hltbInfo.gameplayCompletionist} hours</Text>
                                                            </View>
                                                            : null}
                                                    </View>
                                                </View>
                                            ) : null}
                                            {compactView ? <Text style={styles.separator}>|</Text> : null}
                                            <View style={styles.priceAndDiscount}>
                                                {isDiscounted(item) ?
                                                    <React.Fragment>
                                                        <Text style={[styles.originalPrice,
                                                            styles.originalPriceWithDiscount]}>{getOriginalPrice(item)}</Text>
                                                        <Text style={styles.discountPrice}>{getDisplayPrice(item)}</Text>
                                                        <Text style={styles.discount}>-{getDiscount(item)}%</Text>
                                                    </React.Fragment> :
                                                    <Text style={styles.originalPrice}>{getOriginalPrice(item)}</Text>
                                                }
                                            </View>
                                            {isDiscounted(item) ?
                                                <React.Fragment>
                                                    <Text style={styles.sale_end_text}>
                                                        Sale until: <Text
                                                        style={styles.sale_end_date}>{dayjs(item.discount_price.end_datetime).format('DD-MM-YYYY')}</Text>
                                                    </Text>
                                                    {compactView ? <Text style={styles.sale_end_divider}>|</Text> : null}
                                                    <Text
                                                        style={styles.sale_end_text}>{getDaysOfSaleRemainingText(item.discount_price.end_datetime)}</Text>
                                                </React.Fragment>
                                                : null}

                                        </View>
                                    </View>
                                </TouchableHighlight>
                            )}
                        />}
                </View>
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewButton: {
        backgroundColor: 'rgba(243,197,0,0.34)',
        position: 'absolute',
        left: 5,
        top: 5,
        margin: 20,
        zIndex: 10,
    },
    syncButton: {
        backgroundColor: 'rgba(243,197,0,0.34)',
        position: 'absolute',
        left: 5,
        top: 60,
        margin: 20,
        zIndex: 10,
    },
    sortButton: {
        backgroundColor: 'rgba(243,197,0,0.34)',
        position: 'absolute',
        zIndex: 10,
        right: 5,
        top: 5,
        margin: 20,
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
    centerText: {
        textAlign: 'center',
    },
    text: {
        paddingTop: 8
    },
    separator: {
        paddingTop: 8,
        paddingRight: 8,
        paddingLeft: 8
    },
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
    timeToBeatContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 12,
        paddingTop: 4,
        marginLeft: 4,
    },
    timeToBeatWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeToBeat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
        marginRight: 2,
    },
    timeToBeatText: {
        marginLeft: 4,
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
    },
    originalPriceWithDiscount: {
        textDecorationLine: 'line-through',
    },
    discount: {
        marginTop: 6,
        marginLeft: 8,
        marginRight: 8,
        padding: 4,
        paddingLeft: 6,
        backgroundColor: '#df0b18',
        color: '#fff',
        fontWeight: 'bold',
    },
    sale_end_divider: {
        marginLeft: 5,
        marginRight: 5,
    },
    sale_end_text: {
        fontSize: 12,
        marginTop: 5,
    },
    sale_end_date: {
        fontWeight: 'bold',
    },
});
