import { DiscountPrice } from './DiscountPrice';
import { GoldPoint } from './GoldPoint';
import { HLTBInfo } from './HLTBInfo';
import { RegularPrice } from './RegularPrice';

export type ListViewItem = {
    id: number;
    title_id: number;
    title: string;
    image: string;
    discount_price: DiscountPrice;
    gold_point: GoldPoint;
    hltbInfo: HLTBInfo;
    regular_price: RegularPrice;
    sales_status: string;
}
