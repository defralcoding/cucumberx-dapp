import React, { useEffect, useState } from "react";
import { request } from "graphql-request";
import { useGetAccount, useGetActiveTransactionsStatus } from "hooks";
import { NftStake } from "components/NftStake";
import { TokenStake } from "components/TokenStake";
import { TokenLockedStake } from "components/TokenLockedStake";
import { SectionSelector } from "components/SectionSelector";
import { stakingToken, rewardToken, graphqlUrl } from "config";
import {
	Query,
	gqlCucumberx,
	gqlStakingToken,
	gqlStakingTokenLocked,
} from "types";
import Decimal from "decimal.js";

enum Section {
	tokenStake = "Unlocked",
	lockedTokenStake = "Locked",
}

export const Raffle = () => {
	const { address } = useGetAccount();
	const { success, fail } = useGetActiveTransactionsStatus();

	const [section, setSection] = useState<Section>(Section.tokenStake);

	const [stakingTokenData, setStakingTokenData] = useState<
		gqlStakingToken | undefined
	>();
	const [stakingTokenLockedData, setStakingTokenLockedData] = useState<
		gqlStakingTokenLocked | undefined
	>();
	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();

	const fetchData = async () => {
		request<Query>(
			graphqlUrl,
			`
            query($user: String) {
                cucumberx {
                    tokenPrice
                    stakingToken {
                        _address
                        rewardsForUser(address: $user)
                        stakingToken
                        rewardToken
                        apr
                        userStaking(user: $user) {
                            staked_amount
                            staked_epoch
                            last_claimed_timestamp
                        }
                    }
                    stakingTokenLocked {
                        _address
                        rewardsForUser(address: $user)
                        stakingToken
                        rewardToken
                        apr
                        lockDays
                        userStaking(user: $user) {
                            id
                            staked_amount
                            staked_epoch
                            unlock_timestamp
                            last_claimed_timestamp
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
			setStakingTokenData(cucumberx.stakingToken);
			setStakingTokenLockedData(cucumberx.stakingTokenLocked);
			if (cucumberx.tokenPrice)
				setTokenPrice(new Decimal(cucumberx.tokenPrice));
		});
	};

	useEffect(() => {
		fetchData();
		const interval = setInterval(function () {
			fetchData();
		}, 6000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		if (success || fail) {
			fetchData();
		}
	}, [success, fail]);

	return (
		<div className="container mt-3">
			<SectionSelector
				section={section}
				sections={[...Object.values(Section)]}
				setSection={setSection}
				className="w-100"
			/>
			{section === Section.tokenStake && (
				<TokenStake
					data={stakingTokenData}
					tokenPrice={tokenPrice}
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
			{section === Section.lockedTokenStake && (
				<TokenLockedStake
					data={stakingTokenLockedData}
					tokenPrice={tokenPrice}
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
		</div>
	);
};
