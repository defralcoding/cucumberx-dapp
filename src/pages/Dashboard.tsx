import React, { useEffect, useState } from "react";
import { NftStake } from "components/NftStake";
import { TokenStake } from "components/TokenStake";
import { TokenLockedStake } from "components/TokenLockedStake";
import { SectionSelector } from "components/SectionSelector";
import { stakingToken, rewardToken } from "config";

enum Section {
	nftStake = "Stake NFT",
	tokenStake = "Stake Token",
	lockedTokenStake = "Locked Token Stake",
}

export const Dashboard = () => {
	const [section, setSection] = useState<Section>(Section.nftStake);

	return (
		<div className="container mt-3">
			<SectionSelector
				section={section}
				sections={[...Object.values(Section)]}
				setSection={setSection}
				className="mr-5 w-100"
			/>

			{section === Section.nftStake && (
				<NftStake
					scAddress="erd1qqqqqqqqqqqqqpgq7ymsl3yn70z9863l02g6j8ttlewyungc4jws5cas66"
					collectionIdentifier="GIANT-1ed993"
					rewardToken={rewardToken}
				/>
			)}
			{section === Section.tokenStake && (
				<TokenStake
					scAddress="erd1qqqqqqqqqqqqqpgqnx25cpxhurers4enwqtg3jgcfy8qcrnt4jws5g278q"
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
			{section === Section.lockedTokenStake && (
				<TokenLockedStake
					scAddress="erd1qqqqqqqqqqqqqpgqxgcasq6e6lgnugenj6lmdwudp9ymgwcs4jwsu9hn6c"
					stakingToken={stakingToken}
					rewardToken={rewardToken}
				/>
			)}
		</div>
	);
};
