export default function(auth) {
    return async (url, method) => {
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: 'Bearer ' + (await auth.getAccessToken())
                },
                method
            });
            return response.json();
        } catch (err) {
            console.error(err);
        }
    };
}
