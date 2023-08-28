import { InternalToken } from "types";

export const dAppName = "GLORY HOLE";

export const walletConnectV2ProjectId = "3c548c98b9468bbe281d39d716b77ce2";

export const apiTimeout = 6000;
export const transactionSize = 15;
export const TOOLS_API_URL = "https://tools.multiversx.com";

export const graphqlUrl = "https://127.0.0.1:3000/graphql";

export const stakingToken: InternalToken = {
	name: "CucumberX",
	symbol: "$CUMB",
	identifier: "CUMB-8b7006",
	decimals: 18,
	decimalsToDisplay: 2,
};

export const rewardToken: InternalToken = {
	name: "CucumberX",
	symbol: "$CUMB",
	identifier: "CUMB-8b7006",
	decimals: 18,
	decimalsToDisplay: 4,
};

/**
 * Calls to these domains will use `nativeAuth` Baerer token
 */
export const sampleAuthenticatedDomains = [TOOLS_API_URL];

export const adminAddresses = [
	"erd19hcnc2djsjay3prvhuzr0phveducv93khj435pqjza73tcyu4jwsuqywdh",
	"erd1g3dygd6kh2nt5kvkl6fpp3rp3y9ez5wfaxwwfzzkglwqn2aydn3q6vqkxk",
	"erd1pnund9anqkrkma07af20q2s92ayv02ratks3ndsxdk3xsar2hlxqdsg9xg",
];
