import { dAppName } from "config";
import { RouteType } from "types";
import { withPageTitle } from "./components/PageTitle";

import {
	Dashboard,
	Home,
	AdminSettings,
	TokenStakePage,
	Raffle,
} from "./pages";
import { NftStake } from "./components/NftStake";

export const routeNames = {
	home: "/",
	dashboard: "/dashboard",
	nftStake: "/stake/nft",
	tokenStake: "/stake/token",
	raffle: "/raffle",
	adminSettings: "/admin-settings",
	unlock: "/unlock",
};

interface RouteWithTitleType extends RouteType {
	title: string;
}

export const routes: RouteWithTitleType[] = [
	{
		path: routeNames.home,
		title: "Home",
		component: Home,
	},
	{
		path: routeNames.dashboard,
		title: "Dashboard",
		component: Dashboard,
		authenticatedRoute: true,
	},
	{
		path: routeNames.nftStake,
		title: "Stake NFT",
		component: NftStake,
		authenticatedRoute: true,
	},
	{
		path: routeNames.tokenStake,
		title: "Stake Token",
		component: TokenStakePage,
		authenticatedRoute: true,
	},
	{
		path: routeNames.raffle,
		title: "Raffle",
		component: Raffle,
		authenticatedRoute: true,
	},
	{
		path: routeNames.adminSettings,
		title: "Admin Settings",
		component: AdminSettings,
		authenticatedRoute: true,
	},
];

export const mappedRoutes = routes.map((route) => {
	const title = route.title
		? `${route.title} • MultiversX ${dAppName}`
		: `MultiversX ${dAppName}`;

	const requiresAuth = Boolean(route.authenticatedRoute);
	const wrappedComponent = withPageTitle(title, route.component);

	return {
		path: route.path,
		component: wrappedComponent,
		authenticatedRoute: requiresAuth,
	};
});
