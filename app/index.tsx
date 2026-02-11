import { Redirect } from "expo-router";

// Default entry point redirects into the business tab stack
export default function Index() {
	return <Redirect href="/(business)" />;
}
