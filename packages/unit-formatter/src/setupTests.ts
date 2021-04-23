// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

const localStorageMock: Storage = {
	removeItem: jest.fn(),
	getItem: jest.fn(),
	setItem: jest.fn(),
	clear: jest.fn(),
	length: 0,
	key: jest.fn(),
};

globalThis.localStorage = localStorageMock;