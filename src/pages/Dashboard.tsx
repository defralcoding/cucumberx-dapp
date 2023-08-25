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
				const _earningPerDay = new BigNumber(0)
					.plus(
						new BigNumber(stakingNft.tokensPerDay!).multipliedBy(
							stakingNft.userStaking!.length
						)
					)
					.plus(
						new BigNumber(stakingToken.apr!)
							.multipliedBy(
								stakingToken.userStaking!.staked_amount
							)
							.dividedBy(100)
							.dividedBy(365)
					)
					.plus(
						new BigNumber(stakingTokenLocked.apr!)
							.multipliedBy(
								stakingTokenLocked.userStaking!.reduce(
									(acc, { staked_amount }) =>
										acc.plus(staked_amount),
									new BigNumber(0)
								)
							)
							.dividedBy(100)
							.dividedBy(365)
					);

				setEarningPerDay(_earningPerDay.decimalPlaces(0));
			}
		});
	}, []);

	return (
		<div className="container mt-3">
			<div className="text-center display-3 mb-4">
				<p>Welcome in the Glory Hole!</p>
				{earningPerDay !== undefined && (
					<p>
						You earn&nbsp;
						<FormatAmount
							value={earningPerDay.toString(10)}
							token={rewardToken.symbol}
							digits={2}
							decimals={rewardToken.decimals}
						/>
						&nbsp;per day
					</p>
				)}
				{tokenPrice !== undefined && (
					<p>
						1 $CUMB = $
						{tokenPrice.toSignificantDigits(4).toString()}
					</p>
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
				/>
			</div>
		</div>
	);
};
