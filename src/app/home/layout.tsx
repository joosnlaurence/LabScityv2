import { Box } from "@mantine/core";
import { Header } from "@/components/layout/header";
import classes from "./layout.module.css";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Box className={classes.container} bg="navy.2">
			<Header />
			<Box className={classes.grid}>
				<Box className={classes.leftSidebar}>
					{/* Left sidebar (~15%) - User widget will go here */}
				</Box>
				<Box className={classes.center}>
					{children}
				</Box>
				<Box className={classes.rightSidebar}>
					{/* Right sidebar (~20%) - Trending and User profile will go here */}
				</Box>
			</Box>
		</Box>
	);
}
