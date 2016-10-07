import AES from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import UTF8 from 'crypto-js/enc-utf8';

function decrypt(cipherText, key) {
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

function processData(data, key, callback) {
	if (data === "") return;
	try {
		var decrypted = decrypt(data, key);
		var dataJSON = JSON.parse(decrypted);
		if ("credentials" in dataJSON) {
			callback(dataJSON.credentials);
		}
	} catch (e) {
		console.warn(e.message);
	}

}

export default processData;