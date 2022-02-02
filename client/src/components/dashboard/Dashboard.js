import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {getCurrentProfile} from '../../actions/profile';
import Spinner from '../layout/Spinner';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';
import { deleteAccount } from '../../actions/profile';

const Dashboard = ({getCurrentProfile, deleteAccount, auth:{user}, profile: {profile, loading}}) => {
    useEffect(() => {
        getCurrentProfile();
    }, [getCurrentProfile]);

  return loading && profile === null ? <Spinner/> : <section className="container">
      <h1 className="large text-primary">
          Dashboard
      </h1>
      <p className="lead">
          <i className="fas fa-user">{" "}Welcome {user && user.name}</i>
      </p>
      {profile !== null ? (<section>
          <DashboardActions/>
          <Experience experience={profile.experience}/>
          <Education education={profile.education}/>
          <div className="my-2">
              <button onClick={()=> deleteAccount()} className="btn btn-danger">
                  <i className="fas fa-user-minus"></i> Delete My Account
              </button>
          </div>
          </section>): 
      (<section className="container">
        <p>
            You have not yet setup a profile, please add more info
        </p>
        <Link to="/create-profile" className="btn btn-primary my-1">Create Profile</Link>
      </section>)}
  </section>
};

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    deleteAccount: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    profile: state.profile
})

export default connect(mapStateToProps, {getCurrentProfile, deleteAccount})(Dashboard);
