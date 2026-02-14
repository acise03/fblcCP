import { Redirect } from "expo-router";

// Default entry point redirects into login
export default function Index() {
	return <Redirect href="/login" />;
}
