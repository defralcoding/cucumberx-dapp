import React, { useState, useEffect } from "react";
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
import { tokenStakingContractAddress } from "config";

type ModalStakeProps = {
	token: InternalToken;
	show: boolean;
	setShow: any;
	alreadyStaked: BigNumber;
};

export function ModalStake({
	token,
	show,
	setShow,
	alreadyStaked,
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

	const onStake = async () => {
		if (balance === undefined) return;
		if (amount === "") return;
		if (
			new BigNumber(amount)
				.multipliedBy(10 ** token.decimals)
				.isGreaterThan(balance)
		) {
			alert("Amount is greater than balance");
			//TODO show error in a better way
			return;
		}

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
				receiver: tokenStakingContractAddress,
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
							className="form-control form-control-lg"
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
					<div className="d-flex justify-content-end">
						<p className="mt-3">
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

					{alreadyStaked.isGreaterThan(0) && (
						<p>
							By staking, your pending rewards will be
							automatically claimed.
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
						className="btn btn-lg btn-primary "
						onClick={() => onStake()}
					>
						Stake
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
