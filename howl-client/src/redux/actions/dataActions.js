import {
  SET_HOWLS,
  LOADING_DATA,
  LIKE_HOWL,
  UNLIKE_HOWL,
  DELETE_HOWL,
  SET_ERRORS,
  POST_HOWL,
  CLEAR_ERRORS,
  LOADING_UI,
  SET_HOWL,
  STOP_LOADING_UI,
  SUBMIT_COMMENT,
} from "../types";
import axios from "axios";

// Get all howls
export const getHowls = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  axios
    .get("/howls")
    .then((res) => {
      dispatch({
        type: SET_HOWLS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: SET_HOWLS,
        payload: [],
      });
    });
};
export const getHowl = (howlId) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`/howl/${howlId}`)
    .then((res) => {
      dispatch({
        type: SET_HOWL,
        payload: res.data,
      });
      dispatch({ type: STOP_LOADING_UI });
    })
    .catch((err) => console.log(err));
};
// Post a howl
export const postHowl = (newHowl) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .post("/howl", newHowl)
    .then((res) => {
      dispatch({
        type: POST_HOWL,
        payload: res.data,
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    });
};
// Like a howl
export const likeHowl = (howlId) => (dispatch) => {
  axios
    .get(`/howl/${howlId}/like`)
    .then((res) => {
      dispatch({
        type: LIKE_HOWL,
        payload: res.data,
      });
    })
    .catch((err) => console.log(err));
};
// Unlike a howl
export const unlikeHowl = (howlId) => (dispatch) => {
  axios
    .get(`/howl/${howlId}/unlike`)
    .then((res) => {
      dispatch({
        type: UNLIKE_HOWL,
        payload: res.data,
      });
    })
    .catch((err) => console.log(err));
};
// Submit a comment
export const submitComment = (howlId, commentData) => (dispatch) => {
  axios
    .post(`/howl/${howlId}/comment`, commentData)
    .then((res) => {
      dispatch({
        type: SUBMIT_COMMENT,
        payload: res.data,
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
    });
};
export const deleteHowl = (howlId) => (dispatch) => {
  axios
    .delete(`/howl/${howlId}`)
    .then(() => {
      dispatch({ type: DELETE_HOWL, payload: howlId });
    })
    .catch((err) => console.log(err));
};

export const getUserData = (userHandle) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  axios
    .get(`/user/${userHandle}`)
    .then((res) => {
      dispatch({
        type: SET_HOWLS,
        payload: res.data.howls,
      });
    })
    .catch(() => {
      dispatch({
        type: SET_HOWLS,
        payload: null,
      });
    });
};

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
