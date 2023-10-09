import React, { useEffect, useState } from "react";
import { request } from "graphql-request";
import { useGetNetworkConfig, useGetAccount } from "hooks";
import { FormatAmount } from "@multiversx/sdk-dapp/UI";
import { DashboardLink } from "components/DashboardLink";
import Decimal from "decimal.js";
import { rewardToken, graphqlUrl } from "config";
import { Query, gqlCucumberx } from "types";
import { routeNames } from "routes";
import { BigNumber } from "bignumber.js";

export const Dashboard = () => {
	const { address } = useGetAccount();

	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();
	const [earningPerDay, setEarningPerDay] = useState<BigNumber | undefined>();
	const [nStakedNfts, setNStakedNfts] = useState<BigNumber | undefined>();
	const [stakedTokens, setStakedTokens] = useState<BigNumber | undefined>();

	useEffect(() => {
		request<Query>(
			graphqlUrl,
			`
            query($user: String) {
                cucumberx {
                    tokenPrice
                    stakingNft {
                        tokensPerDay
                        userStaking(user: $user) {
                            nonce
                        }
                    }
                    stakingToken {
                        apr
                        userStaking(user: $user) {
                            staked_amount
                        }
                    }
                    stakingTokenLocked {
                        apr
                        userStaking(user: $user) {
                            staked_amount
                        }
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

			if (tokenPrice) {
				setTokenPrice(new Decimal(tokenPrice));
			}
			if (stakingNft && stakingToken && stakingTokenLocked) {
				const nStakedNfts = stakingNft.userStaking!.length;
				const stakedAmount = stakingToken.userStaking!.staked_amount;
				const stakedLockedAmount =
					stakingTokenLocked.userStaking!.reduce(
						(acc, { staked_amount }) => acc.plus(staked_amount),
						new BigNumber(0)
					);

				const _earningPerDay = new BigNumber(0)
					.plus(
						new BigNumber(stakingNft.tokensPerDay!).multipliedBy(
							nStakedNfts
						)
					)
					.plus(
						new BigNumber(stakingToken.apr!)
							.multipliedBy(stakedAmount)
							.dividedBy(100)
							.dividedBy(365)
					)
					.plus(
						new BigNumber(stakingTokenLocked.apr!)
							.multipliedBy(stakedLockedAmount)
							.dividedBy(100)
							.dividedBy(365)
					);

				setEarningPerDay(_earningPerDay.decimalPlaces(0));
				setNStakedNfts(new BigNumber(nStakedNfts));
				setStakedTokens(
					new BigNumber(stakedAmount).plus(stakedLockedAmount)
				);
			}
		});
	}, []);

	return (
		<div className="container mt-3">
			<div className="text-center mb-4">
				<h1>Welcome in the Glory Hole!</h1>
				{earningPerDay !== undefined && (
					<h3>
						You earn&nbsp;
						<FormatAmount
							value={earningPerDay.toString(10)}
							token={rewardToken.symbol}
							digits={2}
							decimals={rewardToken.decimals}
						/>
						&nbsp;per day
					</h3>
				)}
				{nStakedNfts !== undefined && nStakedNfts.gt(0) && (
					<h3>NFTs staked: {nStakedNfts.toString(10)}</h3>
				)}
				{stakedTokens !== undefined && stakedTokens.gt(0) && (
					<h3>
						{rewardToken.symbol} staked:&nbsp;
						<FormatAmount
							value={stakedTokens.toString(10)}
							token={""}
							digits={2}
							decimals={rewardToken.decimals}
						/>
					</h3>
				)}

				{tokenPrice !== undefined && (
					<h3>
						1 $CUMB = $
						{tokenPrice.toSignificantDigits(4).toString()}
					</h3>
				)}
			</div>

			<div className="row justify-content-evenly">
				<DashboardLink
					title="NFT Staking"
					description="Insert your NFTs in the Glory Hole and earn $CUMB"
					route={routeNames.nftStake}
				/>
				<DashboardLink
					title="Token Staking"
					description="Want to make a Cucumber juice? Leave your $CUMB here!"
					route={routeNames.tokenStake}
				/>
				<DashboardLink
					title="Raffle"
					description="Use your $CUMB to win exciting prizes!"
					route={routeNames.raffle}
				/>
			</div>
		</div>
	);
};
