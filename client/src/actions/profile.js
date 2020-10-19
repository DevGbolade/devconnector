import axios from "axios";
import { setAlert } from "./alert";
import { 
    GET_PROFILE, 
    GET_PROFILES,
    GET_REPOS,
    PROFILE_ERROR, 
    UPDATE_PROFILE, 
    ACCOUNT_DELETED,
    CLEAR_PROFILE
    
} from "../actions/types";

// Get current profile 
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/v1/profile/me");

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Get profiles
export const getProfiles = () => async (dispatch) => {
    dispatch({type: CLEAR_PROFILE });
    try {
      const res = await axios.get("/api/v1/profile");
  
      dispatch({
        type: GET_PROFILES,
        payload: res.data,
      });
    } catch (error) {
      dispatch({
        type: PROFILE_ERROR,
        payload: {
          msg: error.response.statusText,
          status: error.response.status,
        },
      });
    }
  };

  // Get profile by ID
export const getProfileById = userId => async (dispatch) => {
  try {
    const res = await axios.get(`/api/v1/profile/user/${userId}`);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

  // Get Github Repos
  export const getGithubRepos = userName => async (dispatch) => {
    try {
      const res = await axios.get(`/api/v1/profile/github/${userName}`);
  
      dispatch({
        type: GET_REPOS ,
        payload: res.data,
      });
    } catch (error) {
      dispatch({
        type: PROFILE_ERROR,
        payload: {
          msg: error.response.statusText,
          status: error.response.status,
        },
      });
    }
  };

// Create or Update Profile
export const createProfile = (formData, history, edited = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: {
        "Conent-type": "application/json",
      },
    };
    const res = await axios.post("api/v1/profile", formData, config);
    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(
      setAlert(
        edited ? "Updated successfully" : "Created successfully",
        "success"
      )
    );
    if (!edited) {
      history.push("/dashboard");
    }
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      errors.forEach((error) => {
        // console.log(error.msg);
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

//  ADD EXERIENCE
export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Conent-type": "application/json",
      },
    };
    const res = await axios.put("api/v1/profile/experience", formData, config);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });
    dispatch(setAlert("Experience Added", "success"));
    history.push("/dashboard");
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      errors.forEach((error) => {
        // console.log(error.msg);
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

//  ADD EDUCATION
export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Conent-type": "application/json",
      },
    };
    const res = await axios.put("api/v1/profile/education", formData, config);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });
    dispatch(setAlert("Education Added", "success"));
    history.push("/dashboard");
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      errors.forEach((error) => {
        // console.log(error.msg);
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Delete Experience 
export const deleteExperience = id => async (dispatch) => {
    try {
      const res = await axios.delete(`api/v1/profile/experience/${id}`);
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });

      dispatch(setAlert("Experience deleted successfully", "success"));
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          dispatch(setAlert(error.msg, "danger"));
        });
      }
      dispatch({
        type: PROFILE_ERROR,
        payload: {
          msg: error.response.statusText,
          status: error.response.status,
        },
      });
    }
  };
// Delete Education 
export const deleteEducation = id => async (dispatch) => {
    try {
      const res = await axios.delete(`api/v1/profile/education/${id}`);
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });

      dispatch(setAlert("Education deleted successfully", "success"));
    } catch (error) {
      const errors = error.response.data.errors;
      if (errors) {
        errors.forEach((error) => {
          dispatch(setAlert(error.msg, "danger"));
        });
      }
      dispatch({
        type: PROFILE_ERROR,
        payload: {
          msg: error.response.statusText,
          status: error.response.status,
        },
      });
    }
  };

// Delete Account & Profile 
export const deleteAccount = id => async (dispatch) => {
    if (window.confirm('Are you sure you want to delete your account? This CANNOT be undone')) {
        try {
            await axios.delete(`api/v1/profile`);
            dispatch({ type: CLEAR_PROFILE });
            dispatch({ type: ACCOUNT_DELETED});
            dispatch(setAlert("Your account has been permanently deleted"));
          } catch (error) {
            dispatch({
              type: PROFILE_ERROR,
              payload: {
                msg: error.response.statusText,
                status: error.response.status,
              },
            });
          }
    }
    
  };
