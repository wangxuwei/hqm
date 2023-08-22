import { NiceModalHandler, antdModal as wrapModal } from '@ebay/nice-modal-react';


export function antdModal(modal: NiceModalHandler) {
	const m = wrapModal(modal) as any;
	m.open = m.visible;
	delete m.visible;
	return m as {
		open: boolean;
		onCancel: () => void;
		onOk: () => void;
		afterClose: () => void;
	}
}