import React, { Component } from "react";
import MyButton from "../../util/MyButton";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
// REdux
import { connect } from "react-redux";
import { likeHowl, unlikeHowl } from "../../redux/actions/dataActions";

export class LikeButton extends Component {
  likedHowl = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find((like) => like.howlId === this.props.howlId)
    )
      return true;
    else return false;
  };
  likeHowl = () => {
    this.props.likeHowl(this.props.howlId);
  };
  unlikeHowl = () => {
    this.props.unlikeHowl(this.props.howlId);
  };
  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.likedHowl() ? (
      <MyButton tip="Undo like" onClick={this.unlikeHowl}>
        <FavoriteIcon color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likeHowl}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  howlId: PropTypes.string.isRequired,
  likeHowl: PropTypes.func.isRequired,
  unlikeHowl: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapActionsToProps = {
  likeHowl,
  unlikeHowl,
};

export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
