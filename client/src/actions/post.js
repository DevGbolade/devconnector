import axios from 'axios'
import { setAlert } from './alert'
import { 
    DELETE_POST,
     GET_POSTS,
     POST_ERROR,
     UPDATE_LIKES,
     ADD_POST,
     GET_POST, 
     ADD_COMMENT,
     DELETE_COMMENT
    } from './types';

// GET POSTS
export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/v1/posts');
        dispatch({
            type: GET_POSTS,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
}

// Add like
export const addLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/v1/posts/like/${postId}`);
        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};
// Remove like
export const removeLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/v1/posts/unlike/${postId}`);
        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};

// Delete post
export const deletePost = postId => async dispatch => {
    try {
         await axios.delete(`/api/v1/posts/${postId}`);
        dispatch({
            type: DELETE_POST,
            payload: postId 
        });
        dispatch(setAlert('Post Removed', 'success'))
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};

// Add post
export const addPost = FormData => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.post(`/api/v1/posts`, FormData, config);
        dispatch({
            type: ADD_POST,
            payload: res.data
        });
        dispatch(setAlert('Post created successfully', 'success'))
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};

// GET POST
export const getPost = postId => async dispatch => {
    try {
        const res = await axios.get(`/api/v1/posts/${postId}`);
        dispatch({
            type: GET_POST,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
}

// Add COMMENT
export const addComment = (postId, FormData) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.post(`/api/v1/posts/comment/${postId}`, FormData, config);
        dispatch({
            type: ADD_COMMENT,
            payload: res.data
        });
        dispatch(setAlert('Comment added', 'success'))
    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};
// Delete COMMENT
export const deleteComment = (postId, commentId) => async dispatch => {
    
    try {
         await axios.delete(`/api/v1/posts/comment/${postId}/${commentId}`);
        dispatch({
            type: DELETE_COMMENT,
            payload: commentId
        });
        dispatch(setAlert('Comment deleted', 'success'))
    } catch (error) {
        console.log(error);
        dispatch({
            type: POST_ERROR,
            payload: {
              msg: error.response.statusText,
              status: error.response.status,
            },
          });
    }
};