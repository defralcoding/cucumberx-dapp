import * as React from "react";
import { Link } from "react-router-dom";
import { AuthRedirectWrapper } from "components";
import { dAppName } from "config";
import { routeNames } from "routes";
import CountUp from "react-countup";

const HomePage = () => {
	return (
		<div className="d-flex flex-fill align-items-center container">
			<div className="row w-100">
				<div className="col-12 col-md-8 col-lg-5 mx-auto">
					<div className="card shadow-sm rounded p-4 border-0">
						<div className="card-body text-center">
							<h2 className="mb-3">CucumberX {dAppName}</h2>

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
								end={100}
								decimals={0}
								duration={3}
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
