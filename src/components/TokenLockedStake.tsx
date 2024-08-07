import React, { useEffect, useState, useMemo } from "react";
import { faBan, faGrip } from "@fortawesome/free-solid-svg-icons";
import { AxiosError } from "axios";
import { Loader, PageState } from "components";
import { FormatAmount } from "@multiversx/sdk-dapp/UI";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account/refreshAccount";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";
import { TokenPayment, Address } from "@multiversx/sdk-core";
import {
	useGetAccount,
	useGetActiveTransactionsStatus,
	useGetNetworkConfig,
} from "hooks";
import {
	ServerTransactionType,
	NonFungibleToken,
	TokenStakingPosition,
	TokenLockedStakingPosition,
	defaultTokenStakingPosition,
	InternalToken,
	gqlStakingTokenLocked,
} from "types";
import CountUp from "react-countup";
import { NftVisualizer } from "components/NftVisualizer";
import { SectionSelector } from "components/SectionSelector";
import { ModalStake } from "components/ModalStake";
import { ModalUnstake } from "components/ModalUnstake";
import { string2hex } from "helpers";
import BigNumber from "bignumber.js";
import Decimal from "decimal.js";

enum Section {
	staked = "Staked",
	wallet = "Wallet",
}

type errorsType = {
	staked: string | undefined;
	rewards: string | undefined;
	apr: string | undefined;
	lockingDays: string | undefined;
	generic: string | undefined;
};

type Props = {
	data: gqlStakingTokenLocked | undefined;
	tokenPrice: Decimal | undefined;
	stakingToken: InternalToken;
	rewardToken: InternalToken;
};

export const TokenLockedStake = ({
	data,
	tokenPrice,
	stakingToken,
	rewardToken,
}: Props) => {
	if (!data) {
		return <Loader />;
	}

	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);

	const { address } = useGetAccount();
	const { success, fail } = useGetActiveTransactionsStatus();

	const [section, setSection] = useState<Section>(Section.staked);

	const {
		_address: scAddress,
		rewardsForUser,
		apr,
		lockDays: lockingDays,
		userStaking: stakingPositions,
	} = data;

	if (
		!scAddress ||
		!apr ||
		stakingPositions === undefined ||
		!lockingDays ||
		rewardsForUser === undefined
	) {
		return (
			<div className="my-5">
				<PageState
					icon={faBan}
					className="text-muted"
					title="Error fetching Data"
				/>
			</div>
		);
	}

	const rewards = new BigNumber(rewardsForUser);
	const rewardsValue = new Decimal(rewards.toString())
		.div(10 ** rewardToken.decimals)
		.mul(tokenPrice || new Decimal(0))
		.toSignificantDigits(3);

	const [modalStakeShow, setModalStakeShow] = useState(false);
	const [modalUnstakeShow, setModalUnstakeShow] = useState(false);

	const [transactions, setTransactions] = useState<ServerTransactionType[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false); //TODO
	const [error, setError] = useState<errorsType>({
		staked: undefined,
		rewards: undefined,
		apr: undefined,
		lockingDays: undefined,
		generic: undefined,
	});

	const stakedAmount = useMemo(() => {
		return stakingPositions.reduce(
			(acc, curr) => acc.plus(curr.staked_amount),
			new BigNumber(0)
		);
	}, [stakingPositions]);

	const claimRewards = async () => {
		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "claim_rewards",
				receiver: scAddress,
				gasLimit: 80_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Claiming rewards...",
				errorMessage: "An error has occured during claiming",
				successMessage: "Rewards claimed successfully!",
			},
		});
	};

	const unstake = async (stakingPosition: TokenLockedStakingPosition) => {
		let hexId = stakingPosition.id.toString(16);
		if (hexId.length % 2 != 0) {
			hexId = "0" + hexId;
		}

		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "unstake@" + hexId,
				receiver: scAddress,
				gasLimit: 35_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Unstaking...",
				errorMessage: "An error has occured during unstake",
				successMessage: "Tokens unstaked successfully",
			},
		});
	};

	if (isLoading) {
		return <Loader />;
	}

	if (error.generic) {
		return (
			<div className="my-5">
				<PageState
					icon={faBan}
					className="text-muted"
					title="Error fetching Data"
				/>
			</div>
		);
	}

	return (
		<>
			<div className="bg-secondary p-4 mt-4 text-center">
				{stakingPositions.length > 0 || true ? (
					<div className="display-3">
						{error.rewards && !rewards && (
							<PageState title="Sorry, we can't calculate your rewards. Please try again later." />
						)}
						{rewards && (
							<CountUp
								end={rewards
									.dividedBy(10 ** rewardToken.decimals)
									.toNumber()}
								decimals={rewardToken.decimalsToDisplay}
								duration={2}
								useEasing={true}
								preserveValue={true}
								prefix="Rewards: "
								suffix={
									" " +
									rewardToken.symbol +
									" ($" +
									rewardsValue +
									")"
								}
							/>
						)}
						<div>
							<button
								className="btn btn-lg btn-primary "
								onClick={() => claimRewards()}
								disabled={!rewards || rewards.isZero()}
							>
								Claim Rewards
							</button>
						</div>
					</div>
				) : (
					<p className="display-3">Stake now and earn rewards!</p>
				)}

				<div className="mt-4 text-left">
					<p>
						<span className="display-3">Staked:&nbsp;</span>
						<br className="d-md-none" />
						<span className="display-4">
							<FormatAmount
								value={stakedAmount.toString(10)}
								token={stakingToken.symbol}
								digits={stakingToken.decimalsToDisplay}
								decimals={stakingToken.decimals}
							/>
						</span>
					</p>
					<p>
						<span className="display-3">APR:&nbsp;</span>
						<br className="d-md-none" />
						<span className="display-4">{apr.toString()} %</span>
					</p>
					<p>
						<span className="display-3">Lock days:&nbsp;</span>
						<br className="d-md-none" />
						<span className="display-4">{lockingDays}</span>
					</p>
				</div>

				<div>
					<button
						className="btn btn-lg btn-primary"
						onClick={() => setModalStakeShow(true)}
					>
						Stake
					</button>
				</div>

				{stakingPositions.length > 0 && (
					<div className="text-left">
						<hr />
						<h1>Positions:</h1>
						{stakingPositions.map((position, index) => (
							<div className="card p-3" key={index}>
								<div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
									<div className="d-flex align-items-center">
										<div className="d-flex flex-column">
											<h3>
												<FormatAmount
													value={position.staked_amount.toString(
														10
													)}
													token={stakingToken.symbol}
													digits={
														stakingToken.decimalsToDisplay
													}
													decimals={
														stakingToken.decimals
													}
												/>
											</h3>
											<h3>
												Unlocks:&nbsp;
												<b>
													{new Date(
														position.unlock_timestamp *
															1000
													).toLocaleString()}
												</b>
											</h3>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<button
											className="btn btn-primary"
											onClick={() => unstake(position)}
											disabled={
												position.unlock_timestamp >
												Date.now() / 1000
											}
										>
											Unstake
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<ModalStake
				token={stakingToken}
				show={modalStakeShow}
				setShow={setModalStakeShow}
				alreadyStaked={stakedAmount}
				scAddress={scAddress}
				lockingDays={lockingDays}
			/>
		</>
	);
};
