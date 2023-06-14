import React from "react";
import {
	faChartSimple,
	faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar as BsNavbar, NavItem, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { dAppName, adminAddresses } from "config";
import { logout } from "helpers";
import { useGetIsLoggedIn, useGetAccount } from "hooks";
import { routeNames } from "routes";
import CucumberXLogo from "../../assets/img/logo.png";

export const Navbar = () => {
	const isLoggedIn = useGetIsLoggedIn();
	const { address } = useGetAccount();

	const handleLogout = () => {
		logout(`${window.location.origin}/unlock`);
	};

	return (
		<BsNavbar className="px-4 py-3">
			<div className="container-fluid">
				<Link
					className="d-flex align-items-center navbar-brand mr-0"
					to={isLoggedIn ? routeNames.dashboard : routeNames.home}
				>
					<img src={CucumberXLogo} className="cucumberx-logo" />
					<span className="dapp-name text-muted">{dAppName}</span>
				</Link>

				<Nav className="ml-auto">
					{isLoggedIn && (
						<>
							{adminAddresses.includes(address) && (
								<NavItem>
									<Link
										to={routeNames.adminSettings}
										className="btn btn-primary mr-2"
									>
										Admin Settings
									</Link>
								</NavItem>
							)}
							{/*
							<NavItem>
								<Link to={routeNames.home} className="nav-link">
									<FontAwesomeIcon
										icon={faChartSimple}
										className="text-muted"
									/>
								</Link>
							</NavItem>
							*/}
							<NavItem>
								<a
									href="https://docs.cucumberx.com"
									className="btn btn-primary mr-2"
								>
									Whitepaper
								</a>
							</NavItem>
							<NavItem>
								<a
									href="https://cucumberx.com/free-cucumberx-really/"
									className="btn btn-primary mr-2"
								>
									Free NFT
								</a>
							</NavItem>
							<NavItem>
								<a
									href="https://cucumberx.com"
									className="btn btn-primary mr-2"
								>
									Home
								</a>
							</NavItem>
							<NavItem>
								<button
									className="btn btn-primary"
									onClick={handleLogout}
								>
									Logout
								</button>
							</NavItem>
						</>
					)}
				</Nav>
			</div>
		</BsNavbar>
	);
};
