const initialState = {
  announcement: "",
  players: {},
  roundEndTime: 0,
  state: null,
  currentTime: null
};

const room = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ROOM":
      return {
        ...state,
        ...action.value
      };

    case "SET_STATE":
      return {
        ...state,
        state: action.value
      };

    case "ADD_ANNOUNCEMENT":
      return {
        ...state,
        announcement: action.value
      };

    default:
      return state;
  }
};

export default room;
