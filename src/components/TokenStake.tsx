import React, { useEffect, useState } from "react";
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
	defaultTokenStakingPosition,
	InternalToken,
	gqlStakingToken,
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
	generic: string | undefined;
};

type Props = {
	data: gqlStakingToken | undefined;
	tokenPrice: Decimal | undefined;
	stakingToken: InternalToken;
	rewardToken: InternalToken;
};

export const TokenStake = ({
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

	const {
		_address: scAddress,
		rewardsForUser,
		apr,
		userStaking: stakingPosition,
	} = data;

	if (!scAddress || !apr || !stakingPosition || !rewardsForUser) {
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

	const [section, setSection] = useState<Section>(Section.staked);

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
		generic: undefined,
	});

	const claimRewards = async () => {
		await refreshAccount();

		const { sessionId } = await sendTransactions({
			transactions: {
				value: 0,
				data: "claim_rewards",
				receiver: scAddress,
				gasLimit: 30_000_000,
			},
			transactionsDisplayInfo: {
				processingMessage: "Claiming rewards...",
				errorMessage: "An error has occured during claiming",
				successMessage: "Rewards claimed successfully!",
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
			<div className="bg-secondary p-4 mt-4">
				<div className="text-center display-3 mb-4">
					{!new BigNumber(stakingPosition.staked_amount).isZero() ? (
						<>
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
									className="btn btn-lg btn-primary"
									onClick={() => claimRewards()}
									disabled={!rewards || rewards.isZero()}
								>
									Claim Rewards
								</button>
							</div>
						</>
					) : (
						<p>Stake now and earn rewards!</p>
					)}

					<div className="mt-4 text-left">
						<p>
							<span className="display-3">Staked:&nbsp;</span>
							<br className="d-md-none" />
							<span className="display-4">
								<FormatAmount
									value={stakingPosition.staked_amount.toString(
										10
									)}
									token={stakingToken.symbol}
									digits={stakingToken.decimalsToDisplay}
									decimals={stakingToken.decimals}
								/>
							</span>
						</p>
						<p>
							<span className="display-3">APR:&nbsp;</span>
							<br className="d-md-none" />
							<span className="display-4">
								{apr.toString()} %
							</span>
						</p>
					</div>

					<div>
						<button
							className="btn btn-lg btn-primary mr-4"
							onClick={() => setModalStakeShow(true)}
						>
							Stake
						</button>
						<button
							className="btn btn-lg btn-primary"
							onClick={() => setModalUnstakeShow(true)}
							disabled={new BigNumber(
								stakingPosition.staked_amount
							).isZero()}
						>
							Unstake
						</button>
					</div>
				</div>
			</div>

			<ModalStake
				token={stakingToken}
				show={modalStakeShow}
				setShow={setModalStakeShow}
				alreadyStaked={stakingPosition.staked_amount}
				scAddress={scAddress}
			/>
			<ModalUnstake
				token={stakingToken}
				show={modalUnstakeShow}
				setShow={setModalUnstakeShow}
				alreadyStaked={stakingPosition.staked_amount}
				scAddress={scAddress}
			/>
		</>
	);
};
