"use client";

import { Group, Text, Button } from "@mantine/core";
import classes from "./header.module.css";

export function Header() {
	return (
		<Group
			component="header"
			justify="space-between"
			align="center"
			px="md"
			bg="gray.0"
			className={classes.header}
		>
			<Text size="lg" c="navy.8" fw={400}>
				[Header Placeholder - Logo]
			</Text>

			<Group gap="xl">
				<Text size="xl" c="navy.8" fw={400} className={classes.navItem}>
					Home
				</Text>
				<Text size="xl" c="navy.8" fw={400} className={classes.navItem}>
					Discover
				</Text>
				<Text size="xl" c="navy.8" fw={400} className={classes.navItem}>
					Groups
				</Text>
				<Text size="xl" c="navy.8" fw={400} className={classes.navItem}>
					Messages
				</Text>
				<Text size="xl" c="navy.8" fw={400} className={classes.navItem}>
					Notifications
				</Text>
			</Group>

			<Button bg="navy.7" c="gray.0" radius="md">
				Sign Out
			</Button>
		</Group>
	);
}
