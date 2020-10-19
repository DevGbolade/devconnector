import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../layout/Spinner";
import PostItem from "../posts/PostItem";
import { getPost } from "../../actions/post";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const Post = ({ getPost, post: { post, loading }, match }) => {
  useEffect(() => {
    getPost(match.params.id);
  }, [getPost]);
  console.log(post);

  return loading && post === null ? (
    <Spinner />
  ) : (
    <Fragment>
      <Link to="/posts" className="btn">
        Back to posts
      </Link>
      
      {
        post && (
          <PostItem showActions={false} post={post} />
        )
      }
      {
        post && post._id && (
          <CommentForm postId={post._id} />
        )
      }
      {
        post && post.comments && (
          <div className="comments">
          {post.comments.map((comment) => (
            <CommentItem key={comment._id} postId={post._id} comment={comment} />
          ))}
        </div>
        )
      }
      

    </Fragment>
  );
};

Post.propTypes = {
  getPost: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  post: state.post,
});
export default connect(mapStateToProps, { getPost })(Post);