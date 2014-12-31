/* global window,document,QRCode,sessionID,ActiveXObject,XMLHttpRequest,alert,console,setTimeout,Uint32Array,CryptoJS */
var qrcodediv = document.getElementById("qrcode");
var datatable = document.getElementById("data");
var qrcode = new QRCode("qrcode");
var salt, iv, key, passPhrase, clientID;

// Main logic
function getRandomString(size) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < size; i++ )
		text += possible.charAt(Math.random() * possible.length);

	return text;
}

function arrayToString(array) {
	var i;
	var result = "";
	for (i = 0; i < array.length; i += 1) {
		result += array[i].toString(16);
	}
	return result;
}

function makeQRCode() {
	qrcode.makeCode(clientID + "\n" + salt + "\n" + iv + "\n" + passPhrase);
	qrcodediv.style.display = "block";
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
		name.innerHTML = "login";
		value = document.createElement("td");
		line.appendChild(value);
		value.innerHTML = entry.userName;
	}

	if ("password" in entry) {
		line = document.createElement("tr");
		datatable.appendChild(line);
		name = document.createElement("td");
		line.appendChild(name);
		name.innerHTML = "password";
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
		}
		catch(e) {
			console.warn(e.message);
		}
	}
}

function startConn() {
	var socket = io.connect(window.location.host);
	socket.on('qrpass_id', function (data) {
		clientID = data;
		makeQRCode();
	});
	socket.on('qrpass_id', function (data) {
		clientID = data;
		makeQRCode();
	});
	socket.on('qrpass_data', function (data) {
		processResponse(data);
	});
}

function start() {
	"use strict";
	// params for encryption
	salt = CryptoJS.lib.WordArray.random(32);
	iv = CryptoJS.lib.WordArray.random(16);
	passPhrase = getRandomString(16);
	key = CryptoJS.PBKDF2(
		passPhrase,
		salt,
		{ keySize: 8, iterations: 1000 });

	startConn();
}

start();
