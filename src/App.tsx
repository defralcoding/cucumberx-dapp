import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import {
	AxiosInterceptorContext, // using this is optional
	DappProvider,
	Layout,
} from "components";
import {
	TransactionsToastList,
	NotificationModal,
	SignTransactionsModals,
} from "components";
import {
	apiTimeout,
	walletConnectV2ProjectId,
	sampleAuthenticatedDomains,
} from "config";
import { PageNotFound, Unlock } from "pages";
import { routeNames } from "routes";
import { routes } from "routes";
import { EnvironmentsEnum } from "types";

export const App = () => {
	return (
		<AxiosInterceptorContext.Provider>
			<AxiosInterceptorContext.Interceptor
				authenticatedDomanis={sampleAuthenticatedDomains}
			>
				<Router>
					<DappProvider
						environment={EnvironmentsEnum.mainnet}
						customNetworkConfig={{
							name: "customConfig",
							apiTimeout,
							walletConnectV2ProjectId,
						}}
					>
						<Layout>
							<AxiosInterceptorContext.Listener />
							<TransactionsToastList />
							<NotificationModal />
							<SignTransactionsModals />
							<Routes>
								<Route
									path={routeNames.unlock}
									element={<Unlock />}
								/>
								{routes.map((route, index) => (
									<Route
										path={route.path}
										key={"route-key-" + index}
										element={<route.component />}
									/>
								))}
								<Route path="*" element={<PageNotFound />} />
							</Routes>
						</Layout>
					</DappProvider>
				</Router>
			</AxiosInterceptorContext.Interceptor>
		</AxiosInterceptorContext.Provider>
	);
};
