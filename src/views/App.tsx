import "./App.pcss";
import Home from './Home';
import Tools from './Tools';


let pathToView: { [name: string]: Object } = {
	"home": Home,
	// "stats": Stats,
	"tools": Tools
};


function App() {

  return (
    <div className="App">
      <header>
        <h3>统计工具</h3>
      </header>
      <nav></nav>
      <main>
      </main>
      <footer>
        some footer
      </footer>
    </div>
  );
}

export default App;
