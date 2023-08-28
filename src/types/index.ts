import { NonFungibleTokenOfAccountOnNetwork as mx_NonFungibleTokenOfAccountOnNetwork } from "@multiversx/sdk-network-providers";
import BigNumber from "bignumber.js";

export * from "./sdkDappTypes";

export type NonFungibleToken = mx_NonFungibleTokenOfAccountOnNetwork & {
	media: [
		{
			originalUrl: string;
			thumbnailUrl: string;
			url: string;
			fileType: string;
			fileSize: number;
		},
	];
	ticker: string;
	_checked: boolean;
	_stakingPosition: NftStakingPosition;
};

export type NftStakingPosition = {
	nonce: number;
	staked_epoch: number;
	last_claimed_timestamp: number;
};

export type TokenStakingPosition = {
	staked_amount: BigNumber;
	staked_epoch: number;
	last_claimed_timestamp: number;
};

export type TokenLockedStakingPosition = TokenStakingPosition & {
	id: number;
	unlock_timestamp: number;
};

export const defaultTokenStakingPosition: TokenStakingPosition = {
	staked_amount: new BigNumber(0),
	staked_epoch: 0,
	last_claimed_timestamp: 0,
};

export type InternalToken = {
	name: string;
	symbol: string;
	identifier: string;
	decimals: number;
	decimalsToDisplay: number;
};

export class Query {
	__typename?: "Query";
	cucumberx?: gqlCucumberx;
}

export class gqlCucumberx {
	__typename?: "Cucumberx";
	stakingNft?: gqlStakingNft;
	stakingToken?: gqlStakingToken;
	stakingTokenLocked?: gqlStakingTokenLocked;
	lottery?: gqlLottery;
	tokenPrice?: number;
}

export class gqlStakingNft {
	__typename?: "StakingNft";
	_address?: string;
	rewardsForUser?: string;
	admin?: AddressCustom;
	stakingToken?: string;
	rewardToken?: string;
	rewardsAmount?: string;
	tokensPerDay?: string;
	userStaking?: NftStakingPosition[];
	stakedAddresses?: AddressCustom[];
	nStakedNfts?: number;
}

export class gqlStakingTokenLocked {
	__typename?: "StakingTokenLocked";
	_address?: string;
	rewardsForUser?: string;
	admin?: AddressCustom;
	stakingToken?: string;
	rewardToken?: string;
	rewardsAmount?: string;
	apr?: number;
	lockDays?: number;
	userStaking?: TokenLockedStakingPosition[];
	stakedAddresses?: AddressCustom[];
	lastId?: number;
}

export class gqlStakingToken {
	__typename?: "StakingToken";
	_address?: string;
	rewardsForUser?: string;
	admin?: AddressCustom;
	stakingToken?: string;
	rewardToken?: string;
	rewardsAmount?: string;
	apr?: number;
	userStaking?: TokenStakingPosition;
	stakedAddresses?: AddressCustom[];
}

export class gqlLottery {
	__typename?: "Lottery";
	_address?: string;
	admin?: AddressCustom;
	ticketToken?: string;
	ticketPrice?: BigNumber;
	prizeAmount?: BigNumber;
	prizeToken?: string;
	userTickets?: number[];
	ticketUser?: AddressCustom;
	winner?: AddressCustom;
	winnerTicket?: number;
	participants?: AddressCustom[];
	lastTicketId?: number;
	deadline?: number;
	amountSpentInTickets?: BigNumber;
	percentBurn?: number;
	ticketsTokenWallet?: AddressCustom;
}

export class AddressCustom {
	__typename?: "Address";
	address?: string;
}
