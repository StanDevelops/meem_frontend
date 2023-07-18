import axios from "axios";

export const reducer = (activeGroupState, action) => {
  // let id;
  // const getSortingGroupByName = (groupName) => {
  //   if (groupName != "") {
  //     const getSortingGroup = axios.create({
  //       baseURL: "http://localhost:8080/api/groups",
  //     });
  //     getSortingGroup
  //       .get(`/name?groupName=${groupName}`)
  //       .then((response) => {
  //         console.log("retrieved id " + response.data.group.groupId);
  //         return response.data.group.groupId;
  //       })
  //       .catch((err) => console.error(err));
  //   }
  // };

  switch (action.type) {
    case "Top":
      // getSortingGroupByName(action.type);
      return {
        ...activeGroupState,
        activeGroup: "Top",
        // groupId: getSortingGroupByName(action.type),
      };
    case "Hot":
      // getSortingGroupByName(action.type);
      return {
        ...activeGroupState,
        activeGroup: "Hot",
        // groupId: getSortingGroupByName(action.type),
      };
    case "Rising":
      // getSortingGroupByName(action.type);
      return {
        ...activeGroupState,
        activeGroup: "Rising",
        // groupId: getSortingGroupByName(action.type),
      };
    case "Fresh":
      // getSortingGroupByName(action.type);
      // console.log("reducer: groupId " + id.groupId);

      return {
        ...activeGroupState,
        activeGroup: "Fresh",
        // groupId: getSortingGroupByName(action.type),
      };
    default:
      return activeGroupState;
  }
};

export const defaultState = { activeGroup: "Hot" };
