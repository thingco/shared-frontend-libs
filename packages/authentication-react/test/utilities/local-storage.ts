export function localStorageMock() {
	let store: { [k: string]: string } = {};

	return {
		get length() {
			return Object.keys(store).length;
		},

		clear() {
			store = {};
		},

		getItem(key: string) {
			return store[key] || null;
		},

		key(idx: number) {
			const values = Object.values(store);
			return values[idx];
		},

		setItem(key: string, value: string) {
			store[key] = String(value);
		},

		removeItem(key: string) {
			delete store[key];
		},
	};
}
