import './App.css';

import HomePage from './components/HomePage';
import { Fragment } from 'react';

function App() {
  return (
    <Fragment>
      <div className="body">
        <HomePage />
      </div>
    </Fragment>
  );
}

export default App;
