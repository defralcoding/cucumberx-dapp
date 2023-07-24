import React, { useEffect, useState } from "react";
import { faBan, faGrip } from "@fortawesome/free-solid-svg-icons";
import { AxiosError } from "axios";
import { Loader, PageState } from "components";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";
import {
	TokenPayment,
	ESDTTransferPayloadBuilder,
	Address,
} from "@multiversx/sdk-core";
import {
	useGetAccount,
	useGetActiveTransactionsStatus,
	useGetNetworkConfig,
} from "hooks";
import { ServerTransactionType, NonFungibleToken } from "types";
import CountUp from "react-countup";
import { NftVisualizer } from "components/NftVisualizer";
import { SectionSelector } from "components/SectionSelector";
import { string2hex } from "helpers";
import BigNumber from "bignumber.js";

import { rewardToken } from "config";
import { DepositRewards } from "components/Admin/DepositRewards";

export const AdminSettings = () => {
	const createLockedToken = async () => {
		await refreshAccount();

		const payload =
			"newLockedToken@" +
			string2hex("CUMB-8b7006") +
			"@" +
			string2hex("LKCUMB") +
			"@" +
			string2hex("LockedCUMB") +
			"@" +
			"12";

		const { sessionId } = await sendTransactions({
			transactions: {
				value: "500000000000000000",
				data: payload,
				receiver:
					"erd1qqqqqqqqqqqqqpgqwcywk6z2mx6apxcyy6ngkxene9844lahdn3qczrxkf",
				gasLimit: 100_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Depositing rewards...",
				errorMessage: "An error has occured during deposit",
				successMessage: "Rewards deposited successfully",
			},
		});
	};

	const lockTokens = async () => {
		await refreshAccount();

		const payload =
			"ESDTTransfer@" +
			string2hex("CUMB-8b7006") +
			"@" +
			"033b2e3c9fd0803ce8000000" +
			"@" +
			string2hex("lockTokens") +
			"@" +
			"b4";

		const { sessionId } = await sendTransactions({
			transactions: {
				value: "0",
				data: payload,
				receiver:
					"erd1qqqqqqqqqqqqqpgqwcywk6z2mx6apxcyy6ngkxene9844lahdn3qczrxkf",
				gasLimit: 25_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Depositing rewards...",
				errorMessage: "An error has occured during deposit",
				successMessage: "Rewards deposited successfully",
			},
		});
	};

	return (
		<div>
			<div className="container">
				<div className="bg-secondary p-4 mt-4">
					<h1>NFT Staking</h1>
					<DepositRewards
						scAddress="erd1qqqqqqqqqqqqqpgqpt97ps7w69ng3ynxpn3lq9fc0wj5u9hddn3qp4lqzu"
						token={rewardToken}
					/>

					<hr />

					<h1>Token Staking</h1>
					<DepositRewards
						scAddress="erd1qqqqqqqqqqqqqpgq8rl3293f5cus8u9scmdu796qycjnqgw9dn3qztkevg"
						token={rewardToken}
					/>

					<hr />

					<h1>Token Locked Staking</h1>
					<DepositRewards
						scAddress="erd1qqqqqqqqqqqqqpgqk4pp8f5742f2w5nrz0zynnmwe0utp2gcdn3qhgh4xr"
						token={rewardToken}
					/>

					<button
						className="btn btn-primary mt-2"
						onClick={createLockedToken}
					>
						1. Crea LKCUMB (0.5 EGLD)
					</button>
					<button
						className="btn btn-primary mt-2"
						onClick={lockTokens}
					>
						2. Blocca token
					</button>
				</div>
			</div>
		</div>
	);

	/*
	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);

	const { address } = useGetAccount();
	const { success, fail } = useGetActiveTransactionsStatus();

	const [rewardsPerDay, setRewardsPerDay] = useState(0);
	const [depositRewards, setDepositRewards] = useState(0);

	const [isLoading, setIsLoading] = useState(true);

	const changeRewardsPerDay = async () => {
		await refreshAccount();

		const bigNumberRewardsPerDay = new BigNumber(
			rewardsPerDay
		).multipliedBy(10 ** rewardToken.decimals);
		let hexRewardsPerDay = bigNumberRewardsPerDay.toString(16);
		if (hexRewardsPerDay.length % 2 != 0) {
			hexRewardsPerDay = "0" + hexRewardsPerDay;
		}

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "set_tokens_per_day@" + hexRewardsPerDay,
				receiver: nftStakingContractAddress,
				gasLimit: 10_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Changing config...",
				errorMessage: "An error has occured during change",
				successMessage: "Config changed successfully",
			},
		});
	};

	const depositRewardsToContract = async () => {
		await refreshAccount();

		const payload =
			new ESDTTransferPayloadBuilder()
				.setPayment(
					TokenPayment.fungibleFromAmount(
						rewardToken.identifier,
						depositRewards,
						rewardToken.decimals
					)
				)
				.build()
				.toString() +
			"@" +
			string2hex("deposit_rewards");

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: payload,
				receiver: nftStakingContractAddress,
				gasLimit: 10_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Depositing rewards...",
				errorMessage: "An error has occured during deposit",
				successMessage: "Rewards deposited successfully",
			},
		});
	};

	useEffect(() => {
		setIsLoading(false);
	}, []);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			<div className="container">
				<div className="bg-secondary p-4 mt-4">
					<div>
						<h1>Change rewards per day</h1>
						<input
							type="number"
							className="form-control"
							placeholder="Rewards per day"
							value={rewardsPerDay}
							onChange={(e) => setRewardsPerDay(+e.target.value)}
						/>
						<button
							className="btn btn-primary mt-2"
							onClick={changeRewardsPerDay}
						>
							Set rewards per day
						</button>
					</div>

					<hr />

					<div>
						<h1>Deposit rewards</h1>
						<input
							type="number"
							className="form-control"
							placeholder="Amount"
							value={depositRewards}
							onChange={(e) => setDepositRewards(+e.target.value)}
						/>
						<button
							className="btn btn-primary mt-2"
							onClick={depositRewardsToContract}
						>
							Deposit rewards
						</button>
					</div>
				</div>
			</div>
		</div>
	);
	*/
};
