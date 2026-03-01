/**
 * App Entry Point
 *
 * Immediately redirects the user to the login screen.
 * This is the default route and acts as a launcher.
 */
import { Redirect } from "expo-router";

/** Redirects to /login on app launch. */
export default function Index() {
	return <Redirect href="/login" />;
}
