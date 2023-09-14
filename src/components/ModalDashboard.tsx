import React, { useState, useEffect, useMemo } from "react";
import { request } from "graphql-request";
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
import { rewardToken as token, graphqlUrl } from "config";
import { Query, gqlCucumberx } from "types";
import { string2hex, logout } from "helpers";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";
import Decimal from "decimal.js";

type ModalDashboardProps = {
	show: boolean;
	setShow: any;
};

export function ModalDashboard({ show, setShow }: ModalDashboardProps) {
	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);
	const { address } = useGetAccount();

	const handleClose = () => {
		setShow(false);
	};
	const handleShow = () => setShow(true);

	const [tokenStaked, setTokenStaked] = useState<BigNumber | undefined>();
	const [tokenLocked, setTokenLocked] = useState<BigNumber | undefined>();
	const [nftsStaked, setNftsStaked] = useState<number | undefined>();
	const [rewards, setRewards] = useState<BigNumber | undefined>();

	const [nftRewards, setNftRewards] = useState<BigNumber | undefined>();
	const [tokenRewards, setTokenRewards] = useState<BigNumber | undefined>();
	const [tokenLockedRewards, setTokenLockedRewards] = useState<
		BigNumber | undefined
	>();

	const [nftStakingAddress, setNftStakingAddress] = useState<
		string | undefined
	>();
	const [tokenStakingAddress, setTokenStakingAddress] = useState<
		string | undefined
	>();
	const [tokenLockedStakingAddress, setTokenLockedStakingAddress] = useState<
		string | undefined
	>();

	const minimumRewardsToClaim = new BigNumber(10).multipliedBy(
		10 ** token.decimals
	);

	const fetchData = () => {
		request<Query>(
			graphqlUrl,
			`
            query($user: String) {
                cucumberx {
                    tokenPrice
                    stakingNft {
                        _address
                        tokensPerDay
                        userStaking(user: $user) {
                            nonce
                        }
                        rewardsForUser(address: $user)
                    }
                    stakingToken {
                        _address
                        apr
                        userStaking(user: $user) {
                            staked_amount
                        }
                        rewardsForUser(address: $user)
                    }
                    stakingTokenLocked {
                        _address
                        apr
                        userStaking(user: $user) {
                            staked_amount
                        }
                        rewardsForUser(address: $user)
                    }
                }
            }
            `,
			{
				user: address,
			}
		).then(({ cucumberx }) => {
			if (!cucumberx) return;

			const { stakingNft, stakingToken, stakingTokenLocked, tokenPrice } =
				cucumberx;

			let totalRewards = new BigNumber(0);

			if (stakingNft) {
				const nStakedNfts = stakingNft.userStaking!.length;
				const rewards = stakingNft.rewardsForUser!;
				setNftsStaked(nStakedNfts);
				setNftRewards(new BigNumber(rewards));
				setNftStakingAddress(stakingNft._address);
				totalRewards = totalRewards.plus(rewards);
			}

			if (stakingToken) {
				const stakedAmount = stakingToken.userStaking!.staked_amount;
				const rewards = stakingToken.rewardsForUser!;
				setTokenStaked(stakedAmount);
				setTokenRewards(new BigNumber(rewards));
				setTokenStakingAddress(stakingToken._address);
				totalRewards = totalRewards.plus(rewards);
			}

			if (stakingTokenLocked) {
				const stakedLockedAmount =
					stakingTokenLocked.userStaking!.reduce(
						(acc, { staked_amount }) => acc.plus(staked_amount),
						new BigNumber(0)
					);
				const rewards = stakingTokenLocked.rewardsForUser!;
				setTokenLocked(stakedLockedAmount);
				setTokenLockedRewards(new BigNumber(rewards));
				setTokenLockedStakingAddress(stakingTokenLocked._address);
				totalRewards = totalRewards.plus(rewards);
			}

			setRewards(totalRewards);
		});
	};

	useEffect(() => {
		if (show) {
			fetchData();
		}
	}, [show]);

	const handleLogout = () => {
		logout(`${window.location.origin}/unlock`);
	};

	const claimRewards = async () => {
		let transactions: any[] = [];

		if (
			nftRewards &&
			nftsStaked &&
			nftRewards.gt(new BigNumber(10).multipliedBy(10 ** token.decimals))
		) {
			transactions.push({
				value: 0,
				data: "claim_rewards",
				receiver: nftStakingAddress,
				gasLimit: Math.min(
					10_000_000 + 7_000_000 * nftsStaked,
					600_000_000
				),
			});
		}

		if (
			tokenRewards &&
			tokenRewards.gt(
				new BigNumber(10).multipliedBy(10 ** token.decimals)
			)
		) {
			transactions.push({
				value: 0,
				data: "claim_rewards",
				receiver: tokenStakingAddress,
				gasLimit: 20_000_000,
			});
		}

		if (
			tokenLockedRewards &&
			tokenLockedRewards.gt(
				new BigNumber(10).multipliedBy(10 ** token.decimals)
			)
		) {
			transactions.push({
				value: 0,
				data: "claim_rewards",
				receiver: tokenLockedStakingAddress,
				gasLimit: 20_000_000,
			});
		}

		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: transactions,
			transactionsDisplayInfo: {
				processingMessage: "Claiming rewards...",
				errorMessage: "An error has occured during claim",
				successMessage: "Rewards claimed successfully",
			},
		});

		handleClose();
	};

	return (
		<>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Account details</Modal.Title>
				</Modal.Header>
				<Modal.Body
					style={{
						wordWrap: "break-word",
						overflowWrap: "break-word",
					}}
				>
					<h5>Address: {address}</h5>

					<ul className="list-group mt-3">
						<li className="list-group-item">
							{nftsStaked && (
								<div className="d-flex flex-row align-items-center">
									<h5>NFTs staked</h5>
									<h5 className="d-flex flex-grow-1 justify-content-end">
										{nftsStaked}
									</h5>
								</div>
							)}

							{tokenStaked && (
								<div className="d-flex flex-row align-items-center">
									<h5>Tokens staked</h5>
									<h5 className="d-flex flex-grow-1 justify-content-end">
										<FormatAmount
											value={tokenStaked.toString(10)}
											token={token.symbol}
											digits={2}
											decimals={token.decimals}
										/>
									</h5>
								</div>
							)}

							{tokenLocked && (
								<div className="d-flex flex-row align-items-center">
									<h5>Tokens locked</h5>
									<h5 className="d-flex flex-grow-1 justify-content-end">
										<FormatAmount
											value={tokenLocked.toString(10)}
											token={token.symbol}
											digits={2}
											decimals={token.decimals}
										/>
									</h5>
								</div>
							)}

							{rewards && (
								<div className="d-flex flex-row align-items-center">
									<h5>Cumulated rewards</h5>
									<h5 className="d-flex flex-grow-1 justify-content-end">
										<FormatAmount
											value={rewards.toString(10)}
											token={token.symbol}
											digits={4}
											decimals={token.decimals}
										/>
									</h5>
								</div>
							)}
						</li>
					</ul>

					<button
						className="btn btn-lg btn-primary mt-3 w-100"
						onClick={() => claimRewards()}
						disabled={
							!(
								rewards &&
								rewards.gt(minimumRewardsToClaim) &&
								(nftRewards?.gt(minimumRewardsToClaim) ||
									tokenRewards?.gt(minimumRewardsToClaim) ||
									tokenLockedRewards?.gt(
										minimumRewardsToClaim
									))
							)
						}
					>
						Claim All Rewards
					</button>

					<button
						className="btn btn-primary mt-3 w-100"
						onClick={handleLogout}
					>
						Logout
					</button>
				</Modal.Body>
			</Modal>
		</>
	);
}
