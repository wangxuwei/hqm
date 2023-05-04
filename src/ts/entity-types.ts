import { Moment } from "moment";

export interface BaseEntity {
	id: number;
}

export interface Unit extends BaseEntity {
	// persistent
	// required
	// 名称
	name: string;
	// 是否是农历
	isLunar: boolean;
	// 上次的时间 与已标数量对应
	lastBiddedDate: Moment;
	// 每个月哪一天开始
	day: number;
	// 频率 平均几月一次，有可能半月
	cycle: number;
	// 加标月哪一天开始
	plusDay: number;
	// 加标频率 平均几月一次，有可能半月
	plusCycle: number;
	// 本金
	budget: number;
	// 会员数
	count: number;
	// 已标
	biddedCount: number;
	// 会支数
	unitCount: number;

	// optional
	// 预估总额
	amount: number;
	// 备注
	description: string;

	// transient
	unitBudgets: UnitBudget[];
}


export interface UnitBudget extends BaseEntity {
	// 会ID
	unitId: number;
	// 标时间
	budgetDate: Moment;
	// 标金
	budget: number;
	// 是否是自己标的
	isSelf: boolean;
}