import { useState } from 'react';
import "./App.pcss";
import Home from './Home';
import Nav from './Nav';
import Tools from './Tools';


const pathToView: { [name: string]: JSX.Element } = {
	"home": <Home />,
	// "stats": Stats,
	"tools": <Tools />
};


function App() {

  const [tab, setTab] = useState("home");

  return (
    <div className="App">
      <header>
        <h3>统计工具</h3>
      </header>
      <Nav curtab={tab} setTab={setTab}></Nav>
      <main>
        {pathToView[tab]}
      </main>
      <footer>
        some footer
      </footer>
    </div>
  );
}

export default App;
