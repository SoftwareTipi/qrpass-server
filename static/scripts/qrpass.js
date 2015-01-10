/* global window,document,QRCode,sessionID,console,CryptoJS,io,ZeroClipboard */
var key;
// Helpers
function makeCopyButton(element) {
	var client = new ZeroClipboard(element);
	client.on( "ready", function(readyEvent) {
		client.on( "aftercopy", function(event) {
			event.target.innerHTML = "Coppied!";
		} );
	} );
}
function hideModal() {
	var modal = document.getElementById("modal-1");
	modal.className = modal.className.replace(' md-show','');
}
function makeQRCode(clientID) {
	if (clientID) makeQRCode.clientID = clientID;
	if (makeQRCode.code)
		makeQRCode.code.clear();
	else {
		makeQRCode.code = new QRCode("qrcode", {
			colorDark: '#2e241e',
			colorLight : '#f2f2f2',
			width: 256,
			height: 256,
			correctLevel : QRCode.CorrectLevel.M
		});
	}
	key = CryptoJS.lib.WordArray.random(32);
	makeQRCode.code.makeCode(makeQRCode.clientID + "\n" + key.toString(CryptoJS.enc.Base64));
	document.getElementById("qrcode").className =
		document.getElementById("qrcode").className.replace('\ qrcode-hide','');
}
function decrypt(cipherText) {
	cipherText = cipherText.split('|');
	var iv = CryptoJS.enc.Base64.parse(cipherText[0]);
	var encrypted = CryptoJS.enc.Base64.parse(cipherText[1]);
	var cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encrypted });
	var decrypted = CryptoJS.AES.decrypt(
		cipherParams,
		key,
		{ iv: iv });
	return decrypted.toString(CryptoJS.enc.Utf8);
}
// Main logic
function displayCreds(creds) {
	var element;
	if ("userName" in creds) {
		element = document.getElementById("copy-button-userName");
		element.setAttribute("data-clipboard-text", creds.userName);
		element.style.visibility = "visible";
		makeCopyButton(element);
	}
	if ("password" in creds) {
		element = document.getElementById("copy-button-password");
		element.setAttribute("data-clipboard-text", creds.password);
		element.style.visibility = "visible";
		makeCopyButton(element);
	}
	document.getElementById("modal-1").className += "\ md-show";
}
function processData(response) {
	if (response !== "") {
		try {
			response = response.replace("\n","");
			var dataJSON = JSON.parse(decrypt(response));
			if ("credentials" in dataJSON) {
				displayCreds(dataJSON.credentials);
			}
		} catch(e) {
			console.warn(e.message);
		}
	}
}
function start() {
	var socket = io.connect(window.location.host);
	socket.on('qrpass_id', makeQRCode);
	socket.on('qrpass_data', processData);
}
window.onload = function() {
	start();
};
