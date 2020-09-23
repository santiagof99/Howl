import {
  SET_HOWLS,
  LIKE_HOWL,
  UNLIKE_HOWL,
  LOADING_DATA,
  DELETE_HOWL,
  POST_HOWL,
  SET_HOWL,
  SUBMIT_COMMENT,
} from "../types";

const initialState = {
  howls: [],
  howl: {},
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA:
      return {
        ...state,
        loading: true,
      };
    case SET_HOWLS:
      return {
        ...state,
        howls: action.payload,
        loading: false,
      };
    case SET_HOWL:
      return {
        ...state,
        howl: action.payload,
      };
    case LIKE_HOWL:
    case UNLIKE_HOWL:
      let index = state.howls.findIndex(
        (howl) => howl.howlId === action.payload.howlId
      );
      state.howls[index] = action.payload;
      if (state.howl.howlId === action.payload.howlId) {
        state.howl = action.payload;
      }
      return {
        ...state,
      };
    case DELETE_HOWL:
      index = state.howls.findIndex((howl) => howl.howlId === action.payload);
      state.howls.splice(index, 1);
      return {
        ...state,
      };
    case POST_HOWL:
      return {
        ...state,
        howls: [action.payload, ...state.howls],
      };
    case SUBMIT_COMMENT:
      return {
        ...state,
        howl: {
          ...state.howl,
          comments: [action.payload, ...state.howl.comments],
        },
      };
    default:
      return state;
  }
}
