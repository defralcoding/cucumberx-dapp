import React, { useState } from "react";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { string2hex } from "helpers";
import { InternalToken } from "types";
import {
	TokenPayment,
	ESDTTransferPayloadBuilder,
	Address,
} from "@multiversx/sdk-core";

type Props = {
	scAddress: string;
	token: InternalToken;
};

export const DepositRewards = ({ scAddress, token }: Props) => {
	const [depositRewards, setDepositRewards] = useState(0);

	const depositRewardsToContract = async () => {
		await refreshAccount();

		const payload =
			new ESDTTransferPayloadBuilder()
				.setPayment(
					TokenPayment.fungibleFromAmount(
						token.identifier,
						depositRewards,
						token.decimals
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

	return (
		<div>
			<h2>Deposit rewards</h2>
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
	);
};
