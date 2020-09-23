import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Howl from "../components/howl/Howl";
import StaticProfile from "../components/profile/StaticProfile";
import Grid from "@material-ui/core/Grid";

import HowlSkeleton from "../util/HowlSkeleton";
import ProfileSkeleton from "../util/ProfileSkeleton";

import { connect } from "react-redux";
import { getUserData } from "../redux/actions/dataActions";

class user extends Component {
  state = {
    profile: null,
    howlIdParam: null,
  };
  componentDidMount() {
    const handle = this.props.match.params.handle;
    const howlId = this.props.match.params.howlId;

    if (howlId) this.setState({ howlIdParam: howlId });

    this.props.getUserData(handle);
    axios
      .get(`/user/${handle}`)
      .then((res) => {
        this.setState({
          profile: res.data.user,
        });
      })
      .catch((err) => console.log(err));
  }
  render() {
    const { howls, loading } = this.props.data;
    const { howlIdParam } = this.state;

    const howlsMarkup = loading ? (
      <HowlSkeleton />
    ) : howls === null ? (
      <p>No howls from this user</p>
    ) : !howlIdParam ? (
      howls.map((howl) => <Howl key={howl.howlId} howl={howl} />)
    ) : (
      howls.map((howl) => {
        if (howl.howlId !== howlIdParam)
          return <Howl key={howl.howlId} howl={howl} />;
        else return <Howl key={howl.howlId} howl={howl} openDialog />;
      })
    );

    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {howlsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          {this.state.profile === null ? (
            <ProfileSkeleton />
          ) : (
            <StaticProfile profile={this.state.profile} />
          )}
        </Grid>
      </Grid>
    );
  }
}

user.propTypes = {
  getUserData: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  data: state.data,
});

export default connect(mapStateToProps, { getUserData })(user);
