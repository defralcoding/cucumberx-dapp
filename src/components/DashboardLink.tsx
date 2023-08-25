import React from "react";
import { Link } from "react-router-dom";

export const DashboardLink = ({
	title,
	description,
	route,
}: {
	title: string;
	description: string;
	route?: string;
}) => {
	return (
		<div className="col-md card card-dashboard text-center">
			<h1 className="mb-4 mt-3">{title}</h1>

			<h4 className="mb-4">{description}</h4>

			{route !== undefined ? (
				<Link
					to={route}
					className={"btn btn-primary btn-lg w-75 mb-3 mx-auto"}
				>
					Enter
				</Link>
			) : (
				<button
					className={"btn btn-primary btn-lg w-75 mb-3 mx-auto"}
					disabled
				>
					Coming soon...
				</button>
			)}
		</div>
	);
};
