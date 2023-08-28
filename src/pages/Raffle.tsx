import React, { useEffect, useState } from "react";
import { request } from "graphql-request";
import { useGetAccount, useGetActiveTransactionsStatus } from "hooks";
import { NftStake } from "components/NftStake";
import { TokenStake } from "components/TokenStake";
import { TokenLockedStake } from "components/TokenLockedStake";
import { SectionSelector } from "components/SectionSelector";
import { rewardToken, graphqlUrl } from "config";
import { Query, gqlCucumberx, gqlLottery } from "types";
import Decimal from "decimal.js";
import { BigNumber } from "bignumber.js";

const timestampToDateTime = (timestamp: number) => {
	if (isNaN(timestamp)) {
		return "N/A";
	}
	const date = new Date(timestamp * 1000);
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export const Raffle = () => {
	const { address } = useGetAccount();
	const { success, fail } = useGetActiveTransactionsStatus();

	/*
	const [stakingTokenData, setStakingTokenData] = useState<
		gqlStakingToken | undefined
	>();
	const [stakingTokenLockedData, setStakingTokenLockedData] = useState<
		gqlStakingTokenLocked | undefined
	>();
    */

	const [lotteryData, setLotteryData] = useState<gqlLottery | undefined>();
	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();

	const fetchData = async () => {
		request<Query>(
			graphqlUrl,
			`
            query {
                cucumberx {
                    tokenPrice
                    lottery {
                        ticketToken
                        ticketPrice
                        prizeAmount
                        prizeToken
                        
                        winnerTicket
                        lastTicketId
                        deadline
                    }
                }
            }              
            `, //TODO add winner
			{
				user: address,
			}
		)
			.then(({ cucumberx }) => {
				if (!cucumberx) return;

				setLotteryData(cucumberx.lottery);
				if (cucumberx.tokenPrice)
					setTokenPrice(new Decimal(cucumberx.tokenPrice));
			})
			.catch((err) => {
				console.log(err);
			});
	};

	console.log(lotteryData);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (success || fail) {
			fetchData();
		}
	}, [success, fail]);

	return (
		<div className="container mt-3 text-center">
			<h1 className="mb-4">
				Use your hard earned $CUMB to buy tickets for the raffle!
			</h1>

			<h2 className="text-center">
				<>
					Ticket Price: {lotteryData?.ticketPrice}&nbsp;
					{rewardToken.symbol}
				</>
			</h2>
			{new BigNumber(lotteryData?.prizeAmount ?? 0).gt(0) && (
				<h2 className="text-center">
					<>
						Prize Amount: {lotteryData?.prizeAmount}{" "}
						{lotteryData?.prizeToken}
					</>
				</h2>
			)}
		</div>
	);
};
