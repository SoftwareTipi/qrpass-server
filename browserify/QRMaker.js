var displayedQRCode;
import {default as QRCode} from 'qrcode2';
import Base64 from 'crypto-js/enc-base64';

export default function makeQRCode(clientID, key) {
	if (displayedQRCode) {
		displayedQRCode.clear();
	} else {
		displayedQRCode = new QRCode("qrcode", {
			colorDark: '#2e241e',
			colorLight: '#f2f2f2',
			width: 256,
			height: 256,
			correctLevel: QRCode.CorrectLevel.M
		});
	}
	displayedQRCode.makeCode(clientID + "\n" + key.toString(Base64));
	document.getElementById("qrcode").className =
		document.getElementById("qrcode").className.replace('\ qrcode-hide', '');
}