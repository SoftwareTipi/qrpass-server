/* global ZeroClipboard */
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/map';

import TypedArrays from 'crypto-js/lib-typedarrays';
import ZeroClipboard from 'zeroclipboard';
import io from 'socket.io-client';
import processData from './DataProcessor'
import QRMaker from './QRMaker'

function generateSecretKey() {
	return TypedArrays.random(32);
}

function makeCopyButton(element) {
	new ZeroClipboard(element);
}

function displayCreds(creds) {
	var dataTable = document.getElementById("data");
	creds.forEach((value, element) => {
		var row = document.createElement('tr');
		{//name
			var colName = document.createElement("td");
			colName.innerHTML = element + ':';
		}
		row.appendChild(colName);
		{// copy button
			var colBtn = document.createElement("td");
			let button = document.createElement("button");
			button.innerHTML = 'COPY';
			button.setAttribute('data-clipboard-text', value);
			makeCopyButton(button);
			colBtn.appendChild(button);
		}
		row.appendChild(colBtn);
		dataTable.appendChild(row);
	});
	showModal(1);
}

window.onload = function () {
	var socket = io.connect(window.location.host);

	var key;
	socket.on('qrpass_id', clientId => {
		key = generateSecretKey();
		QRMaker(clientId, key);
	});
	socket.on('qrpass_data', data => processData(data, key, displayCreds));
};