export default function(token) {
    return async (url, method) => {
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: 'Bearer ' + token
                },
                method
            });
            return response.json();
        } catch (err) {
            console.error(err);
        }
    };
}
