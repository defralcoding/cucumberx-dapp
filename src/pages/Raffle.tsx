import React, { useEffect, useState } from "react";
import { FormatAmount } from "@multiversx/sdk-dapp/UI";
import { request } from "graphql-request";
import {
	useGetAccount,
	useGetActiveTransactionsStatus,
	useGetNetworkConfig,
} from "hooks";
import {
	TokenPayment,
	TransferTransactionsFactory,
	GasEstimator,
	Address,
} from "@multiversx/sdk-core";
import { NftStake } from "components/NftStake";
import { TokenStake } from "components/TokenStake";
import { TokenLockedStake } from "components/TokenLockedStake";
import { SectionSelector } from "components/SectionSelector";
import { rewardToken as token, graphqlUrl } from "config";
import { Query, gqlCucumberx, gqlLottery } from "types";
import Decimal from "decimal.js";
import { BigNumber } from "bignumber.js";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { string2hex } from "helpers";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";

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

	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);

	const [lotteryData, setLotteryData] = useState<gqlLottery | undefined>();
	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();
	const [prizeImage, setPrizeImage] = useState<string | undefined>();
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const [inputTickets, setInputTickets] = useState<string>("1");

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
            `,
			{
				user: address,
			}
		)
			.then(({ cucumberx }) => {
				if (!cucumberx) return;

				setLotteryData(cucumberx.lottery);
				if (cucumberx.tokenPrice)
					setTokenPrice(new Decimal(cucumberx.tokenPrice));

				if (
					cucumberx?.lottery?.prizeToken &&
					cucumberx?.lottery?.prizeNonce &&
					cucumberx?.lottery?.prizeNonce != 0
				) {
					console.log(cucumberx.lottery.prizeToken, [
						cucumberx.lottery.prizeNonce.toString(),
					]);
					apiNetworkProvider
						.getNftsFromCollection(cucumberx.lottery.prizeToken, [
							cucumberx.lottery.prizeNonce
								.toString(16)
								.padStart(2, "0"),
						])
						.then((res) => {
							console.log(res);
							setPrizeImage(res[0].media[0].url);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	console.log(prizeImage);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (success || fail) {
			fetchData();
		}
	}, [success, fail]);

	const buyTickets = async () => {
		const payload =
			new TransferTransactionsFactory(new GasEstimator())
				.createESDTTransfer({
					tokenTransfer: TokenPayment.fungibleFromBigInteger(
						token.identifier,
						new BigNumber(inputTickets).multipliedBy(
							lotteryData?.ticketPrice ?? 0
						),
						token.decimals
					),
					receiver: new Address(lotteryData?._address),
					sender: new Address(address),
					chainID: "1",
				})
				.getData()
				.toString() +
			"@" +
			string2hex("buy_tickets") +
			"@" +
			new BigNumber(inputTickets).toString(16).padStart(2, "0");

		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: payload,
				receiver: lotteryData?._address,
				gasLimit: 50_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Buying tickets...",
				errorMessage: "An error has occured during buy",
				successMessage: "Tickets bought successfully",
			},
		});
	};
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
					Ticket Price:&nbsp;
					<FormatAmount
						value={(
							lotteryData.ticketPrice ?? new BigNumber(0)
						).toString(10)}
						token={token.symbol}
						digits={token.decimalsToDisplay}
						decimals={token.decimals}
					/>
				</>
			</h2>

			{new BigNumber(lotteryData.prizeAmount ?? 0).gt(0) && (
				<h2 className="text-center">
					<>
						Prize:&nbsp;
						<FormatAmount
							value={(
								lotteryData.prizeAmount ?? new BigNumber(0)
							).toString(10)}
							token={lotteryData.prizeToken}
							digits={lotteryData.prizeNonce === 0 ? 4 : 0}
							decimals={
								lotteryData.prizeNonce === 0
									? 18
									: 0 /* TODO have real number of decimals */
							}
						/>
					</>
				</h2>
			)}
			{lotteryData.prizeDescription && (
				<h2 className="text-center">
					<>Prize Description: {lotteryData.prizeDescription}</>
				</h2>
			)}
			{prizeImage && prizeImage.indexOf(".mp4") && (
				<h2 className="text-center">
					<video
						src={prizeImage}
						className="img-fluid rounded "
						autoPlay
						loop
						muted
						playsInline
						style={{ maxWidth: "250px" }}
					/>
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
				<>
					<h2>Number of tickets to buy:</h2>

					<input
						type="number"
						className="form-control form-control-lg"
						placeholder="Amount"
						value={inputTickets}
						min={1}
						onChange={(e) => setInputTickets(e.target.value)}
					/>

					<button
						type="button"
						className="btn btn-primary btn-lg mt-3"
						onClick={() => buyTickets()}
					>
						Buy {inputTickets} ticket
						{parseInt(inputTickets) > 1 ? "s" : ""}
						&nbsp;for&nbsp;
						<FormatAmount
							value={new BigNumber(lotteryData.ticketPrice ?? 0)
								.multipliedBy(parseInt(inputTickets))
								.toString(10)}
							token={token.symbol}
							digits={token.decimalsToDisplay}
							decimals={token.decimals}
						/>
					</button>
				</>
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

			<hr />

			<h2>Bought tickets:</h2>
			{(lotteryData.userTickets ?? []).length > 0 ? (
				<h3>
					You bought <span>{lotteryData.userTickets!.length}</span>{" "}
					tickets:&nbsp;
					{lotteryData
						.userTickets!.map((ticket) => "#" + ticket)
						.join(", ")}
				</h3>
			) : (
				<h3>You didn't buy any ticket yet.</h3>
			)}

			<h3>
				Your chances of winning are&nbsp;
				{(lotteryData.userTickets ?? []).length > 0
					? (lotteryData.userTickets!.length /
							(lotteryData.lastTicketId ?? 0)) *
					  100
					: 0}
				&nbsp;%
			</h3>
		</div>
	);
};
