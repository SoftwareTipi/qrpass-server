/* global ZeroClipboard */
//noinspection JSUnresolvedVariable
import {default as QRCode} from 'qrcode2';
import AES from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import UTF8 from 'crypto-js/enc-utf8';
import TypedArrays from 'crypto-js/lib-typedarrays';
import ZeroClipboard from 'zeroclipboard';
import io from 'socket.io-client';
var key, displayedQRCode;

function generateNewRandom() {
	key = TypedArrays.random(32);
	key.toBase64 = function () {
		this.toString(Base64)
	};
	return key;
}

function makeCopyButton(element) {
	new ZeroClipboard(element);
}

function makeQRCode(clientID) {
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
	generateNewRandom();
	displayedQRCode.makeCode(clientID + "\n" + key.toBase64());
	document.getElementById("qrcode").className =
		document.getElementById("qrcode").className.replace('\ qrcode-hide', '');
}

function decrypt(cipherText) {
	cipherText = cipherText.replace("\n", "").split('|');
	var iv = Base64.parse(cipherText[0]);
	var encrypted = Base64.parse(cipherText[1]);
	var cipherParams = CipherParams.create({ciphertext: encrypted});
	var decrypted = AES.decrypt(
		cipherParams,
		key,
		{iv: iv});
	return decrypted.toString(UTF8);
}

// Main logic
function displayCreds(creds) {
	var dataTable = document.getElementById("data");
	for (var element in creds) if (creds[element] !== "") {
		var row = document.createElement('tr');
		// name
		var col = document.createElement("td");
		col.innerHTML = element + ':';
		row.appendChild(col);
		// copy button
		col = document.createElement("td");
		var button = document.createElement("button");
		button.innerHTML = 'COPY';
		button.setAttribute('data-clipboard-text', creds[element]);
		makeCopyButton(button);
		col.appendChild(button);
		row.appendChild(col);
		dataTable.appendChild(row);
	}
	showModal(1);
}

function processData(response) {
	if (response !== "") {
		try {
			var decrypted = decrypt(response);
			var dataJSON = JSON.parse(decrypted);
			if ("credentials" in dataJSON) {
				displayCreds(dataJSON.credentials);
			}
		} catch (e) {
			console.warn(e.message);
		}
	}
}

window.onload = function () {
	var socket = io.connect(window.location.host);
	socket.on('qrpass_id', makeQRCode);
	socket.on('qrpass_data', processData);
};