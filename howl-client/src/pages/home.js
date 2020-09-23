import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

import Howl from "../components/howl/Howl";
import Profile from "../components/profile/Profile";
import HowlSkeleton from "../util/HowlSkeleton";

import { connect } from "react-redux";
import { getHowls } from "../redux/actions/dataActions";

class home extends Component {
  componentDidMount() {
    this.props.getHowls();
  }
  render() {
    const { howls, loading } = this.props.data;
    let recentHowlsMarkup = !loading ? (
      howls.map((howl) => {
        return <Howl key={howl.howlId} howl={howl} />;
      })
    ) : (
      <HowlSkeleton />
    );
    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {recentHowlsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  getHowls: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  data: state.data,
});

export default connect(mapStateToProps, { getHowls })(home);
