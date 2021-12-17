import * as React from 'react';

import ListView from '../components/ListView';
import { ListTypes } from '../enums/ListTypes';

export default function DiscountsScreen() {

    return <ListView listType={ListTypes.Discounts} emptyText={'There aren\'t any discounts at this time'}></ListView>;
};
