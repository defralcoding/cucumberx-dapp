import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthRedirectWrapper } from "components";
import { dAppName } from "config";
import { routeNames } from "routes";
import { MyApiNetworkProvider } from "helpers/MyApiNetworkProvider";
import { useGetNetworkConfig } from "hooks";
import CountUp from "react-countup";

const HomePage = () => {
	const {
		network: { apiAddress },
	} = useGetNetworkConfig();
	const apiNetworkProvider = new MyApiNetworkProvider(apiAddress);

	const [stakedCount, setStakedCount] = useState(0);

	useEffect(() => {
		apiNetworkProvider
			.getAccountNftsCountFromCollection(
				"erd1qqqqqqqqqqqqqpgqpt97ps7w69ng3ynxpn3lq9fc0wj5u9hddn3qp4lqzu",
				"CUMBX-762eec"
			)
			.then((count) => {
				setStakedCount(count);
			});
	}, []);

	return (
		<div className="d-flex flex-fill align-items-center container">
			<div className="row w-100">
				<div className="col-12 col-md-8 col-lg-5 mx-auto">
					<div className="card shadow-sm rounded p-4 border-0">
						<div className="card-body text-center">
							<h2 className="mb-3">CUCUMBERX {dAppName}</h2>

							<p className="mb-3">
								Login using your MultiversX wallet.
							</p>

							<Link
								to={routeNames.unlock}
								className="btn btn-primary mt-3"
							>
								Login
							</Link>
						</div>
					</div>
					<div className="mt-4 text-center display-4">
						<p>STAKED CUCUMBERS</p>
						<p>
							<CountUp
								end={stakedCount}
								decimals={0}
								duration={2}
								useEasing={true}
							/>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export const Home = () => (
	<AuthRedirectWrapper>
		<HomePage />
	</AuthRedirectWrapper>
);
