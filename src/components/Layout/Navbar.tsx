import React, { useState } from "react";
import {
	faChartSimple,
	faFileSignature,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar as BsNavbar, NavItem, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { dAppName, adminAddresses } from "config";
import { logout, shortenAddress } from "helpers";
import { useGetIsLoggedIn, useGetAccount } from "hooks";
import { routeNames } from "routes";
import { ModalDashboard } from "components/ModalDashboard";
import CucumberXLogo from "../../assets/img/logo.png";

export const Navbar = () => {
	const isLoggedIn = useGetIsLoggedIn();
	const { address, username } = useGetAccount();

	const [showModalAccount, setShowModalAccount] = useState(false);

	const navbarExpand = "md";

	const handleLogout = () => {
		logout(`${window.location.origin}/unlock`);
	};

	return (
		<>
			<BsNavbar expand={navbarExpand} className="px-4 py-3">
				<div className="container-fluid">
					<BsNavbar.Brand>
						<Link
							className="d-flex align-items-center navbar-brand mr-0"
							to={
								isLoggedIn
									? routeNames.dashboard
									: routeNames.home
							}
						>
							<img
								src={CucumberXLogo}
								className="cucumberx-logo"
							/>
							<span className="dapp-name text-muted">
								{dAppName}
							</span>
						</Link>
					</BsNavbar.Brand>

					<BsNavbar.Toggle aria-controls="responsive-navbar-nav" />

					<BsNavbar.Collapse id="responsive-navbar-nav">
						<Nav className="ml-auto">
							<NavItem>
								<a
									href="https://xoxno.com/buy/VegetablArt/cucumberx"
									className={
										"btn btn-primary mb-2 mb-" +
										navbarExpand +
										"-0 mr-0 mr-" +
										navbarExpand +
										"-2 d-block"
									}
									target="_blank"
								>
									Buy Cucumber
								</a>
							</NavItem>
							<NavItem>
								<a
									href="https://docs.cucumberx.com"
									className={
										"btn btn-primary mb-2 mb-" +
										navbarExpand +
										"-0 mr-0 mr-" +
										navbarExpand +
										"-2 d-block"
									}
									target="_blank"
								>
									Whitepaper
								</a>
							</NavItem>
							<NavItem>
								<a
									href="https://cucumberx.com/free-cucumberx-really/"
									className={
										"btn btn-primary mb-2 mb-" +
										navbarExpand +
										"-0 mr-0 mr-" +
										navbarExpand +
										"-2 d-block"
									}
									target="_blank"
								>
									Free NFT
								</a>
							</NavItem>
							<NavItem>
								<a
									href="https://cucumberx.com"
									className={
										"btn btn-primary mb-2 mb-" +
										navbarExpand +
										"-0 mr-0 mr-" +
										navbarExpand +
										"-2 d-block"
									}
									target="_blank"
								>
									Home
								</a>
							</NavItem>
							{isLoggedIn && (
								<>
									{adminAddresses.includes(address) && (
										<NavItem>
											<Link
												to={routeNames.adminSettings}
												className={
													"btn btn-primary mb-2 mb-" +
													navbarExpand +
													"-0 mr-0 mr-" +
													navbarExpand +
													"-2 d-block"
												}
											>
												Admin Settings
											</Link>
										</NavItem>
									)}
								</>
							)}
						</Nav>
					</BsNavbar.Collapse>

					<div className="flex-grow-1-md">
						<NavItem>
							<button
								className="btn btn-primary d-block w-100"
								onClick={() => setShowModalAccount(true)}
							>
								<FontAwesomeIcon
									icon={faUser}
									className={"mr-2"}
								/>

								{username
									? username.replace(".elrond", "")
									: shortenAddress(address)}
							</button>
						</NavItem>
					</div>
				</div>
			</BsNavbar>
			<ModalDashboard
				show={showModalAccount}
				setShow={setShowModalAccount}
			/>
		</>
	);
};
