import { Redirect } from 'expo-router';

export default function Index() {
  // Logic to check if user is logged in would go here
  // For now, always redirect to login as requested
  return <Redirect href="/(auth)/login" />;
}
