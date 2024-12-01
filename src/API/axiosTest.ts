import axios from "axios";

const axiosTest = async () => axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    },
});