import { useState, useSyncExternalStore } from "react";

export const useSyncExternalStoreWithSelector = (
	subscribe,
	getSnapshot,
	_,
	selector,
	isEqual,
) => {
	const getSelectedSnapshot = () => selector(getSnapshot());

	const selected = useSyncExternalStore(subscribe, getSelectedSnapshot);

	const [state, setState] = useState(selected);
	if (!isEqual?.(state, selected)) {
		setState(selected);
	}

	return state;
};

export { useSyncExternalStoreWithSelector as withSelector };

export default useSyncExternalStoreWithSelector;
