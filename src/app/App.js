import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from '../pages/login.page';
import Register from '../pages/register.page';
import Home from '../pages/home.page';
import useToken from './useToken';

import '../fontAwesome';

function App() {
  const { token, setToken } = useToken();

  if (!token) {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/login'>
            <Login setToken={setToken} />
          </Route>
          <Route path='/register'>
            <Register setToken={setToken} />
          </Route>
        </Switch>
        <Redirect to='/login' />
      </BrowserRouter>
    );
  }

  return (
    <div className='wrapper'>
      <Home />
        
    </div>
  );
}

export default App;
