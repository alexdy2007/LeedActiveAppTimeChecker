const BASE_URL = 'activeleeds.gladstonego.cloud'
const ANNON_TOKEN_URL = 'https://activeleeds.gladstonego.cloud/validate/tenant/anonymous'



class Decryptor {
    generateKey(e) {
        if (e.length > 32) {
            return e.slice(0, 32);
        } else {
            return this.generateKey(e + e);
        }
    }

    async decryptToken(e) {
        const n = this.generateKey(BASE_URL);
        const i = Uint8Array.from(atob(e), c => c.charCodeAt(0));
        const c = i.slice(0, 16);
        const l = i.slice(16);
        const d = new TextEncoder().encode(n);

        const key = await crypto.subtle.importKey(
            'raw',
            d,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-CBC', iv: c },
                key,
                l
            );

            const result = JSON.parse(new TextDecoder().decode(decrypted));
            return result;
        } catch (ex) {
            console.error(ex);
            return null;
        }
    }
}

export const getAnonToken = async () => {
    const res = await fetch(ANNON_TOKEN_URL);
    if (!res.ok) {
        throw new Error(`Leeds Active sign-in failed (HTTP ${res.status}). The site may be blocking requests right now - try again later.`);
    }
    return res.text();
};

export const generateAuthToken = async () => {
    const annon_token = (await getAnonToken()).trim();
    const decryptor = new Decryptor();

    let token_dict;
    try {
        token_dict = await decryptor.decryptToken(annon_token);
    } catch (e) {
        throw new Error('Leeds Active returned an unexpected sign-in response (could not decode the token).');
    }
    if (!token_dict || !token_dict.Token) {
        throw new Error('Leeds Active sign-in response did not contain a token.');
    }
    return token_dict.Token;
};
