import React, { useState, useEffect } from "react";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { string2hex } from "helpers";
import { InternalToken, Query, gqlCucumberx, gqlLottery } from "types";
import { useGetAccount, useGetActiveTransactionsStatus } from "hooks";
import {
	TokenPayment,
	TransferTransactionsFactory,
	GasEstimator,
	Address,
	TransactionPayload,
	ContractFunction,
	SmartContract,
	Interaction,
	TokenTransfer,
	BigUIntValue,
} from "@multiversx/sdk-core";
import { request } from "graphql-request";
import Decimal from "decimal.js";
import { rewardToken as token, graphqlUrl } from "config";
import BigNumber from "bignumber.js";

export const Raffle = () => {
	const { success, fail } = useGetActiveTransactionsStatus();
	const account = useGetAccount();

	const [lotteryData, setLotteryData] = useState<gqlLottery | undefined>();
	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const [inputTickets, setInputTickets] = useState<string>("1");
	const [inputEnd, setInputEnd] = useState<string>("");

	const fetchData = async () => {
		request<Query>(
			graphqlUrl,
			`
            query {
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
                        winner
                        winnerTicket
                        lastTicketId
                        deadline
                    }
                }
            }              
            `
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

	/*
	const [depositRewards, setDepositRewards] = useState(0);

	const depositRewardsToContract = async () => {
		await refreshAccount();

		const payload =
			new TransferTransactionsFactory(new GasEstimator())
				.createESDTTransfer({
					tokenTransfer: TokenPayment.fungibleFromAmount(
						token.identifier,
						depositRewards,
						token.decimals
					),
					receiver: new Address(scAddress),
					sender: new Address(""),
					chainID: "1",
				})
				.getData()
				.toString() +
			"@" +
			string2hex("deposit_rewards");

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: payload,
				receiver: scAddress,
				gasLimit: 10_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Depositing rewards...",
				errorMessage: "An error has occured during deposit",
				successMessage: "Rewards deposited successfully",
			},
		});
	};
    */
	if (!lotteryData) {
		return <h1>Loading...</h1>;
	}

	const sendCreateLottery = async () => {
		await refreshAccount();

		let contract = new SmartContract({
			address: new Address(lotteryData._address),
		});
		let f = new ContractFunction("start_lottery");
		let interaction = new Interaction(contract, f, [
			new BigUIntValue(
				new BigNumber(Math.floor(new Date(inputEnd).getTime() / 1000))
			),
		]);

		let transaction = interaction
			.withValue(TokenTransfer.egldFromAmount(1))
			.withGasLimit(20000000)
			.withNonce(account.nonce)
			.withSender(new Address(account.address))
			.withChainID("1")
			.buildTransaction();

		console.log(transaction);
		const { sessionId } = await sendTransactions({
			transactions: transaction,
			transactionsDisplayInfo: {
				processingMessage: "Determining winner...",
				errorMessage: "An error has occured during determine",
				successMessage: "Winner determined successfully",
			},
		});
	};

	const sendDetermineWinner = async () => {
		await refreshAccount();
		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "draw_winner",
				receiver: lotteryData._address,
				gasLimit: 15_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Determining winner...",
				errorMessage: "An error has occured during determine",
				successMessage: "Winner determined successfully",
			},
		});
	};

	return (
		<div>
			{currentTimestamp > (lotteryData.deadline ?? 0) &&
				(lotteryData.winnerTicket ?? 0) > 0 && (
					<h3>
						The last raffle is over. The winner is ticket #
						{lotteryData.winnerTicket}
						<br />
						You can now create a new raffle.
						<hr />
						<div>
							<label>End date/time</label>
							<input
								type="datetime-local"
								className="form-control my-2"
								placeholder="End date"
								value={inputEnd}
								onChange={(e) => setInputEnd(e.target.value)}
							/>
						</div>
						<button
							className="btn btn-primary my-1"
							onClick={sendCreateLottery}
						>
							Create lottery
						</button>
					</h3>
				)}

			{currentTimestamp > (lotteryData.deadline ?? 0) &&
				lotteryData.winnerTicket === 0 && (
					<>
						<h3>
							The last raffle is over.
							<br />
							You can now determine the winner.
						</h3>
						<button
							className="btn btn-primary my-1"
							onClick={sendDetermineWinner}
						>
							Determine winner
						</button>
					</>
				)}

			{currentTimestamp < (lotteryData.deadline ?? 0) && (
				<h3>The raffle is live!</h3>
			)}

			<hr />

			<h3>Number of tickets bought: {lotteryData.lastTicketId}</h3>
		</div>
	);
};
