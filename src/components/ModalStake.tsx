import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import { InternalToken } from "types";
import BigNumber from "bignumber.js";
import {
	TokenPayment,
	ESDTTransferPayloadBuilder,
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
	lockingDays?: number;
};

export function ModalStake({
	token,
	show,
	setShow,
	alreadyStaked,
	scAddress,
	lockingDays,
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
	const [balance, setBalance] = useState<BigNumber | undefined>();

	const isAmountValid = useMemo(() => {
		if (
			new BigNumber(amount)
				.multipliedBy(10 ** token.decimals)
				.isGreaterThan(balance || new BigNumber(0))
		) {
			return false;
		}
		return true;
	}, [amount, balance]);

	const isInputValid = useMemo(() => {
		if (balance === undefined) return false;
		if (amount === "") return false;
		return isAmountValid;
	}, [amount, balance]);

	const onStake = async () => {
		const payload =
			new ESDTTransferPayloadBuilder()
				.setPayment(
					TokenPayment.fungibleFromAmount(
						token.identifier,
						new BigNumber(amount),
						token.decimals
					)
				)
				.build()
				.toString() +
			"@" +
			string2hex("stake");

		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: payload,
				receiver: scAddress,
				gasLimit: 10_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Staking...",
				errorMessage: "An error has occured during stake",
				successMessage: "Tokens staked successfully",
			},
		});

		handleClose();
	};

	const fetchBalance = async () => {
		const balance = await apiNetworkProvider.getAccountTokenBalance(
			address,
			token.identifier
		);
		setBalance(balance);
	};

	useEffect(() => {
		fetchBalance();
	}, []);

	//TODO fix close button
	return (
		<>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Stake {token.symbol}</Modal.Title>
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
					</div>
					{!isAmountValid && (
						<p className="text-danger">Insufficient funds</p>
					)}
					<div className="d-flex justify-content-end">
						<p>
							Available:&nbsp;
							<FormatAmount
								value={(balance || new BigNumber(0)).toString(
									10
								)}
								token={token.symbol}
								digits={token.decimalsToDisplay}
								decimals={token.decimals}
							/>
						</p>
					</div>

					{alreadyStaked.isGreaterThan(0) &&
						lockingDays === undefined && (
							<p>
								By staking, your pending rewards will be
								automatically claimed.
							</p>
						)}

					{lockingDays !== undefined && (
						<p>
							Your tokens will be&nbsp;
							<b>locked for {lockingDays} days.</b> You will be
							able to claim your rewards when you prefer.
						</p>
					)}
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
						onClick={() => onStake()}
						disabled={!isInputValid}
					>
						Stake
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
