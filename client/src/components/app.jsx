import React from 'react';
import { withRouter } from 'react-router';
import { Route } from 'react-router-dom';
import Landing from './landing.jsx';
import Create from './create.jsx';
import Dashboard from './dashboard.jsx';
import Analytics from './analytics.jsx';
import Live from './live.jsx';
import Login from './login.jsx';
import ResponseClient from './responseClient';
import firebase from '../config.js';
// require('../auth.js');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      email: null,
      userId: null
    };
    this.logout = this.logout.bind(this);
  }

  logout() {
    firebase.auth().signOut()
      .then(() => this.props.history.push('/login'))
      .then(() => this.setState({user: null, email: null}))
      .catch(err => console.log('firebase auth error!'));
  }

  returnToDash = () => {
    this.props.history.push('/dashboard');
  }

  componentDidMount() {
    const initApp = () => {
      firebase.auth().onAuthStateChanged(user => {
        console.log('firebase auth: current user is', user);
        if (user) {
          console.log(user.displayName);
          console.log(user.email);
          this.setState({ user: user.displayName, email: user.email, userId: user.uid });
        } else {
          // document.getElementById('sign-in-status').textContent = 'Signed out';
          // document.getElementById('sign-in').textContent = 'Sign in';
          // document.getElementById('account-details').textContent = 'null';
        }
      }, err => console.log(err));
    };
    window.addEventListener('load', () => initApp());
  }
  
  render() {
    let user = this.state.user;
    let email = this.state.email || 'no email';
    let userId = this.state.userId;
    return (
      <div>
        <Route exact path="/" render={props => <Landing {...props} vote={this.vote} user={user} />} />
        <Route exact path="/create" render={(props) => <Create {...props} user={user} userId={userId} logout={this.logout}/>} />
        <Route exact path="/edit/:pollId" render={(props) => <Create {...props} user={user} userId={userId} logout={this.logout} returnToDash={this.returnToDash}/>} />
        <Route exact path="/dashboard" render={props => <Dashboard {...props} user={user} userId={userId} logout={this.logout} /*history={this.props.history}*/ />} />
        <Route exact path="/analytics/:id" render={({match}) => <Analytics match={match} user={user} logout={this.logout} />} />
        <Route exact path="/live/:id" render={props => <Live {...props} user={user} email={email}/>} />
        <Route exact path="/login" render={props => <Login {...props} />} />
        <Route exact path="/response/:id" render={props => <ResponseClient {...props} userId={userId} /> } />
        {/* <Route exact path="/polls/:id" render={props => <Register {...props} />} /> */}
        {/* <AuthRoute exact path="/auth" component={Auth} /> */}
        {/* <PollAudienceClientTest />  enter any nonexistent route to render your test components */}
        {/* <PollManagerClientTest /> */}
      </div>
    )
  }
}

export default withRouter(App);