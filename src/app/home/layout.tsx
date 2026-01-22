import { Box, Grid } from "@mantine/core";
import { Header } from "@/components/layout/header";
import classes from "./layout.module.css";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Box className={classes.container}>
			<Header />
			<Grid gutter={0} className={classes.grid}>
				<Grid.Col span={{ base: 12, sm: 2 }} className={classes.leftSidebar}>
					{/* Left sidebar (~15%) - User widget will go here */}
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 8 }} className={classes.center}>
					{children}
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 2 }} className={classes.rightSidebar}>
					{/* Right sidebar (~20%) - Trending and User profile will go here */}
				</Grid.Col>
			</Grid>
		</Box>
	);
}
