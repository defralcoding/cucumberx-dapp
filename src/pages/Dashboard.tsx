import React, { useEffect, useState } from "react";
import { NftStake } from "components/NftStake";
import { TokenStake } from "components/TokenStake";
import { TokenLockedStake } from "components/TokenLockedStake";
import { SectionSelector } from "components/SectionSelector";
import { stakingToken, rewardToken } from "config";

enum Section {
	nftStake = "Stake NFT",
	tokenStake = "Stake Token",
	lockedTokenStake = "Stake Locked Token",
}

export const Dashboard = () => {
	const [section, setSection] = useState<Section>(Section.nftStake);

	return (
		<div className="container mt-3">
			<SectionSelector
				section={section}
				sections={[...Object.values(Section)]}
				setSection={setSection}
				className="w-100"
			/>

			{section === Section.nftStake && (
				<NftStake
					scAddress="erd1qqqqqqqqqqqqqpgqpt97ps7w69ng3ynxpn3lq9fc0wj5u9hddn3qp4lqzu"
					collectionIdentifier="CUMBX-762eec"
					rewardToken={rewardToken}
				/>
			)}
			{section === Section.tokenStake && (
				<TokenStake
					scAddress="erd1qqqqqqqqqqqqqpgq8rl3293f5cus8u9scmdu796qycjnqgw9dn3qztkevg"
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
			{section === Section.lockedTokenStake && (
				<TokenLockedStake
					scAddress="erd1qqqqqqqqqqqqqpgqk4pp8f5742f2w5nrz0zynnmwe0utp2gcdn3qhgh4xr"
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
		</div>
	);
};
