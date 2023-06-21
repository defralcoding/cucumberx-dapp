import { InternalToken } from "types";

export const dAppName = "Staking dApp";

export const walletConnectV2ProjectId = "9b1a9564f91cb659ffe21b73d5c4e2d8";

export const apiTimeout = 6000;
export const transactionSize = 15;
export const TOOLS_API_URL = "https://tools.multiversx.com";

export const stakingToken: InternalToken = {
	name: "CucumberX",
	symbol: "CUMB",
	identifier: "XCUMB-da0e35",
	decimals: 18,
	decimalsToDisplay: 2,
};

export const rewardToken: InternalToken = {
	name: "CucumberX",
	symbol: "CUMB",
	identifier: "XCUMB-da0e35",
	decimals: 12,
	decimalsToDisplay: 4,
};

/**
 * Calls to these domains will use `nativeAuth` Baerer token
 */
export const sampleAuthenticatedDomains = [TOOLS_API_URL];

export const adminAddresses = [
	"erd19hcnc2djsjay3prvhuzr0phveducv93khj435pqjza73tcyu4jwsuqywdh",
];
