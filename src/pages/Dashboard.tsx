import React, { useEffect, useState } from "react";
import { useGetNetworkConfig } from "hooks";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";
import { DashboardLink } from "components/DashboardLink";
import Decimal from "decimal.js";
import { rewardToken } from "config";
import { routeNames } from "routes";

export const Dashboard = () => {
	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);

	const [tokenPrice, setTokenPrice] = useState<Decimal | undefined>();

	useEffect(() => {
		apiNetworkProvider
			.getTokenPrice(rewardToken.identifier)
			.then((price) => {
				setTokenPrice(price);
			})
			.catch((err) => {});
	}, []);

	return (
		<div className="container mt-3">
			<div className="text-center display-3 mb-4">
				<p>Welcome in the Glory Hole!</p>
				{tokenPrice !== undefined && (
					<p>
						1 $CUMB = $
						{tokenPrice.toSignificantDigits(4).toString()}
					</p>
				)}
				<p>Your Earned $CUMB: 100</p>
			</div>

			<div className="row justify-content-evenly">
				<DashboardLink
					title="NFT Staking"
					description="Insert your NFTs in the Glory Hole and earn $CUMB"
					route={routeNames.nftStake}
				/>
				<DashboardLink
					title="Token Staking"
					description="Want to make a a Cucumber juice? Leave your $CUMB here!"
					route={routeNames.tokenStake}
				/>
				<DashboardLink
					title="Raffle"
					description="Use your $CUMB to win exciting prizes!"
					route={routeNames.tokenStake}
				/>
			</div>
		</div>
	);
};
