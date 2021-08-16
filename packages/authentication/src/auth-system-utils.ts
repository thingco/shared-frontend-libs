export function MSG__UNSCOPED_HOOK(hookName: string) {
	return `${hookName} can only be used in a component tree beneath the AuthenticationSystem provider component.`;
}
