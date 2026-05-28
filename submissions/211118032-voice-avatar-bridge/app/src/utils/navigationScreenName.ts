import type { NavigationState } from '@react-navigation/native';

/** Derive a human-readable screen name from navigation state for AuditWidget meta. */
export function getActiveRouteName(state: NavigationState | undefined): string {
  if (!state) return 'Unknown';

  const route = state.routes[state.index];
  if (!route) return 'Unknown';

  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }

  if (route.name === 'MainTabs' && route.state) {
    const tabState = route.state as NavigationState;
    const tabRoute = tabState.routes[tabState.index];
    return tabRoute?.name ?? 'MainTabs';
  }

  return route.name;
}
