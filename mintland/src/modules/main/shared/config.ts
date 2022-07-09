export const serverURL = process.env.NODE_ENV === "production"
    ? "https://my-nft-server.herokuapp.com"
    : "http://127.0.0.1:4000";


export const authToken = process.env.AUTH_TOKEN
