import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import { InternalToken } from "types";
import BigNumber from "bignumber.js";
import {
	TokenPayment,
	TransferTransactionsFactory,
	GasEstimator,
	Address,
} from "@multiversx/sdk-core";
import { FormatAmount } from "@multiversx/sdk-dapp/UI";
import {
	useGetAccount,
	useGetActiveTransactionsStatus,
	useGetNetworkConfig,
} from "hooks";
import { string2hex } from "helpers";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";

type ModalStakeProps = {
	token: InternalToken;
	show: boolean;
	setShow: any;
	alreadyStaked: BigNumber;
	scAddress: string;
};

export function ModalUnstake({
	token,
	show,
	setShow,
	alreadyStaked,
	scAddress,
}: ModalStakeProps) {
	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);
	const { address } = useGetAccount();

	const handleClose = () => {
		setShow(false);
		setAmount("");
	};
	const handleShow = () => setShow(true);

	const [amount, setAmount] = useState("");

	const isAmountValid = useMemo(() => {
		if (
			new BigNumber(amount)
				.multipliedBy(10 ** token.decimals)
				.isGreaterThan(alreadyStaked)
		) {
			return false;
		}
		return true;
	}, [amount, alreadyStaked]);

	const isInputValid = useMemo(() => {
		if (amount === "") return false;
		return isAmountValid;
	}, [amount, alreadyStaked]);

	const onUnstake = async () => {
		const _amount = new BigNumber(amount).multipliedBy(
			10 ** token.decimals
		);
		let amountHex = _amount.toString(16);
		if (amountHex.length % 2 !== 0) {
			amountHex = "0" + amountHex;
		}

		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "unstake@" + amountHex,
				receiver: scAddress,
				gasLimit: 25_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Unstaking...",
				errorMessage: "An error has occured during unstake",
				successMessage: "Tokens unstaked successfully",
			},
		});

		handleClose();
	};

	return (
		<>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Unstake {token.symbol}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="input-group">
						<input
							type="number"
							className={
								"form-control form-control-lg " +
								(isAmountValid ? "" : "is-invalid")
							}
							placeholder="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<div className="input-group-append">
							<span className="input-group-text">
								{token.symbol}
							</span>
						</div>
						<div className="input-group-append">
							<button
								className="btn btn-primary"
								onClick={() =>
									setAmount(
										alreadyStaked
											.dividedBy(10 ** token.decimals)
											.toString(10)
									)
								}
							>
								MAX
							</button>
						</div>
					</div>
					{!isAmountValid && (
						<p className="text-danger">Insufficient funds</p>
					)}
					<div className="d-flex justify-content-end">
						<p>
							Staked:&nbsp;
							<FormatAmount
								value={alreadyStaked.toString(10)}
								token={token.symbol}
								digits={token.decimalsToDisplay}
								decimals={token.decimals}
							/>
						</p>
					</div>

					<p>Your pending rewards will be automatically claimed.</p>
				</Modal.Body>
				<Modal.Footer>
					<button
						className="btn btn-lg btn-secondary mr-2"
						onClick={() => handleClose()}
					>
						Cancel
					</button>
					<button
						className="btn btn-lg btn-primary"
						onClick={() => onUnstake()}
						disabled={!isInputValid}
					>
						Unstake
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
