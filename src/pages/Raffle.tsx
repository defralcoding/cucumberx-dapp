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

const timestampToDateTime = (timestamp: number | undefined) => {
	if (timestamp === undefined || isNaN(timestamp)) {
		return "N/A";
	}
	const date = new Date(timestamp * 1000);
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export const Raffle = () => {
	const { address } = useGetAccount();
	const { success, fail } = useGetActiveTransactionsStatus();

	const [lotteryData, setLotteryData] = useState<gqlLottery | undefined>();
	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const fetchData = async () => {
		request<Query>(
			graphqlUrl,
			`
            query($user: String!) {
                cucumberx {
                    tokenPrice
                    lottery {
                        _address
                        ticketToken
                        ticketPrice
                        prizeAmount
                        prizeToken
                        prizeNonce
                        prizeDescription
                        userTickets(user: $user)
                        winner                        
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

	if (!lotteryData) {
		return <h1 className="text-center">Loading...</h1>;
	}

	return (
		<div className="container mt-3 text-center">
			<h1 className="mb-4">
				Use your hard earned $CUMB to buy tickets for the raffle!
			</h1>

			<h2 className="text-center">
				<>
					Ticket Price: {lotteryData.ticketPrice}&nbsp;
					{rewardToken.symbol}
				</>
			</h2>

			{new BigNumber(lotteryData.prizeAmount ?? 0).gt(0) && (
				<h2 className="text-center">
					<>
						Prize: {lotteryData.prizeAmount}{" "}
						{lotteryData?.prizeToken}
					</>
				</h2>
			)}
			{lotteryData.prizeDescription && (
				<h2 className="text-center">
					<>Prize Description: {lotteryData.prizeDescription}</>
				</h2>
			)}

			<h2 className="text-center">
				<>End of raffle: {timestampToDateTime(lotteryData.deadline)}</>
			</h2>
			<h2 className="text-center">
				<>Total tickets bought: {lotteryData.lastTicketId}</>
			</h2>

			<hr />

			{currentTimestamp < (lotteryData.deadline ?? 0) ? (
				<h2>Number of tickets to buy:</h2>
			) : (
				<>
					<h2>The raffle is over.</h2>
					{lotteryData.winnerTicket ?? 0 > 0 ? (
						<h2>
							{lotteryData.userTickets!.includes(
								lotteryData.winnerTicket!
							) ? (
								<>
									You won the raffle with the ticket #
									{lotteryData.winnerTicket}! Congratulations!
								</>
							) : (
								<>
									The winning ticket is #
									{lotteryData.winnerTicket} and the winner
									has already received his prize
								</>
							)}
						</h2>
					) : (
						<h2>The winning ticket will be announced soon</h2>
					)}

					<h3 className="mt-4">Join us soon for the next raffle!</h3>
				</>
			)}
		</div>
	);
};
