/* global window,document,QRCode,sessionID,console,CryptoJS,io,ZeroClipboard */
function hideModal() {
	var modal = document.getElementsByClassName("md-show")[0];
	modal.className = modal.className.replace(' md-show', '');
}
function showModal(id) {
	document.getElementById("modal-" + id).className += " md-show";
}

(function () {
	var key, displayedQRCode;

	function generateNewRandom() {
		key = CryptoJS.lib.WordArray.random(32);
		key.toBase64 = function () {
			this.toString(CryptoJS.enc.Base64)
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
		cipherText = cipherText.split('|');
		var iv = CryptoJS.enc.Base64.parse(cipherText[0]);
		var encrypted = CryptoJS.enc.Base64.parse(cipherText[1]);
		var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: encrypted});
		var decrypted = CryptoJS.AES.decrypt(
			cipherParams,
			key,
			{iv: iv});
		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	// Main logic
	function displayCreds(creds) {
		var dataTable = document.getElementById("data"), row, col;
		for (var element in creds) if (creds[element] !== "") {
			row = document.createElement('tr');
			// name
			col = document.createElement("td");
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
				response = response.replace("\n", "");
				var dataJSON = JSON.parse(decrypt(response));
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
})();