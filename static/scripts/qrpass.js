/* global window,document,QRCode,sessionID,ActiveXObject,XMLHttpRequest,alert,console,setTimeout,Uint32Array,CryptoJS,io */
var datatable = document.getElementById("data");
var key, iv;
// Helpers
function getRandomString(size) {
	var text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < size; i++ ) text += possible.charAt(Math.random() * possible.length);
	return text;
}
function arrayToString(array) {
	var i, result = "";
	for (i = 0; i < array.length; i += 1)
		result += array[i].toString(16);
	return result;
}
function makeQRCode(clientID) {
	if(clientID)
		makeQRCode.clientID = clientID;
	var salt = CryptoJS.lib.WordArray.random(32);
	iv = CryptoJS.lib.WordArray.random(16);
	var passPhrase = getRandomString(16);
	if(makeQRCode.code) {
		makeQRCode.code.clear();
	}	else {
		makeQRCode.code = new QRCode("qrcode", {
			width: 256,
			height: 256,
			correctLevel : QRCode.CorrectLevel.M
		});
	}
	makeQRCode.code.makeCode(makeQRCode.clientID + "\n" + salt + "\n" + iv + "\n" + passPhrase);
	key = CryptoJS.PBKDF2(
		passPhrase,
		salt,
		{ keySize: 8, iterations: 1000 });
}
function decrypt(cipherText) {
	var cipherParams = CryptoJS.lib.CipherParams.create({
		ciphertext: CryptoJS.enc.Base64.parse(cipherText)});
	var decrypted = CryptoJS.AES.decrypt(
		cipherParams,
		key,
		{ iv: iv });
	return decrypted.toString(CryptoJS.enc.Utf8);
}

function displayEntry(entry) {
	while (datatable.hasChildNodes()) {
		var child = datatable.firstChild();
		while (child.hasChildNodes())
			child.removeChild(child.firstChild);
		datatable.removeChild(child);
	}
	var line,name,value;
	if ("userName" in entry) {
		line = document.createElement("tr");
		datatable.appendChild(line);
		name = document.createElement("td");
		line.appendChild(name);
		name.innerHTML = "Username";
		value = document.createElement("td");
		line.appendChild(value);
		value.innerHTML = entry.userName;
	}
	if ("password" in entry) {
		line = document.createElement("tr");
		datatable.appendChild(line);
		name = document.createElement("td");
		line.appendChild(name);
		name.innerHTML = "Password";
		value = document.createElement("td");
		line.appendChild(value);
		value.innerHTML = entry.password;
	}
	document.getElementById("ch-info").classList.add("ch-info-rotated");
}
function processResponse(response) {
	if (response !== "") {
		try {
			response = response.replace("\n","");
			var dataJSON = JSON.parse(decrypt(response));
			if ("credentials" in dataJSON) {
				displayEntry(dataJSON.credentials);
			}
		} catch(e) {
			console.warn(e.message);
		}
	}
}
function startConn() {
	var socket = io.connect(window.location.host);
	socket.on('qrpass_id', makeQRCode);
	socket.on('qrpass_data', processResponse);
}
window.onload = function() {
	startConn();
};
