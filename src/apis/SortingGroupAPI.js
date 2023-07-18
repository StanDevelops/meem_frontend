import axios from "axios";

const BASE_URL = "http://localhost:8080/api/groups";
const SortingGroupAPI = {
    getGroups: () => axios.get(`${BASE_URL}`),
    // getSortingGroupById: (groupId) => axios.get(`${BASE_URL}/id/${groupId}`),
    getSortingGroupByName: (groupName) =>
        axios.get(`${BASE_URL}/name/${groupName}`),
    createGroup: (token, groupName) => axios.post(`${BASE_URL}`, groupName, {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }),
    updateGroup: (token, groupId, groupName) =>
        axios.put(`${BASE_URL}/${groupId}`, groupName, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    deleteGroup: (token, groupId) => axios.delete(`${BASE_URL}/${groupId}`, {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }),
};

export default SortingGroupAPI;
